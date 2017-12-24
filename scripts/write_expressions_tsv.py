# python manage.py runscript write_expressions_tsv.py --script-args <name of
# output file> <interval>
import django
from genes.models import *

from collections import Counter
import numpy as np

def run(*args):
    output_file = args[0]
    interv = round(float(args[1]), 2)
    all_genes = Gene.objects.all()
    jan_expr_values = Counter([round((gene.Jan_expr//interv)*interv, 2) for
                               gene in all_genes])
    gte_expr_values = Counter([round((gene.GTE_expr//interv)*interv, 2) for
                               gene in all_genes])
    tcgan_expr_values = Counter([round((gene.TCGAN_expr//interv)*interv, 2) for
                               gene in all_genes])

    
    with open(output_file, 'w') as outfile:
        outfile.write("x_value    jan_expr    gte_expr    tcgan_exprp")
        for unrounded_x in np.arange(0.0, 13+interv, interv):
            x = round(unrounded_x, 2)
            outfile.write("%s %s %s %s\n" % (x,
                                             jan_expr_values[x],
                                             gte_expr_values[x],
                                             tcgan_expr_values[x]))
        
        
