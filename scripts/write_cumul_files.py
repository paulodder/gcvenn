# python manage.py runscript write_cumul_files

import django
from genes.models import *

def run(*args):
    interv = 0.01
    bruggeman = Database.objects.get(name="bruggeman_et_al")
    with open('genes/static/cumulative_jan_max.txt', 'w') as f:
        f.write('interval\tnofgenes\n')
        cur = 0
        jans = [g.Jan_expr for g in bruggeman.genes.all()]
        while cur < 13:
            f.write('{:.2f}'.format(cur)+'\t'+str(len([g for g in jans if g<= cur]))+'\n')
            cur = round(cur +0.01, 2)
        # Write final line manually because graph stops at 13
        f.write('{:.2f}'.format(cur)+'\t'+'15064')
            
    with open('genes/static/cumulative_gte_max.txt', 'w') as f:
        f.write('interval\tnofgenes\n')
        cur = 0
        gtes = [g.GTE_expr for g in bruggeman.genes.all()]
        while cur < 13:
            f.write('{:.2f}'.format(cur)+'\t'+str(len([g for g in gtes if g<= cur]))+'\n')
            cur = round(cur +0.01, 2)
        # Write final line manually because graph stops at 13            
        f.write('{:.2f}'.format(cur)+'\t'+'15064')

        
        

    with open('genes/static/cumulative_tcgan_max.txt', 'w') as f:
        f.write('interval\tnofgenes\n')
        cur = 0
        tcgans = [g.TCGAN_expr for g in bruggeman.genes.all()]
        while cur < 13:
            f.write('{:.2f}'.format(cur)+'\t'+str(len([g for g in tcgans if g<= cur]))+'\n')
            cur = round(cur +0.01, 2)
        # Write final line manually because graph stops at 13
        f.write('{:.2f}'.format(cur)+'\t'+'15064')
