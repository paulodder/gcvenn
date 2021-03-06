from django.shortcuts import render
from django.http import HttpResponse, StreamingHttpResponse
from django.template import loader
import numpy as np
from genes.models import *
import random
import random
import json
import csv
from collections import Counter
from datetime import datetime
import pytz


class Echo:
    """An object that implements just the write method of the file-like
    interface.
    """

    def write(self, value):
        """Write the value by returning it, instead of storing in a buffer."""
        return value


# notes to self:
# Look at StreamingHttpResponse for streaming/generating large CSV files
# Look at gene select
#
# AUX FUNC
def cond_satisf(gene, conds):
    """Given a list with 3 2-tuples for Jan, GTE, TCGAN expression, respectively,
    checks if gene satisfies conditions"""
    return all(
        [
            conds[0][0] <= gene.Jan_expr <= conds[0][1],
            conds[1][0] <= gene.GTE_expr <= conds[1][1],
            conds[2][0] <= gene.TCGAN_expr <= conds[2][1],
        ]
    )


# VIEW FUNC
def base(request):
    """View that serves the standard website"""
    # return render(request, "genes/base.html")
    return render(request, "genes/one_graph.html")


def filter_gene_indices(request):
    conds_str = request.GET["conds"]
    conds_str = conds_str.replace(
        "13", "20"
    )  # In case 13 is present, accepts any
    # gene with expression lower than 20 (max possible gene expression in
    # our database (to prevent mismatch because some genes are not presented on
    # graph)
    bruggeman = Database.objects.get(name="bruggeman_et_al")
    conds = []
    for t in conds_str.split("--"):
        t_splitted = t.split(",")
        conds.append((float(t_splitted[0]), float(t_splitted[1])))

    # Filter bruggeman genes based on provided conds
    brug = set(g.id for g in bruggeman.genes.all() if cond_satisf(g, conds))
    # conds[0][0] <= g.Jan_expr <=conds[0][1]
    # and conds[1][0] <= g.GTE_expr <=conds[1][1]
    # and conds[2][0] <= g.TCGAN_expr <=conds[2][1])

    wang = set(
        g.id for g in Database.objects.get(name="wang_et_al").genes.all()
    )
    ct_db = set(g.id for g in Database.objects.get(name="ct_db").genes.all())

    brug_wang = brug.intersection(wang)
    brug_ct_db = brug.intersection(ct_db)
    # Return in format sizes: 1, 4, 6, 7
    return HttpResponse(
        json.dumps(
            [
                len(brug),
                len(brug_ct_db),
                len(brug_wang),
                len(brug_wang.intersection(brug_ct_db)),
            ]
        )
    )


def return_data(request):
    mean1 = random.random() * 12
    mean2 = random.random() * 12
    out = dict(
        (str(-1 * x), y)
        for x, y in enumerate(
            [
                {
                    "expr": max(
                        0,
                        min(
                            [
                                12.99,
                                np.random.normal(
                                    mean1 if random.random() < 0.3 else mean2,
                                    0.5,
                                ),
                            ]
                        ),
                    )
                }
                for _ in range(30000)
            ]
        )
    )
    return HttpResponse(json.dumps(out))
    # with open("../csv_files/bruggeman_genes_full_data_neww.csv") as f:
    #     r = csv.reader(f)
    #     genes = {g[0]: random.random(0, 14) for g in f}


def generate_csv(request):
    """Genereates csv file given the current selection criteria"""
    conds_str = request.GET["conds"]
    conds_str = conds_str.replace("13", "20")  # See above
    conds = []
    bruggeman = Database.objects.get(name="bruggeman_et_al")
    for t in conds_str.split("--"):
        t_splitted = t.split(",")
        conds.append((float(t_splitted[0]), float(t_splitted[1])))

    # Filter bruggeman genes based on provided conds
    brug_genes = set(
        g.rev_ann for g in bruggeman.genes.all() if cond_satisf(g, conds)
    )

    brug_sorted = sorted(brug_genes)

    # Write to pseudobuffer for streaming purposes
    pseudo_buffer = Echo()
    with open("full_gene_rows.txt", "r") as f:
        name_row_dic = json.load(f)

    writer = csv.writer(pseudo_buffer)

    # timezone info
    ams = pytz.timezone("Europe/Amsterdam")
    # First write header
    # writer.writerow(name_row_dic['HEADER'])
    response = StreamingHttpResponse(
        (
            writer.writerow(name_row_dic[gene])
            for gene in ["HEADER"] + brug_sorted
        ),
        content_type="text/csv",
    )
    response["Content-Disposition"] = (
        "attachment;filename=Bruggeman_GC_genes_%s.csv"
        % datetime.now(ams).strftime("%G_%m_%d_%H:%M").lower()
    )
    return response
