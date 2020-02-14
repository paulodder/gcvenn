source ../.env
echo $DATA_DIR
gtex_links=('https://storage.googleapis.com/gtex_analysis_v8/rna_seq_data/GTEx_Analysis_2017-06-05_v8_RNASeQCv1.1.9_gene_reads.gct.gz' 'https://storage.googleapis.com/gtex_analysis_v8/rna_seq_data/GTEx_Analysis_2017-06-05_v8_RNASeQCv1.1.9_gene_tpm.gct.gz')
for link in $gtex_links
do
wget -P $DATA_DIR/gtex $link
done
uncompress $DATA_DIR/*
