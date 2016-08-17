## The WorkFlow Engine

This is app primarily built to run on AWS Lambda and AWS ApiGateway. It is possible, however, to use the main library with `express` and build a standalone API server.

### Installation & Test

    $ npm install

For test you need to run a local copy of dynamoDB using docker

    $ docker run --rm -p 8000:8000 --name dynamodb peopleperhour/dynamodb
    $ npm run test

### Deployment

    $ npm install -g serverless@beta
    $ serverless deploy

The master branch is automatically deployed to AWS

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
