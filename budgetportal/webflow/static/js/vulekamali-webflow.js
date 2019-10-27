(function() {

    // MapBox
    var accessToken = 'pk.eyJ1IjoiamJvdGhtYSIsImEiOiJjazF3aXZ3NnYwMjU4M29udWppMWp6enVxIn0.yGE8zxBnb4g6A1QadgGY7g'
    var provinceCode = {
        "Eastern Cape": "EC",
        "Free State": "FS",
        "Gauteng": "GT",
        "KwaZulu-Natal": "KZN",
        "Limpopo": "LIM",
        "Mpumalanga": "MP",
        "North West": "NW",
        "Northern Cape": "NC",
        "Western Cape": "WC"
    };
    var levelToCode = {
        "Local Municipality": "MN",
        "Metro Municipality": "MN",
        "District Municipality": "DC"
    };

    function formatCurrency(decimalString) {
        if (decimalString == null)
            return "";
        return "R " + Math.round(parseFloat(decimalString)).toLocaleString();
    }

    function createTileLayer() {
        return L.tileLayer('//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
            maxZoom: 18,
            subdomains: 'abc',
        });
    }

    function initPointMap(lat, lon) {
        var map = L.map("project-location-map-container")
            .setView([lat, lon], 13);
        createTileLayer().addTo(map);
        return map;
    }

    function initMuniMap(lat, lon) {
        var map = L.map("project-municipal-context-map-container")
            .setView([lat, lon], 7);
        createTileLayer().addTo(map);
        return map;
    }

    function addProvinceToMap(map, provinceName) {
        $.get("https://mapit.code4sa.org/area/MDB:" + provinceCode[provinceName] +
              "/feature.geojson?generation=2&simplify_tolerance=0.01")
            .done(function(response) {
                var layer = L.geoJSON(response, {
                    weight: 1,
                    "fillColor": "#66c2a5",
                    "fillOpacity": 0.3,
                })
                    .addTo(map)
                    .bindTooltip(function (layer) {
                        return layer.feature.properties.name + " Province";
                    }).addTo(map);

                map.fitBounds(layer.getBounds());
            })
            .fail(function(jqXHR, textStatus, errorThrown) {
                console.error( jqXHR, textStatus, errorThrown );
            });
    }

    function addMuniToMap(map, provinceName, level, muniName) {
        var levelCode = levelToCode[level];
        $.get("https://mapit.code4sa.org/areas/MDB-levels:PR-" + provinceCode[provinceName] +
              "|" + levelCode + ".geojson?generation=2&simplify_tolerance=0.01")
            .done(function(response) {
                var munis = response.features.filter(function(feature) {
                    return feature.properties.name === muniName;
                });
                if (munis.length) {
                    var muni = munis[0]; // Assume no duplicate names in a province
                    var layer = L.geoJSON(muni, {
                        weight: 1,
                        "fillColor": "#66c2a5",
                        "fillOpacity": 0.3,
                    })
                        .addTo(map)
                        .bindTooltip(function (layer) {
                            return layer.feature.properties.name + " " + level;
                        }).addTo(map);
                } else {
                    console.info("Couldn't find muni " + muniName + " by name in province");
                }
            })
            .fail(function(jqXHR, textStatus, errorThrown) {
                console.error( jqXHR, textStatus, errorThrown );
            });
    }


    if ($("body.provincial-infrastructure-project-detail-page").length) {
        var project = pageData.project;

        // Project definition
        $(".name-field").html(project.name);
        $(".project-number-field").html(project.project_number);
        $(".budget-programme-field").html(project.budget_programme);
        $(".nature-of-investment-field").html(project.nature_of_investment);

        // Administrative details
        $(".primary-funding-source-field").html(project.primary_funding_source);
        $(".funding-status-field").html(project.funding_status);
        $(".province-field").html(project.province);
        $(".department-field").html(project.department);

        // Location
        $(".local-municipality-field").html(project.local_municipality);
        $(".district-municipality-field").html(project.district_municipality);
        $(".coordinates-field").html(project.latitude + ", " + project.longitude);

        // Implementation
        $(".program-implementing-agent-field").html(project.program_implementing_agent);
        $(".principle-agent-field").html(project.principle_agent);
        $(".main-contractor-field").html(project.main_contractor);
        $(".other-service-providers-field").html(project.other_parties);

        // Dates
        $(".status-field").html(project.status);
        $(".start-date-field").html(project.start_date);
        $(".estimated-construction-start-date-field").html(project.estimated_construction_start_date);
        $(".estimated-completion-date-field").html(project.estimated_completion_date);
        $(".contracted-construction-end-date-field").html(project.contracted_construction_end_date);
        $(".estimated-construction-end-date-field").html(project.estimated_construction_end_date);

        // Budgets and spending
        $(".total-project-cost-field").html(formatCurrency(project.total_project_cost));
        $(".total-professional-fees-field").html(formatCurrency(project.total_professional_fees));
        $(".total-construction-costs-field").html(formatCurrency(project.total_construction_costs));
        $(".variation-orders-field").html(formatCurrency(project.variation_orders));
        $(".expenditure-from-previous-years-professional-fees-field").html(formatCurrency(project.expenditure_from_previous_years_professional_fees));
        $(".expenditure-from-previous-years-construction-costs-field").html(formatCurrency(project.expenditure_from_previous_years_construction_costs));
        $(".expenditure-from-previous-years-total-field").html(formatCurrency(project.expenditure_from_previous_years_total));
        $(".project-expenditure-total-field").html(formatCurrency(project.project_expenditure_total));
        $(".main-appropriation-professional-fees-field").html(formatCurrency(project.main_appropriation_professional_fees));
        $(".adjustment-appropriation-professional-fees-field").html(formatCurrency(project.adjustment_appropriation_professional_fees));
        $(".main-appropriation-construction-costs-field").html(formatCurrency(project.main_appropriation_construction_costs));
        $(".adjustment-appropriation-construction-costs-field").html(formatCurrency(project.adjustment_appropriation_construction_costs));
        $(".main-appropriation-total-field").html(formatCurrency(project.main_appropriation_total));
        $(".adjustment-appropriation-total-field").html(formatCurrency(project.adjustment_appropriation_total));
        $(".actual-expenditure-q1-field").html(formatCurrency(project.actual_expenditure_q1));
        $(".actual-expenditure-q2-field").html(formatCurrency(project.actual_expenditure_q2));
        $(".actual-expenditure-q3-field").html(formatCurrency(project.actual_expenditure_q3));
        $(".actual-expenditure-q4-field").html(formatCurrency(project.actual_expenditure_q4));

        // Maps and visualisations
        $(".embed-container").css("background-color", "#e1e1e1");

        if (project.latitude !== null & project.longitude !== null) {
            var locationMap = initPointMap(project.latitude, project.longitude);
            var marker = L.marker([project.latitude, project.longitude]).addTo(locationMap);

        }

        $.get("https://mapit.code4sa.org/area/MDB:" + provinceCode[project.province] + "/geometry")
            .done(function(response) {
                var muniMap = initMuniMap(response.centre_lat, response.centre_lon);

                addProvinceToMap(muniMap, project.province);

                if (project.district_municipality === project.local_municipality
                    & project.district_municipality != null) {
                    addMuniToMap(muniMap, project.province, "Metro Municipality", project.local_municipality);
                } else {
                    if (project.district_municipality != null)
                        addMuniToMap(muniMap, project.province, "District Municipality", project.district_municipality);
                    if (project.local_municipality != null)
                        addMuniToMap(muniMap, project.province, "Local Municipality", project.local_municipality);
                }
            })
            .fail(function(jqXHR, textStatus, errorThrown) {
                console.error(jqXHR, textStatus, errorThrown);
            });
    }  // end project page

    if ($("#Infrastructure-Search-Input").length) {

        /** Get templates of dynamically inserted elements **/

        var resultRowTemplate = $("#result-list-container .narrow-card_wrapper:first").clone();
        resultRowTemplate.find(".narrow-card_icon").remove();

        var dropdownItemTemplate = $("#province-dropdown * .dropdown-link:first");
        dropdownItemTemplate.find(".search-status").removeClass("active");
        dropdownItemTemplate.find(".search-dropdown_label").text("");
        dropdownItemTemplate.find(".search-dropdown_value").text("");


        /** initial page state **/

        var location = "/api/v1/infrastructure-projects/provincial/search/facets";
        var params = new URLSearchParams();

        function loadNewParams(url) {
            var parts = url.split('?');
            var location = parts[0];
            var queryString = parts[1];
            params = new URLSearchParams(queryString);
        }

        function buildSearchURL() {
            return location + "?" + params.toString();
        }

        function resetResults() {
            $("#num-matching-projects-field").text("");
            $("#result-list-container .narrow-card_wrapper").remove()
            resetDropdown("#province-dropdown");
            resetDropdown("#department-dropdown");
            resetDropdown("#status-dropdown");
            resetDropdown("#funding-source-dropdown");
        }

        function updateFreeTextParam() {
            params.set("q", $("#Infrastructure-Search-Input").val());
        }

        function search() {
            var url = buildSearchURL();
            $.get(url)
                .done(function(response) {
                    loadNewParams(url);

                    $("#num-matching-projects-field").text(response.objects.count);
                    updateDropdown("#province-dropdown", response.fields, params, "province");
                    updateDropdown("#department-dropdown", response.fields, params, "department");
                    updateDropdown("#status-dropdown", response.fields, params, "status");
                    updateDropdown("#funding-source-dropdown", response.fields, params, "primary_funding_source");


                    response.objects.results.forEach(function(project) {
                        var resultItem = resultRowTemplate.clone();
                        resultItem.attr("href", project.url_path);
                        resultItem.find(".narrow-card_title").html(project.name);
                        resultItem.find(".narrow-card_middle-column:first").html(project.status);
                        resultItem.find(".narrow-card_middle-column:last").html(project.estimated_completion_date);
                        resultItem.find(".narrow-card_last-column").html(formatCurrency(project.total_project_cost));
                        $("#result-list-container").append(resultItem);
                    });
                })
                .fail(function(jqXHR, textStatus, errorThrown) {
                    alert("Something went wrong when searching. Please try again.");
                    console.error( jqXHR, textStatus, errorThrown );
                });
        }

        function updateSearch() {
            resetResults();
            // maybe create new params from facet narrowing URL here?
            updateFreeTextParam();
            search();
        }

        function resetDropdown(selector) {
            $(selector).find(".text-block").text("");
            $(selector).find(".dropdown-link").remove();
        }

        function getSelectedOption(params, fieldName) {
            var selectedFacets = params.getAll("selected_facets");
            console.log(selectedFacets);
        }

        function updateDropdown(selector, fields, params, fieldName) {
            var container = $(selector);
            var optionContainer = container.find(".chart-dropdown_list");
            options = fields[fieldName];
            selectedOption = getSelectedOption(params, fieldName);
            fields[fieldName].forEach(function (option) {
                optionElement = dropdownItemTemplate.clone();
                optionElement.find(".search-dropdown_label").text(option.text);
                optionElement.find(".search-dropdown_value").text("(" + option.count + ")");
                optionContainer.append(optionElement);
            });
        }


        /** Set up search triggering events **/

        $("#Infrastructure-Search-Input").keypress(function (e) {
            var key = e.which;
            if (key == 13) {  // the enter key code
                updateSearch();
            }
        });
        $("#Search-Button").on("click", updateSearch);


        /** Search on page load **/

        updateSearch()

    } // end search page

})();
