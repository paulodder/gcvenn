# python manage.py runscript write_expressions_tsv.py --script-args <name of
# output file> <interval>
import django
from genes.models import *

from collections import Counter
import numpy as np
IV = 0.2
def run(*args):
    global IV
    # output_file = args[0]
    # interv = round(float(args[1]), 2)
    interv = IV
    all_genes = Gene.objects.all()
    jan_expr_values = Counter([round((gene.Jan_expr//interv)*interv, 2) for
                               gene in all_genes])
    gte_expr_values = Counter([round((gene.GTE_expr//interv)*interv, 2) for
                               gene in all_genes])
    tcgan_expr_values = Counter([round((gene.TCGAN_expr//interv)*interv, 2) for
                               gene in all_genes])

    
    with open('genes/static/js/expr_02.tsv', 'w') as outfile:
        outfile.write("x_value\texpr_jan\texpr_gte\texpr_tcgan\n")
        for unrounded_x in np.arange(0.0, 13+interv, interv):
            x = round(unrounded_x, 2)
            outfile.write("%s\t%s\t%s\t%s\n" % (x,
                                             jan_expr_values[x],
                                             gte_expr_values[x],
                                             tcgan_expr_values[x]))
        
        
