# python manage.py update_revised_annotations

import django
from django.core.exceptions import ObjectDoesNotExist
from genes.models import *
import csv


def run(*args):
    ED = 0 # keep track of edited genes
    NF = 0
    # curMode = ..
    modes = ['', '']
    curInd = 0# increment as we have encountered modes
    with open('name_rev_anns.csv') as f:
        lines = csv.reader(f)
        for line in lines:
            # if line[0] == mode[curInd]:
            #     curMode = mode[curInd]
            stripped_names = [name.strip() for name in line]
            if stripped_names[0] == stripped_names[1]:
                continue # nothing to update anyway

            try:
                gene_to_edit = Gene.objects.get(rev_ann=
                                                stripped_names[0])
                gene_into = Gene.objects.get(rev_ann=
                                                stripped_names[1])
                print(str(gene_to_edit)+'\t'+str( gene_into))
                # gene_to_edit.rev_ann = stripped_names[1]
                # gene_to_edit.save()
                ED += 1
            except ObjectDoesNotExist:
                # print("Could not find any gene called ", stripped_names[0])
                NF +=1 

    print("Edited %s genes" % ED, "\nCould not find %s genes" % NF)
    
