# Generated by Django 2.0 on 2017-12-24 22:01

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('genes', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Database',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=30)),
            ],
        ),
        migrations.RemoveField(
            model_name='gene',
            name='univ_name',
        ),
        migrations.AddField(
            model_name='gene',
            name='rev_ann',
            field=models.CharField(default='', max_length=10, unique=True),
        ),
        migrations.AddField(
            model_name='database',
            name='genes',
            field=models.ManyToManyField(to='genes.Gene'),
        ),
    ]
