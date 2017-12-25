# python manage.py runscript load_revised_annotations --script-args <filename>
# <gene database name>
import django
from django.core.exceptions import ObjectDoesNotExist
from genes.models import *


def run(*args):
    filedest = args[0]
    gene_db_name = args[1]
    exist, new = 0, 0
    try:
        db = Database.objects.get(name=gene_db_name)
    except ObjectDoesNotExist:
        db = Database()
        db.name = gene_db_name
        db.save()
    with open(filedest, 'r') as f:
        for name_unstripped in f:
            name = name_unstripped.strip()
            try:
                g = Gene.objects.get(rev_ann=name)
                exist += 1
            except:
                g = Gene()
                g.rev_ann = name
                g.save()
                new += 1
            db.genes.add(g)
    db.save()
    print("Added %s new genes and %s genes that were already known" % (new,
                                                                       exist))
                
