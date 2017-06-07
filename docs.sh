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
    cd docbox || exit
    npm start
}

get_docs() {
    echo
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

build() {
    cd docbox || exit
    rm -rf build
    mkdir -p build
    npm run build
    cp -r css build/
    cp index.html build/
    cp bundle.js build/
}

deploy() {
    cd docbox/build || exit
    git init
    git config user.name "Devseed"
    git config user.email "info@developmentseed.org"
    git config commit.gpgsign "false"
    git add css bundle.js index.html
    git commit -m "Automated to gh-pages"
    git push --force --quiet git@github.com:cumulus-nasa/cumulus-api.git master:gh-pages
    rm -rf .git/
}

install_docbox() {
    git clone https://github.com/mapbox/docbox.git
    copy_docs
    cd docbox || exit
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
            copy_docs
            serve
            exit 0
            ;;
        get)
            get_docs
            exit 0
            ;;
        build)
            build
            exit 0
            ;;
        deploy)
            deploy
            exit 0
            ;;
        *)
            echo 'Argument(s) not supported'
            exit 0
            ;;
    esac
done
