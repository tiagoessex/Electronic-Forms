# Generated by Django 3.1.7 on 2021-08-27 15:01

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import operations.models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('designer', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Operation',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=80, null=True)),
                ('description', models.CharField(max_length=250, null=True)),
                ('date_creation', models.DateTimeField(auto_now_add=True)),
                ('date_updated', models.DateTimeField(auto_now_add=True)),
                ('author', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='operation_author', to=settings.AUTH_USER_MODEL, verbose_name='author')),
                ('form', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='designer.form', verbose_name='form')),
                ('status', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='designer.status', verbose_name='status')),
                ('updated_by', models.ForeignKey(blank=True, db_column='updated_by', null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='operation_updated_by', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'operation',
            },
        ),
        migrations.CreateModel(
            name='OperationData',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('data', models.JSONField(blank=True, null=True)),
                ('operation', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='operations.operation', verbose_name='operation')),
            ],
            options={
                'verbose_name_plural': 'Operations Data',
                'db_table': 'operation_data',
            },
        ),
        migrations.CreateModel(
            name='OperationAsset',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=80)),
                ('date', models.DateTimeField(auto_now_add=True)),
                ('asset', models.FileField(upload_to=operations.models.operation_asset_path_file_name)),
                ('operation', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='operation_asset_related_name', to='operations.operation')),
                ('type', models.ForeignKey(blank=True, default=1, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='operations_operationasset_related', to='designer.assettype')),
            ],
            options={
                'db_table': 'operation_asset',
                'abstract': False,
            },
        ),
    ]