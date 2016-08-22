## `activatePipeline`

Activates an AWS datapipeline

### Parameters

| name | type | description |
| ---- | ---- | ----------- |
| `pipelineId` | `String` | an AWS Pipeline ID |




## `createPipeline`

Create a new AWS datapipeline





## `getGranules`

Gets all unprocessed granules for a given dataset from DyanomoDB
and send them for processing by AWS datapipeline





## `Granules`

Handles processing and trigerring pending granules with AWS datapipeline

### Parameters

| name | type | description |
| ---- | ---- | ----------- |
| `dataset` | `Object` | a Dataset DyanmodDB record |
| `bucketName` | `String` | name of the AWS S3 bucket for storing pipeline paylosds |




## `markGranulesAsSent`

Mark all granules sent to AWS datapipeline as processed
by removeing the waitForPipelineSince value from the record on DynamoDb





## `process`

Start processing the granules for a given dataset





## `processDatasets`

Iterate through an array of datasets and get granules for each dataset record

### Parameters

| name | type | description |
| ---- | ---- | ----------- |
| `datasets` | `Object` | an array of DyanmodDB records |




## `processGranules`

Create a payload for AWS Datapipeline, upload it to S3, create a new datapipline
add pipeline template definition to the newly created pipeline, activate it
and mark the records on DynamoDB

### Parameters

| name | type | description |
| ---- | ---- | ----------- |
| `granules` | `Object` | a list of all granules that have to be processed by datapipeline |




## `putPipelineDefinition`

Adds pipeline definition to a datapipeline

### Parameters

| name | type | description |
| ---- | ---- | ----------- |
| `pipelineId` | `String` | an AWS Pipeline ID |




## `trigger`

Get list of all datasets from a DynamoDB table
Then look for unprocessed granules in each dataset and
send them for processing on AWS datapipeline





