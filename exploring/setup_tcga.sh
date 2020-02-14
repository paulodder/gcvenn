cd $SRC_DIR
git clone https://github.com/NCI-GDC/gdc-client
cd bin
pip install virtualenv
virtualenv venv
./package
