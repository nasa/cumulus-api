## The WorkFlow Engine

[![CircleCI](https://circleci.com/gh/cumulus-nasa/workflow-engine.svg?style=svg&circle-token=da48de71f4b14f1d435851cb5d7a845d3e88fbdd)](https://circleci.com/gh/cumulus-nasa/workflow-engine)

This is app primarily built to run on AWS Lambda and AWS ApiGateway. It is possible, however, to use the main library with `express` and build a standalone API server.

### Installation & Test

    $ npm install

Make sure to set:

    $ export AWS_ACCESS_KEY_ID="Your AWS Access Key ID"
    $ export AWS_SECRET_ACCESS_KEY="Your AWS Secret Access Key"
    $ export AWS_REGION="us-east-1"

For test you need to run a local copy of dynamoDB using docker

    $ docker run --rm -p 8000:8000 --name dynamodb peopleperhour/dynamodb
    $ docker run --rm -p 9200:9200 --name elasticsearch elasticsearch
    $ npm run test

### Deployment

    $ npm install -g github:cumulus-nasa/serverless#cumulus
    $ serverless deploy

### Local Development

To run the API locally run:

    $ serverless offline start

The master branch is automatically deployed to AWS

### Docs

API documentation is deployed to https://cumulus-nasa.github.io/workflow-engine

#### Installation

To edit the documentation locally first install Doxbox by running:

    $ ./docs.sh install

#### Local Serve

Serve the local documentation by running:

    $ ./docs.sh serve

While the documentation is served locally you can edit Markdown files under `docbox/content`. Your edits are automatically copied to `docs/api/content`.

#### Deploy

    $ ./docs.sh build
    $ ./docs.sh deploy

### Architecture

```

                            ┌────────────────┐
                            │                │
                            │                │
                            │                │
                            │   ApiGateway   │
                            │                │
                            │                │
                            │                │
                            └────────────────┘
                                     │
                                     │
                                     │
        ┌───────────────────┬────────┴─────────┬──────────────────┐
        │                   │                  │                  │
        │                   │                  │                  │
        ▼                   ▼                  ▼                  ▼
┌───────────────┐   ┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│    Lambda     │   │    Lambda     │  │    Lambda     │  │    Lambda     │
│               │   │               │  │               │  │               │
│ listGranules  │   │  postDataSet  │  │ listDataSets  │  │  getDataSet   │
└───────────────┘   └───────────────┘  └───────────────┘  └───────────────┘
        ▲                   ▲                  ▲                  ▲
        │                   │                  │                  │
        └───────────────────┴────────┬─────────┴──────────────────┘
                                     │
                                     │
                                     │
                           ┌──────────────────┐
                           │                  │
                           │                  │
                           │                  │
                           │     DynamoDB     │
                           │                  │
                           │                  │
                           │                  │
                           └──────────────────┘

```
