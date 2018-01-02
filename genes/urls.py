from django.urls import path

from genes.views import *


urlpatterns = [
    path('', base, name='base'),

# AJAX REQUESTS
    # print('not yet'),
    path('requests/', filter_gene_indices, name='filter_gene_indices'),
    # print('
    path('download/', generate_csv, name='generate_csv'),

    
]

