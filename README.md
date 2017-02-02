## Cumulus-api

[![CircleCI](https://circleci.com/gh/cumulus-nasa/workflow-engine.svg?style=svg&circle-token=da48de71f4b14f1d435851cb5d7a845d3e88fbdd)](https://circleci.com/gh/cumulus-nasa/workflow-engine)

Cumulus-api is the gateway to the Cumulus platform. Ultimately, everything that needs to be configured on Cumulus would be handled by the cumulus-api. All the metrics and status of the Cumulus as a platform is also accessible through the cumulus-api.

Cumulus-api is a serverless architecture. The application does not run on traditional servers. It rather uses two AWS services to create web endpoints and serve data. AWS API Gateway service provides the endpoints and AWS Lambdas respond to web requests.

Lambda functions code is located under the `lambdas` folder. All shared libraries that are used by more than one lambda function are located under the `lib`.

The API endpoints and lambda configurations are located at `config/config.yml`.

The CloudFormation template is generated from `config/cloudformation.template.yml`.

### Installation

    $ npm install

### Deployment for the first time

    $ bin/cf create --profile awsProfileName

### Updating CF stack

    $ bin/cf update --profile awsProfileName

### Updating Lambda Code

    $ bin/lambda collections --profile awsProfileName
    $ bin/lambda granules --profile awsProfileName

### Adding a new Lambda function

Create a new folder under `lambdas`. Add `index.js` and `package.json` files.

Make sure `index.js` includes a function the receieves `(event, context, callback)` arguments and the function is exported.

When the code is ready, run `npm install` to have the functions dependencies installed and added to the `dist` forlder.

Then edit `config/config.yml` and add a new to `lambdas` list. Example entry:

```yaml
lambdas:
  - name: signup # as it will appear in AWS Lambda
    handler: auth.signup # name of the lambda folder plus name of the function
    timeout: 300
    apiGateway: # this is needed if the lambda function is going to be associated with an apigateway endpoint
      path: signup
      method: post
      cors: trues
```

### Running the API locally

    $ bin/serve

### Docs

API documentation is deployed to https://cumulus-nasa.github.io/cumulus-api

#### Installation

To edit the documentation locally first install Doxbox by running:

    $ bin/docs install

#### Local Serve

Serve the local documentation by running:

    $ bin/docs serve

While the documentation is served locally you can edit Markdown files under `docbox/content`. Your edits are automatically copied to `docs/api/content`.

#### Deploy

    $ bin/docs build
    $ bin/docs deploy

## Local Development with Docker

To make local development with DyanmoDB and SQS you can use docker. Just run:

   $ docker-compose up local
   $ bin/bootstrap
