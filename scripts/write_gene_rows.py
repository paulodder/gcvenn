# python manage.py write_gene_rows --
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
    brug_genes =  Database.objects.get(name="bruggeman_et_al").genes.all()
    # set(g for g in Gene.objects.all() if
                 #     conds[0][0] <= g.Jan_expr <=conds[0][1]
                 #     and conds[1][0] <= g.GTE_expr <=conds[1][1]
                 #     and conds[2][0] <= g.TCGAN_expr <=conds[2][1])
    
    wang_genes =  Database.objects.get(name="wang_et_al").genes.all()
    ct_db_genes =  Database.objects.get(name="ct_db").genes.all()
    
    brug_wang = brug_genes.intersection(wang_genes)
    brug_ct_db = brug_genes.intersection(ct_db_genes)

    # wang_ct_db = wang.intersection(ct_db)

    ct_db_member = Counter([g.rev_ann for g in brug_wang])
    wang_member = Counter([g.rev_ann for g in brug_ct_db])

    brug_sorted = [g.rev_ann for g in sorted(brug_genes, key=lambda g:
                                             (wang_member[g],
                                              ct_db_member[g]))]
    out_dic = dict()

    with open('csv_files/bruggeman_genes_full_data_neww.csv', 'r') as f:
        lines = csv.reader(f)

        #     header_line = [w.strip() for w in (header_line[:5] +
        #                                        ['Mentioned by Wang et al 2016',
        #                                         'Mentioned in CT database'] +
        for i, headerline in enumerate(lines):
            # headerline = header_line[0].split(',')
            # print(header_line)
            headerline[0] = headerline[0].strip('"')
            headerline[-1] = headerline[-1].strip('"')
            
            out_dic['HEADER'] = headerline
            if i == 0:# Do one loop just to get header
                break
        for i, new_line in enumerate(lines):
            newline = new_line[0].split(',')
            if i % 500 == 0:
                print("%s new genes added" % i)
                # line_stripped = [n.strip() for n in oldline]
                # newline = (oldline[:5] + [wang_member[line_stripped[0]],
                #                           ct_db_member[line_stripped[0]]] + oldline[5:])

            out_dic[newline[0]] = newline # Append using gene name as key

            if i == 8000:
                # write to temporary file to prevent working memory overload
                with open('tempstor', 'w') as temp:
                    temp.write(json.dumps(out_dic))
                    out_dic = dict()
                    
        
        # out_dic[g.rev_ann] = [g.rev_ann, g.Jan_expr, g.GTE_expr, g.TCGAN_expr,
        #                  wang_member[g], ct_db_member[g]]
        # writer.writerow([g.rev_ann, g.Jan_expr, g.GTE_expr, g.TCGAN_expr,
        #                  wang_member[g], ct_db_member[g]])
    with open('full_gene_rows.txt', 'w') as f:
        out_dic.update(json.load(open('tempstor', 'r')))
        f.write(json.dumps(out_dic))

    

    
    # with open('csv_files/bruggeman_genes_full_data.csv', 'r') as f:
    #     lines = csv.reader(f)
    #     for i, header_line in enumerate(lines):
    #         header_line = [w.strip() for w in (header_line[:5] +
    #                                            ['Mentioned by Wang et al 2016',
    #                                           'Mentioned in CT database'] +
    #                                            header_line[5:])]
    #         out_dic['HEADER'] = header_line
    #         if i == 0:# Do one loop just to get header
    #             break
    #     for i, oldline in enumerate(lines):
    #         if i % 500 == 0:
    #             print("%s new genes added" % i)
    #         line_stripped = [n.strip() for n in oldline]
    #         newline = (oldline[:5] + [wang_member[line_stripped[0]],
    #                                   ct_db_member[line_stripped[0]]] + oldline[5:])

    #         out_dic[newline[0]] = newline # Append using gene name as key
    #         if i == 8000:
    #             # write to temporary file to prevent working memory overload
    #             with open('tempstor', 'w') as temp:
    #                 temp.write(json.dumps(out_dic))
    #             out_dic = dict()
        
        
    #     # out_dic[g.rev_ann] = [g.rev_ann, g.Jan_expr, g.GTE_expr, g.TCGAN_expr,
    #     #                  wang_member[g], ct_db_member[g]]
    #     # writer.writerow([g.rev_ann, g.Jan_expr, g.GTE_expr, g.TCGAN_expr,
    #     #                  wang_member[g], ct_db_member[g]])
    # with open(args[0], 'w') as f:
    #     out_dic.update(json.load(open('tempstor', 'r')))
    #     f.write(json.dumps(out_dic))

    
