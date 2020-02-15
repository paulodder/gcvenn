#!/bin/sh
# make sure to run this from your virtualenv

manifest_file=$MANIFEST
source ../.env
echo $DATA_DIR

# Get GTEx data -- still a bit bumpy due to nature of files which cannot be
# decompressed properly
declare -a gtexlinks=("https://storage.googleapis.com/gtex_analysis_v8/rna_seq_data/GTEx_Analysis_2017-06-05_v8_RNASeQCv1.1.9_gene_reads.gct.gz" "https://storage.googleapis.com/gtex_analysis_v8/rna_seq_data/GTEx_Analysis_2017-06-05_v8_RNASeQCv1.1.9_gene_tpm.gct.gz" "https://storage.googleapis.com/gtex_analysis_v8/rna_seq_data/GTEx_Analysis_2017-06-05_v8_RNASeQCv1.1.9_gene_median_tpm.gct.gz")
for link in "${gtexlinks[@]}"
do
wget -P $DATA_DIR/gtex $link
done
mkdir gtex
cd gtex
mv $DATA_DIR/gtex
uncompress *

# Get TGCA data
cd $DATA_DIR
mkdir tcga
cd tcga
$SRC_DIR/gdc-client/gdc-client -m $MANIFEST
