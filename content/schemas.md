## Retrieve schema

Retrieve the data schema for a particular type of Cumulus record.

This schema describes the expected format of a record's JSON object when retrieving from Cumulus, as well as a summary of what each field may contain. The schema response can also be used to determine which fields are required when creating a new record using the API.

Supported `type` values are `provider`, `collection`, `granule`, and `pdr`.

```endpoint
GET /schemas/{type}
```

#### Example request

```curl
$ curl https://example.com/schemas/provider --header 'Authorization: Bearer ReplceWithTheToken'
```

#### Example response

```json
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "title": "Provider Object",
  "description": "Keep the information about each ingest endpoint",
  "type": "object",
  "properties": {
    "name": {
      "title": "Title",
      "description": "A title for the provider record",
      "type": "string",
      "pattern": "^([\\w\\d_\\-]*)$"
    },
    "providerName": {
      "title": "Provider, e.g. MODAPS",
      "description": "Name of the SIP",
      "type": "string"
    },
    "protocol": {
      "title": "Protocol",
      "type": "string",
      "enum": [
        "http",
        "ftp"
      ],
      "default": "http"
    },
    "host": {
      "title": "Host",
      "type": "string"
    },
    "path": {
      "title": "Path to the PDR/files folder",
      "type": "string"
    },
    "config": {
      "title": "Configuration",
      "type": "object",
      "properties": {
        "username": {
          "type": "string"
        },
        "password": {
          "type": "string"
        },
        "port": {
          "type": "string"
        }
      }
    },
    "status": {
      "title": "Status",
      "type": "string",
      "enum": [
        "ingesting",
        "stopped",
        "failed"
      ],
      "default": "stopped",
      "readonly": true
    },
    "isActive": {
      "title": "Is Active?",
      "type": "boolean",
      "default": false,
      "readonly": true
    },
    "regex": {
      "type": "object",
      "patternProperties": {
        "^([\\S]*)$": {
          "type": "string"
        }
      },
      "readonly": true
    },
    "lastTimeIngestedAt": {
      "title": "Last Time Ingest from the Provider",
      "type": "number",
      "readonly": true
    },
    "createdAt": {
      "type": "number",
      "readonly": true
    },
    "updatedAt": {
      "type": "number",
      "readonly": true
    }
  },
  "required": [
    "name",
    "providerName",
    "protocol",
    "host",
    "path",
    "isActive",
    "status",
    "createdAt",
    "updatedAt"
  ]
}
```
