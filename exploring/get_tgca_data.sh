#!/bin/sh

echo $DATA_DIR

cd $DATA_DIR
mkdir -p tcga
cd tcga
$SRC_DIR download -m $MANIFEST
