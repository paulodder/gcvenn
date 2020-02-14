#!/bin/sh
#make sure to run this from your virtualenv
manifest_file_path=/home/paul/projects/gcvenn/exploring/gdc_manifest.2020-01-04.txt
source ../.env
echo $DATA_DIR
gtex_links=('https://storage.googleapis.com/gtex_analysis_v8/rna_seq_data/GTEx_Analysis_2017-06-05_v8_RNASeQCv1.1.9_gene_reads.gct.gz' 'https://storage.googleapis.com/gtex_analysis_v8/rna_seq_data/GTEx_Analysis_2017-06-05_v8_RNASeQCv1.1.9_gene_tpm.gct.gz')
for link in $gtex_links
do
wget -P $DATA_DIR/gtex $link
done
uncompress $DATA_DIR/*


unzip gdc-client*.zip
cd $DATA_DIR
mkdir tcga
cd tcga
$SRC_DIR/gdc-client/gdc-client -m $manifest_file_path # CHANGE
