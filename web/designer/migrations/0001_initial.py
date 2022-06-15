# Generated by Django 3.1.7 on 2021-08-26 15:00

import designer.models
from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='AssetType',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=10)),
            ],
            options={
                'db_table': 'asset_type',
            },
        ),
        migrations.CreateModel(
            name='Form',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(blank=True, max_length=50, null=True)),
                ('description', models.CharField(max_length=250, null=True)),
                ('date_created', models.DateTimeField(auto_now_add=True)),
                ('date_updated', models.DateTimeField(auto_now=True, null=True)),
                ('date_locked', models.DateTimeField(blank=True, null=True)),
                ('date_disabled', models.DateTimeField(blank=True, null=True)),
                ('form', models.JSONField(blank=True, null=True)),
                ('author', models.ForeignKey(blank=True, db_column='author', null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='form_author', to=settings.AUTH_USER_MODEL)),
                ('disabled_by', models.ForeignKey(blank=True, db_column='disabled_by', null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='form_disabled_by', to=settings.AUTH_USER_MODEL)),
                ('locked_by', models.ForeignKey(blank=True, db_column='locked_by', null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='form_locked_by', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'form',
            },
        ),
        migrations.CreateModel(
            name='Query',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=80)),
                ('query', models.CharField(max_length=1024)),
                ('date', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name_plural': 'Queries',
                'db_table': 'query',
            },
        ),
        migrations.CreateModel(
            name='Status',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=80)),
                ('description', models.CharField(blank=True, max_length=80, null=True)),
            ],
            options={
                'verbose_name_plural': 'status',
                'db_table': 'status',
            },
        ),
        migrations.CreateModel(
            name='QueryForm',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateTimeField(auto_now=True)),
                ('form', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='form_queryform', to='designer.form')),
                ('query', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='query_queryform', to='designer.query')),
            ],
            options={
                'db_table': 'query_form',
            },
        ),
        migrations.AddField(
            model_name='query',
            name='status',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='designer.status', verbose_name='status'),
        ),
        migrations.CreateModel(
            name='FormAsset',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=80)),
                ('date', models.DateTimeField(auto_now_add=True)),
                ('asset', models.FileField(upload_to=designer.models.form_asset_path_file_name)),
                ('form', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='form_asset_related_name', to='designer.form')),
                ('type', models.ForeignKey(blank=True, default=1, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='designer_formasset_related', to='designer.assettype')),
            ],
            options={
                'db_table': 'form_asset',
                'abstract': False,
            },
        ),
        migrations.AddField(
            model_name='form',
            name='status',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='form', to='designer.status', verbose_name='status'),
        ),
        migrations.AddField(
            model_name='form',
            name='updated_by',
            field=models.ForeignKey(blank=True, db_column='updated_by', null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='form_updated_by', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddConstraint(
            model_name='assettype',
            constraint=models.UniqueConstraint(fields=('name',), name='assettype_name'),
        ),
        migrations.AddConstraint(
            model_name='query',
            constraint=models.UniqueConstraint(fields=('name',), name='query_name'),
        ),
        migrations.AddConstraint(
            model_name='form',
            constraint=models.UniqueConstraint(fields=('name',), name='form_name'),
        ),
    ]
