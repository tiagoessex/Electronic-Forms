# Generated by Django 3.1.7 on 2021-10-18 09:00

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('designer', '0005_delete_queryform'),
    ]

    operations = [
        migrations.AddField(
            model_name='query',
            name='description',
            field=models.CharField(blank=True, max_length=128, null=True),
        ),
    ]