# python manage.py runscript write_expression_interval_tsv. --script-args dest_name
# Columns: expr_val    ids_jan    ids_gte    ids_tcgan
import django
from genes.models import *
import numpy as np

IV = 0.01 # interval


def run(*args):
    filedest = args[0]
    global IV
    expr_dic = dict()
    bruggeman_db = Database.objects.get(name="bruggeman_et_al")
    for gene in bruggeman_db.genes.all():
        gene_id = str(gene.id)
        expr_jan_interv = round(gene.Jan_expr//IV)*IV
        expr_gte_interv = round(gene.GTE_expr//IV)*IV
        expr_tcgan_interv = round(gene.TCGAN_expr//IV)*IV        
        if expr_jan_interv not in expr_dic.keys():
            expr_dic[expr_jan_interv] = [[], [], []]
        expr_dic[expr_jan_interv][0].append(gene_id)

        if expr_gte_interv not in expr_dic.keys():
            expr_dic[expr_gte_interv] = [[], [], []]
        expr_dic[expr_gte_interv][0].append(gene_id)

        if expr_tcgan_interv not in expr_dic.keys():
            expr_dic[expr_tcgan_interv] = [[], [], []]
        expr_dic[expr_tcgan_interv][0].append(gene_id)
    
    with open('genes/static/js/' + filedest, 'w') as f:
        f.write('expr_val\tids_jan\tids_gte\tids_tcgan\n')
        for interv in sorted(expr_dic.keys()):
            f.write("%s\t%s\t%s\t%s\n" % (interv,
                                        ','.join(expr_dic[interv][0]),
                                        ','.join(expr_dic[interv][1]),
                                        ','.join(expr_dic[interv][2])))
    

        
