# python manage.py write_gene_rows --script-args filedest
# Writes a json-formatted text file that can be accessed by download function to
# quickly write the pre-formatted rows upon request
import django
import json
import csv
from genes.models import *
from collections import Counter
def run(*args):
    # conds_str = request.GET["conds"]
    # conds = []
    # for t in conds_str.split('-'):
    #     t_splitted = t.split(',')
    #     conds.append((float(t_splitted[0]), float(t_splitted[1])))

    # response = HttpResponse(content_type="text/csv")
    # response['Content-Disposition'] = 'attachment; file="somefilename.csv"'

    # writer.writerow(['Gene name',
    #                  'Germ cell expression (filtered %s max expr < conds %s)' % (
    #                      conds[0][0], conds[0][1]),
    #                  'Somatic cell expression (filtered %s max expr < conds %s)' % (
    #                      conds[1][0], conds[1][1]),
    #                  'Cancerous cell expression (filtered %s max expr < conds %s)' % (
    #                      conds[2][0], conds[2][1]),
    #                  'Previously identified by Wang et al.',
    #                  'Previously identified in CT databse'])

    # Filter bruggeman genes based on provided conds
    brug_genes = Database.objects.get(name="bruggeman_et_al").genes.all()
    # set(g for g in Gene.objects.all() if
                 #     conds[0][0] <= g.Jan_expr <=conds[0][1]
                 #     and conds[1][0] <= g.GTE_expr <=conds[1][1]
                 #     and conds[2][0] <= g.TCGAN_expr <=conds[2][1])
    
    wang_genes = Database.objects.get(name="wang_et_al").genes.all()
    ct_db_genes = Database.objects.get(name="ct_db").genes.all()
    
    brug_wang = brug_genes.intersection(wang_genes)
    brug_ct_db = brug_genes.intersection(ct_db_genes)

    # wang_ct_db = wang.intersection(ct_db)

    ct_db_member = Counter(brug_wang)
    wang_member = Counter(brug_ct_db)

    brug_sorted = sorted(brug_genes, key=lambda g: (wang_member[g],
                                                    ct_db_member[g]))
    out_dic = dict()
    for g in brug_sorted:
        out_dic[g.rev_ann] = [g.rev_ann, g.Jan_expr, g.GTE_expr, g.TCGAN_expr,
                         wang_member[g], ct_db_member[g]]
        # writer.writerow([g.rev_ann, g.Jan_expr, g.GTE_expr, g.TCGAN_expr,
        #                  wang_member[g], ct_db_member[g]])
    with open(args[0], 'w') as f:
        f.write(json.dumps(out_dic))

    
