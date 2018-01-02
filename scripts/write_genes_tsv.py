#python manage.py runscript write_genes_tsv --script-args <output file dest>
import django
from genes.models import *
# def original_cond(gene):
#     """Takes a gene and checks if it satisfiesd

wang = Database.objects.get(name="wang_et_al")
ct_db = Database.objects.get(name="ct_db")

def initial_cond(gene):
    """Returns boolean whether gene is included in original current selection"""
    return int(all([gene.Jan_expr > 1.6, gene.GTE_expr < 1.8,
                    gene.TCGAN_expr > 6.2]))

def member_code(gene):
    """Returns number code for gene"""
    global wang, ct_db
    dbs = gene.database_set.all() 
    if wang in dbs and ct_db in dbs:
        return "7" # Return number corresponding to 3-intersection
    if ct_db in dbs:
        return "4" # Return number corresponding to intersection of bruggeman
    # and ct_db
    if wang in dbs:
        return "6" # Return number corresponding to intersection of bruggeman
    # and wang et al.
    else: # If no other db, means just belongs to bruggeman
        return "1"
    
    
def run(*args):
    filedest = args[0]
    bruggeman_db = Database.objects.get(name="bruggeman_et_al")
    with open('genes/static/js/'+filedest, 'w') as f:
        f.write("gene_id\texpr_jan\texpr_gte\texpr_tcgan\tsatisf_jan\tsatisf_gte\tsatisf_tcgan\tcurr_sel\tmember_code\n")
        for i, gene in enumerate(bruggeman_db.genes.order_by("id")):
            if i % 500 == 0:
                print("%s genes added" % i)
            curr_selection = initial_cond(gene) # By default set genes
            # that satisfy condition used in paper as part of current_sel
            f.write("%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\n" % (str(gene.id),
                                                  str(round(gene.Jan_expr, 3)),
                                                  str(round(gene.GTE_expr, 3)),
                                                  str(round(gene.TCGAN_expr, 3)),
                                                  int(gene.Jan_expr > 1.6),
                                                  int(gene.GTE_expr < 1.8),
                                                  int(gene.TCGAN_expr > 6.2),
                                                  str(initial_cond(gene)),
                                                  str(member_code(gene))))
