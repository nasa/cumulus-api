## Cumulus-api

[![CircleCI](https://circleci.com/gh/cumulus-nasa/cumulus-api.svg?style=svg&circle-token=da48de71f4b14f1d435851cb5d7a845d3e88fbdd)](https://circleci.com/gh/cumulus-nasa/cumulus-api)

Cumulus-api is the gateway to the Cumulus platform. Ultimately, everything that needs to be configured on Cumulus would be handled by the cumulus-api. All the metrics and status of the Cumulus as a platform is also accessible through the cumulus-api.

Cumulus-api is a serverless architecture. The application does not run on traditional servers. It rather uses two AWS services to create web endpoints and serve data. AWS API Gateway service provides the endpoints and AWS Lambdas respond to web requests.

Lambda functions code is located under the `lambdas` folder. All shared libraries that are used by more than one lambda function are located under the `lib`.

The API endpoints and lambda configurations are located at `config/config.yml`.

The CloudFormation template is generated from `config/cloudformation.template.yml`.

### Installation

    $ npm install

### NGAP Deployment

Make sure to update the subnet id, availability zone and security group id in the `config.yml`. In the current setup all ec2 instances are launched into a private subnet that has the same ip address.

Run in order:

    $ cp config/secrets.json.example config/secrets.json
    $ npm run build
    $ sulu cf create --stack ngap-stack-name --stage dev
    $ sulu bootstrap remote  # needed to add mapping to ElasticSearch
    # sulu cf ldg  # to add dead letter queues to lambda functions
    # sulu users add user1 changethepassword  # to add the first user

### Deployment for the first time

First make a copy of `config/secrets.json.example`:

    $ cp config/secrets.json.example config/secrets.json

Then update the fields with real value and proceed further.

    $ sulu cf create --profile awsProfileName

To override stack or stage names do:

    $ sulu cf create --stack mySatck --stage prod

### Updating CF stack

    $ sulu cf update --profile awsProfileName

### Updating Lambda Code

    $ sulu lambda collections --profile awsProfileName
    $ sulu lambda granules --profile awsProfileName

### Public/Private Key

Cumulus uses RSA public and private keys to encrypt and decrypt private data. Every time that `sulu cf create/update` is run, a new pair of private and public keys are generated and uploaded to the the deployment bucket on S3. The public key is used to encrypt all the private information in the deployment.

The lambdas will use the private key to decrypt the private data.

This is a temporary measure and has to be replaced with Amazon 'KMS' service.

### Deploying using differnet config files

To deploy using other config files (there are two others committed in this repo) pass `--config` argument. Examples:

    $ sulu cf update --profile awsProfileName --config config/config-prod.yml
    $ sulu cf validate --profile awsProfileName --config config/config-ngap.yml

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

    $ sulu serve

## Local Development with Docker

To make local development with DyanmoDB and SQS you can use docker. Just run:

    $ docker-compose up local
    $ sulu bootstrap

To run a function with local DB run:

    $ node dist/pdr/index.js local

To run the function with aws resources, first add credentials to `.env`, then run:

    $ node dist/pdr/index.js remote

## Tests

Lambda tests are located in each Lambda folder. Example: `lambdas/collections/tests/collections.js`

Library tests are located at `lib/tests`.

To run the tests:

    $ npm run test
