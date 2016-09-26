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

    $ npm install -g serverless
    $ serverless deploy

The `master` branch is automatically deployed to AWS.

Additionally, in order for most of the Dashboard's reporting to function, the DynamoDB tables must be mirrored to Elasticsearch; Elasticsearch's querying capabilities are much richer than DynamoDB's. This mirroring can be done by following [this AWS tutorial](https://aws.amazon.com/blogs/compute/indexing-amazon-dynamodb-content-with-amazon-elasticsearch-service-using-aws-lambda/).

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
                           │  Elasticsearch   │
                           │                  │
                           │                  │
                           │                  │
                           └──────────────────┘
                                     ▲
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
