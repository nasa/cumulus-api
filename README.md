## [DEPRECATED] Cumulus-api

**This repository is not longer developered. The code is moved to [here](https://github.com/cumulus-nasa/cumulus). We only use this repository to keep track of Development Seed's Cumulus related issues and backlog.**

Cumulus-api is the gateway to the Cumulus platform. Ultimately, everything that needs to be configured on Cumulus would be handled by the cumulus-api. All the metrics and status of the Cumulus as a platform is also accessible through the cumulus-api.

Cumulus-api is a serverless architecture. The application does not run on traditional servers. It rather uses two AWS services to create web endpoints and serve data. AWS API Gateway service provides the endpoints and AWS Lambdas respond to web requests.

Lambda functions code is located under the `lambdas` folder. All shared libraries that are used by more than one lambda function are located under the `lib`.

The API endpoints and lambda configurations are located at `config/config.yml`.

The CloudFormation template is generated from `config/cloudformation.template.yml`.

### Installation

    $ npm install

### NGAP Deployment

Make sure to update the subnet id, availability zone and security group id in the `config.yml`. In the current setup all ec2 instances are launched into a private subnet that has the same ip address.

* Make sure to create the internal bucket first:  `aws s3 mb s3://my-bucket-internal`
* Create the ECS security group

Run in order:

    $ cp config/secrets.json.example config/secrets.json
    $ npm run build
    # If --stack and --stage are not specified, they are pulled from config.yml
    $ sulu cf create --config ./config/gsfc-ngap-cumulus-api-lpdaac-sit.yml --region us-east-1
    $ sulu bootstrap remote  # needed to add mapping to ElasticSearch
    # sulu cf dlq # to add dead letter queues to lambda functions
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

Lambda tests are located in each Lambda folder. Example: `lambdas/collections/tests/test.js`

Library tests are located at `lib/tests`.

To run the tests:

    $ npm run test

## Deploying in Bamboo

### Build modules package

```(bash)
mkdir -p artifacts
docker run \
  -e RELEASE_UID=$(id -u) \
  -e RELEASE_GID=$(id -g) \
  --rm \
  -v "$(pwd):/source:ro" \
  -v "$(pwd)/artifacts:/artifacts" \
  node \
  /source/ngap/bamboo/build_modules_package.sh
```

### Run tests

Assumes that modules.tar is present in the project root directory.

```(bash)
docker run --detach --cidfile=elasticsearch.cid --name test_elasticsearch elasticsearch:2.3.5

docker run --detach --cidfile=sqs.cid --name test_sqs vsouza/sqs-local

docker run --detach --cidfile=dynamodb.cid --name test_dynamodb peopleperhour/dynamodb

mkdir -p artifacts
docker run \
  -e RELEASE_UID=$(id -u) \
  -e RELEASE_GID=$(id -g) \
  --rm \
  -v "$(pwd):/source:ro" \
  -v "$(pwd)/artifacts:/artifacts" \
  --link test_elasticsearch:elasticsearch \
  --link test_sqs:sqs \
  --link test_dynamodb:dynamodb \
  node \
  /source/ngap/bamboo/run_tests.sh
```

### Build release package

```(bash)
mkdir -p artifacts
docker run \
  -e RELEASE_UID=$(id -u) \
  -e RELEASE_GID=$(id -g) \
  --rm \
  -v "$(pwd):/source:ro" \
  -v "$(pwd)/artifacts:/artifacts" \
  node \
  /source/ngap/bamboo/build_release_package.sh
```
