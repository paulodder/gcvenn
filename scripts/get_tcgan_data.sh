#!/bin/sh
#make sure to run this from your virtualenv
manifest_file_path=/home/paul/projects/gcvenn/exploring/gdc_manifest.2020-01-04.txt
unzip gdc-client*.zip
cd $DATA_DIR
mkdir tcga
cd tcga
$SRC_DIR/gdc-client/gdc-client -m $manifest_file_path # CHANGE
