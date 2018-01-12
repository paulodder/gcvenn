# python manage.py update_revised_annotations

import django
from django.core.exceptions import ObjectDoesNotExist
from genes.models import *
import csv


def run(*args):
    ED = 0 # keep track of edited genes
    NF = 0
    wang = Database.objects.get(name='wang_et_al')
    CT = Database.objects.get(name='ct_db')
    # curMode = ..
    curInd = 0# increment as we have encountered modes
    with open('csv_files/gene_mappings.csv') as f:
        lines = csv.reader(f)
        for line in lines:

            # if line[0] == mode[curInd]:
            #     curMode = mode[curInd]
            stripped_names = [name.strip() for name in line]
            if stripped_names[0] == stripped_names[1]:
                try:
                    gene = Gene.objects.get(rev_ann=stripped_names[0])
                except:
                    gene = Gene()
                    gene.rev_ann = stripped_names[0]
                    # Gene.objects.get(rev_ann=stripped_names[0])
                    gene.save()
                if stripped_names[2] == 'WANG':
                    wang.genes.add(gene)
                if stripped_names[2] == 'CT':
                    CT.genes.add(gene)
                continue # nothing to update anyway
            try:
                print(stripped_names[2])
                gene_to_edit = Gene.objects.get(rev_ann=stripped_names[0])

                try:
                    gene_into = Gene.objects.get(rev_ann=
                                                 stripped_names[1])
                    gene_into_dbs = gene_into.database_set.all()
                    gene_into.delete() # delete other instance before
                    # renaming to prevent unique_constraing error
                except ObjectDoesNotExist:
                    gene_into_dbs = []
                    pass

                gene_to_edit.rev_ann = stripped_names[1]
                for db in gene_into_dbs:# copy databse info from  prev
                    # gene
                    db.genes.add(gene_to_edit)
                print(stripped_names[2])
                if stripped_names[2] == 'WANG':
                    print('here')
                    wang.genes.add(gene_to_edit)
                if stripped_names[2] == 'CT':
                    print('here')
                    CT.genes.add(gene_to_edit)
                ED += 1
                gene_to_edit.save()
                
            except ObjectDoesNotExist:
                # print("Could not find any gene called ", stripped_names[0])
                try:
                    gene_into = Gene.objects.get(rev_ann=
                                                 stripped_names[1])

                    if stripped_names[2] == 'WANG':
                        wang.genes.add(gene_into)
                    if stripped_names[2] == 'CT':
                        CT.genes.add(gene_into)
                    gene_into.save()
                except ObjectDoesNotExist:
                    new_gene = Gene()
                    new_gene.rev_ann = stripped_names[1]
                    new_gene.save()
                    if stripped_names[2] == 'WANG':
                        wang.genes.add(new_gene)
                    if stripped_names[2] == 'CT':
                        CT.genes.add(gene_into)
                    new_gene.save()
                    NF += 1
                    pass
                    
                    

            # try:
            #     gene_to_edit = Gene.objects.get(rev_ann=
            #                                     stripped_names[0])
            # except ObjectDoesNotExist:
            #     # print("Could not find any gene called ", stripped_names[0])
            #     NF +=1 
                
            #     # gene_into = Gene.objects.get(rev_ann=
            #     #                                 stripped_names[1])
            #     if stripped_names[2] == 'WANG':
            #         gene_into
            #     print(str(gene_to_edit)+'\t'+str( gene_into))
            #     # gene_to_edit.rev_ann = stripped_names[1]
            #     # gene_to_edit.save()
            #     ED += 1

    print("Edited %s genes" % ED, "\nCould not find %s genes" % NF)
    
