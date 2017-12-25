from django.urls import path

from genes.views import *


urlpatterns = [
    path('', base, name='base'),

# AJAX REQUESTS
    path('requests/', filter_gene_indices, name='filter_gene_indices'),

    
]

