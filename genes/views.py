from django.shortcuts import render
from django.http import HttpResponse
from django.template import loader

from genes.models import *

import json
import csv
from collections import Counter
from datetime import datetime

# notes to self:
# Look at StreamingHttpResponse for streaming/generating large CSV files
# Look at gene select
# 
#AUX FUNC
def cond_satisf(gene, conds):
    """Given a list with 3 2-tuples for Jan, GTE, TCGAN expression, respectively, 
    checks if gene satisfies conditions"""
    return all([conds[0][0] <= gene.Jan_expr <= conds[0][1],
                conds[1][0] <= gene.GTE_expr <= conds[1][1],
                conds[2][0] <= gene.TCGAN_expr <= conds[2][1]])
    

#VIEW FUNC
def base(request):
    """View that serves the standard website"""

    # template = loader.get_template('genes/base.html' )
    # response = HttpResponse(template.render))    
    # response['age'] = 120
    # print("AM i here?")
    return render(request, 'genes/base.html')


def filter_gene_indices(request):
    print("Here, request taken")
    conds_str = request.GET["conds"]
    conds_str = conds_str.replace('13', '20') # In case 13 is present, accepts any
    # gene with expression lower than 20 (max possible gene expression in
    # our database (to prevent mismatch because some genes are not presented on
    # graph)
    bruggeman= Database.objects.get(name="bruggeman_et_al")
    conds = []
    for t in conds_str.split('-'):
        t_splitted = t.split(',')
        conds.append((float(t_splitted[0]), float(t_splitted[1])))
    print(conds)

    # Filter bruggeman genes based on provided conds
    brug = set(g.id for g in bruggeman.genes.all() if
               cond_satisf(g, conds))
               # conds[0][0] <= g.Jan_expr <=conds[0][1]
               # and conds[1][0] <= g.GTE_expr <=conds[1][1]
               # and conds[2][0] <= g.TCGAN_expr <=conds[2][1])
    
    wang = set(g.id for g in Database.objects.get(
        name="wang_et_al").genes.all())
    ct_db = set(g.id for g in Database.objects.get(name="ct_db").genes.all())
    
    brug_wang = brug.intersection(wang)
    brug_ct_db = brug.intersection(ct_db)
    # Return in format sizes: 1, 4, 6, 7
    print(len(brug))
    return HttpResponse(json.dumps([len(brug), len(brug_ct_db), len(brug_wang), 
                                    len(brug_wang.intersection(brug_ct_db))]))

def generate_csv(request):
    """Genereates csv file given the current selection criteria"""
    conds_str = request.GET["conds"]
    conds_str = conds_str.replace('13', '20') # See above
    conds = []
    bruggeman= Database.objects.get(name="bruggeman_et_al")

    for t in conds_str.split('-'):
        t_splitted = t.split(',')
        conds.append((float(t_splitted[0]), float(t_splitted[1])))


    response = HttpResponse(content_type='text/csv')#content_type='csv')# content_type="text/csv",
    # response['Content-Type'] = 'csv'
    response['Content-Disposition'] = ("attachment;filename=Bruggeman_GC_genes_%s.csv" %
                                       datetime.now().strftime("%b_%d_%Y_%H.%M").lower())

    writer = csv.writer(response)
    # Filter bruggeman genes based on provided conds
    brug_genes = set(g for g in bruggeman.genes.all() if cond_satisf(g, conds))
                     # conds[0][0] <= g.Jan_expr <=conds[0][1]
                     # and conds[1][0] <= g.GTE_expr <=conds[1][1]
                     # and conds[2][0] <= g.TCGAN_expr <=conds[2][1])
    
    wang_genes = Database.objects.get(name="wang_et_al").genes.all()
    ct_db_genes = Database.objects.get(name="ct_db").genes.all()
    
    brug_wang = brug_genes.intersection(wang_genes)
    brug_ct_db = brug_genes.intersection(ct_db_genes)

    # wang_ct_db = wang.intersection(ct_db)

    ct_db_member = Counter(brug_wang)
    wang_member = Counter(brug_ct_db)

    # brug_sorted = sorted(brug_genes, key=lambda g: (wang_member[g],
    #                                                 ct_db_member[g]))
    # sort based on name
    brug_sorted = sorted(brug_genes, key=lambda g: g.rev_ann)
    print(len(brug_sorted))
    with open('full_gene_rows.txt', 'r') as f:
        name_row_dic = json.load(f)
    writer.writerow(name_row_dic['HEADER'])
    for g in brug_sorted:
        writer.writerow(name_row_dic[g.rev_ann])

    return response
    

    
