from django.shortcuts import render
from django.http import HttpResponse
from django.template import loader

from genes.models import *

import json

# notes to self:
# Look at StreamingHttpResponse for streaming/generating large CSV files
# Set content_type to tell browser to treat response as file attachment

def base(request):
    """View that serves the standard website"""

    # template = loader.get_template('genes/base.html' )
    # response = HttpResponse(template.render))    
    # response['age'] = 120 
    return render(request, 'genes/base.html')


def filter_gene_indices(request):
    conds_str = request.GET["conds"]
    conds = []
    for t in conds_str.split('-'):
        t_splitted = t.split(',')
        conds.append((float(t_splitted[0]), float(t_splitted[1])))
    

    # Filter bruggeman genes based on provided conds
    brug = set(g.id for g in Gene.objects.all() if
               conds[0][0] <= g.Jan_expr <=conds[0][1]
               and conds[1][0] <= g.GTE_expr <=conds[1][1]
               and conds[2][0] <= g.TCGAN_expr <=conds[2][1])
    
    wang = set(g.id for g in Database.objects.get(
        name="wang_et_al").genes.all())
    ct_db = set(g.id for g in Database.objects.get(name="ct_db").genes.all())
    
    brug_wang = brug.intersection(wang)
    brug_ct_db = brug.intersection(ct_db)
    # Return in format sizes: 1, 4, 6, 7
    return HttpResponse(json.dumps([len(brug), len(brug_ct_db), len(brug_wang), 
                                    len(brug_wang.intersection(brug_ct_db))]))
