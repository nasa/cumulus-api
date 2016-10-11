#!/bin/bash

copy_docs() {
    echo 'Copying API content and custom template to DocBox'
    rm -rf docbox/content/*
    rm -rf docbox/src/custom/*
    cp docs/api/content/* docbox/content/
    cp docs/api/template/src/custom/* docbox/src/custom/
    cp docs/api/template/src/components/app.js docbox/src/components/app.js
}

# Serves docbox
serve() {
    cd docbox
    npm start
}

get_docs() {
    echo \n
    echo 'Copying API content and custom template from DocBox'
    cp docbox/content/* docs/api/content/
    cp docbox/src/custom/* docs/api/template/src/custom/
    cp docbox/src/components/app.js docs/api/template/src/components/
}

cleanup() {
    cd ..
    get_docs
    exit 0
}

install_docbox() {
    git clone https://github.com/mapbox/docbox.git
    copy_docs
    cd docbox
    npm install
}

while [[ $1 ]]
do
    case "$1" in
        install)
            install_docbox
            exit 0
            ;;
        serve)
            trap cleanup INT
            copy_docs
            serve
            exit 0
            ;;
        get)
            get_docs
            exit 0
            ;;
        *)
            echo 'Argument(s) not supported'
            exit 0
            ;;
    esac
done
