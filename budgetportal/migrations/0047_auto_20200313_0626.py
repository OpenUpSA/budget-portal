# Generated by Django 2.2.10 on 2020-03-13 06:26

import autoslug.fields
from django.db import migrations, models
import django.db.models.deletion


def set_sphere(apps, schema_editor):
    IRMSnapshot = apps.get_model('budgetportal', 'IRMSnapshot')
    Sphere = apps.get_model('budgetportal', 'Sphere')
    for row in IRMSnapshot.objects.raw('SELECT id, financial_year_id FROM budgetportal_irmsnapshot'):
        print(row)
        instance = IRMSnapshot.objects.get(id=row.id)
        instance.sphere = Sphere.objects.get(slug="provincial", financial_year=row.financial_year_id)
        instance.save(update_fields=['sphere'])


class Migration(migrations.Migration):

    dependencies = [
        ('budgetportal', '0046_auto_20200309_1546'),
    ]

    operations = [
        migrations.RenameModel(
            old_name='ProvInfraProject',
            new_name='InfraProject',
        ),
        migrations.RenameModel(
            old_name='ProvInfraProjectSnapshot',
            new_name='InfraProjectSnapshot',
        ),
        migrations.AlterModelOptions(
            name='infraproject',
            options={'verbose_name': 'Infrastructure project'},
        ),
        migrations.AlterModelOptions(
            name='infraprojectsnapshot',
            options={'get_latest_by': 'irm_snapshot', 'ordering': ['irm_snapshot__sphere__financial_year__slug', 'irm_snapshot__quarter__number'], 'verbose_name': 'Infrastructure project snapshot'},
        ),
        migrations.AlterModelOptions(
            name='irmsnapshot',
            options={'ordering': ['sphere__financial_year__slug', 'quarter__number'], 'verbose_name': 'IRM Snapshot'},
        ),
        migrations.AddField(
            model_name='irmsnapshot',
            name='sphere',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='budgetportal.Sphere'),
        ),
        migrations.RunPython(set_sphere, reverse_code=migrations.RunPython.noop),
        migrations.AlterField(
            model_name='irmsnapshot',
            name='sphere',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='budgetportal.Sphere'),
        ),
        migrations.AlterUniqueTogether(
            name='irmsnapshot',
            unique_together={('sphere', 'quarter')},
        ),
        migrations.RemoveField(
            model_name='irmsnapshot',
            name='financial_year',
        ),
    ]
