## s3credentials

The Cumulus API can provide temporary credentials good for read-only direct same-region access to s3 objects.

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
