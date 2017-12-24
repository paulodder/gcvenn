# $ python manage.py read_bruggeman_genes.py
import django
from django.conf import settings
import csv
from genes.models import *

def run(*args):
    with open('csv_files/bruggeman_genes.csv', 'r') as f:
        lines = f.readlines()[2:] # Skip first two lines (header info etc.)
        n_of_genes_loaded = 0
        for line in lines:
            splitted_line = line.split(',')
            if all(len(cell)>0 for cell in splitted_line[:4]):
                   new_gene = Gene()
                   new_gene.univ_name = splitted_line[0]
                   new_gene.Jan_expr = float(splitted_line[1])
                   new_gene.GTE_expr = float(splitted_line[2])
                   new_gene.TCGAN_expr = float(splitted_line[3])
                   # Set values and save gene
                   new_gene.save()
                   n_of_genes_loaded += 1
                   if n_of_genes_loaded%500 == 0:
                       print(n_of_genes_loaded)
            
                   
            else:
                   continue # Not all expression values are known so leave out
        print("Saved", n_of_genes_loaded, "genes to the database")
