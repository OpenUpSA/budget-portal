"""
Abstracts away some of the mechanics of querying OpenSpending and some of the
conventions of how we name fields in our Fiscal Data Packages.
"""
from django.conf import settings
from pprint import pformat
import logging
import random
import requests
import re

logger = logging.getLogger(__name__)

PAGE_SIZE = 300


class EstimatesOfExpenditure():
    def __init__(self, model_url):
        self.session = requests.Session()

        self.cube_url = cube_url(model_url)
        model_result = self.session.get(model_url)
        logger.info(
            "request to %s took %dms",
            model_url,
            model_result.elapsed.microseconds / 1000
        )
        model_result.raise_for_status()
        self.model = model_result.json()['model']

    # These make assumptions about the OS Types we give Estimes of Expenditure
    # columns, and the level of which hierarchy they end up in.

    def get_dimension(self, hierarchy_name, level=0):
        return self.model['hierarchies'][hierarchy_name]['levels'][level]

    def get_ref(self, dimension_name, ref_type):
        return self.model['dimensions'][dimension_name][ref_type + "_ref"]

    def get_programme_name_ref(self):
        return self.get_ref(self.get_programme_dimension(), 'label')

    def get_programme_number_ref(self):
        return self.get_ref(self.get_programme_dimension(), 'key')

    def get_programme_dimension(self):
        return self.get_dimension('activity')

    def get_department_name_ref(self):
        return self.get_ref(self.get_department_dimension(), 'label')

    def get_vote_number_ref(self):
        return self.get_ref(self.get_department_dimension(), 'key')

    def get_department_dimension(self):
        return self.get_dimension('administrative_classification')

    def get_geo_ref(self):
        return self.get_ref(self.get_geo_dimension(), 'label')

    def get_geo_dimension(self):
        return self.get_dimension('geo_source')

    def get_financial_year_ref(self):
        return self.get_ref(self.get_financial_year_dimension(), 'label')

    def get_financial_year_dimension(self):
        return self.get_dimension('date')

    def get_function_ref(self):
        return self.get_ref(self.get_function_dimension(), 'label')

    def get_function_dimension(self):
        return self.get_dimension('functional_classification')

    def get_phase_ref(self):
        return self.get_ref(self.get_phase_dimension(), 'label')

    def get_phase_dimension(self):
        return self.get_dimension('phase')

    def get_econ_class_1_ref(self):
        return self.get_ref(self.get_econ_class_1_dimension(), 'key')

    def get_econ_class_1_dimension(self):
        return self.get_dimension('economic_classification')

    def get_econ_class_2_ref(self):
        return self.get_ref(self.get_econ_class_2_dimension(), 'key')

    def get_econ_class_2_dimension(self):
        return self.get_dimension('economic_classification', level=1)

    def aggregate(self, cuts=None, drilldowns=None):
        params = {
            'pagesize': PAGE_SIZE,
        }
        if settings.BUST_OPENSPENDING_CACHE:
            params['cache_bust'] = random.randint(1, 1000000)

        if cuts is not None:
            params['cut'] = "|".join(cuts)
        if drilldowns is not None:
            params['drilldown'] = "|".join(drilldowns)
        aggregate_url = self.cube_url + 'aggregate/'
        aggregate_result = self.session.get(aggregate_url, params=params)
        logger.info(
            "request %s with query %r took %dms",
            aggregate_result.url,
            pformat(params),
            aggregate_result.elapsed.microseconds / 1000
        )
        aggregate_result.raise_for_status()
        if aggregate_result.json()['total_cell_count'] > PAGE_SIZE:
            raise Exception("More cells than expected - perhaps we should start paging")
        return aggregate_result.json()


def cube_url(model_url):
    return re.sub('model/?$', '', model_url)