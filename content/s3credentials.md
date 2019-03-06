## s3credentials

The Cumulus API can provide temporary credentials that provide read-only direct same-region access to s3 objects.

##### NGAP deployments
For NGAP (NASA-compliant General Application Platform) deployments, the s3credentials endpoint is configured to request temporary credentials from an NGAP controlled lambda function `gsfc-ngap-sh-s3-sts-get-keys`.


GET requests to the endpoint return a credentials object that can be used to make direct s3 requests.

```endpoint
GET /s3credentials
```

#### Example Request
```curl
$ curl https://example.com/s3credentials --header 'Authorization: Bearer ReplaceWithTheToken'
```

#### Example Response
```json
{
  "accessKeyId": "AKIAIOSFODNN7EXAMPLE",
  "secretAccessKey": "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
  "sessionToken": "LONGSTRINGOFCHARACTERSnBeoImkYlERDDHhmwZivcKPd63LUp1uhuZ9bhhIHUjvt++hgRSk9HIMZDEHH9crnukckEZ+FGYrSiwndzjBQ==",
  "expiration": "2019-02-27 23:26:56+00:00"
}
```


##### Non-NGAP deployments

For non-NGAP deployments that wish to provide temporary credentials, you must provide the name of a lambda available to your stack either by overriding the default `sts_credentials_lambda` or by setting the environment variable STSCredentialsLambda on your API.  Your lambda function must take an payload object as described below and return [AWS.Credentials](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Credentials.html) appropriate to your use case probably via the [AWS Security Token Service](https://docs.aws.amazon.com/STS/latest/APIReference/Welcome.html).

sample `sts_credentials_lambda` payload:
```json
{
 accesstype: 'sameregion',
 duration: '3600', // one hour max allowed by AWS.
 rolesession: 'SAME_REGION_ACCESS',
 userid: username
}
```
