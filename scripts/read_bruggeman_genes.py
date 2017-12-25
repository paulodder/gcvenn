# $ python manage.py read_bruggeman_genes
import django
from django.conf import settings
from django.core.exceptions import ObjectDoesNotExist

import csv
from genes.models import *

def run(*args):
    with open('csv_files/bruggeman_genes.csv', 'r') as f:
        lines = csv.reader(f) 
        n_of_genes_loaded = 0
        try:
            db = Database.objects.get(name="bruggeman_et_al")
        except ObjectDoesNotExist:
            db = Database()
            db.name = "bruggeman_et_al"
            db.save()
            
        for splitted_line in lines:
            if all(len(cell)>0 for cell in splitted_line[:4]): # Check for empty cell
                try:
                    new_gene = Gene.objects.get(rev_ann=splitted_line[0].strip())
                except ObjectDoesNotExist:
                    new_gene = Gene()
                    new_gene.rev_ann = splitted_line[0].strip()
                    new_gene.Jan_expr = float(splitted_line[1].strip())
                    new_gene.GTE_expr = float(splitted_line[2].strip())
                    new_gene.TCGAN_expr = float(splitted_line[3].strip())
                    # Set values and save gene
                    new_gene.save()
                db.genes.add(new_gene)
                   
                n_of_genes_loaded += 1
                if n_of_genes_loaded%500 == 0:
                    print(n_of_genes_loaded)
            
                    
            else:
                continue # Not all expression values are known so leave out
        print("Saved", n_of_genes_loaded, "genes to the database")
