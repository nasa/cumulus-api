## Cumulus API

The Cumulus API allows developers to interact with the [Cumulus Framework](https://github.com/cumulus-nasa/cumulus), such as monitoring status or creating, editing, and deleting records. This is the same API that powers the [Cumulus dashboard](https://github.com/cumulus-nasa/cumulus-dashboard).

By utilizing this API, a developer can integrate with the Cumulus framework in any language or environment; although interacting with Cumulus through the Cumulus dashboard may be appropriate for many end users, for some use cases it's best to have the flexibility of a web-accessible API.

The API accepts and responds with JSON payloads at various HTTPS endpoints.

In order to use these endpoints, you must include authentication information in your HTTPS request; authentication is explained in the following section.

The following table lists the [query string](https://en.wikipedia.org/wiki/Query_string) parameters that can be used with most of the Cumulus API endpoints. `{fieldName}` is a stand-in for any of the fields in the record, and for nested objects dot notation can be used; for example, valid `fieldName`s include: `pdrName`, `status`, and `recipe.processStep.description`.

| query string parameter | description |
| -----  | ----------- |
| `limit={number}` | number of records to be returned by the API call; default is `1`, maximum is `100` |
| `page={number}` | page number, 1-indexed; default is `1` |
| `sort_by={fieldName}` | which field to sort by; default is `timestamp` |
| `order={asc|desc}` | whether to sort in `asc` or `desc` order |
| `prefix={value}` | `startsWith` search of the `granuleId`, `status`, `pdrName`, `collectionName`, and `userName` fields |
| `fields={fieldName1, fieldName2}` | which fields to return, separated by a comma |
| `{fieldName}={value}` | exact value match for the given field |
| `{fieldName}__from={number}`  | for numeric fields, field value must be greater than the given number |
| `{fieldName}__to={number}`  | for numeric fields, field value must be less than the given number |
| `{fieldName}__not={value}` | field does not match the given value |
| `{fieldName}__in={value1, value2}` | field matches _one of_ the values in the comma-separated list |
| `{fieldName}__exists={true|false}` | field exists or doesn't exist in the record |
| `q="fieldName:(1 TO 2) AND fieldName2: (3 To 4)"` | arbitrary Apache Lucene query syntax, _not needed for most uses of the API_; if the `q` parameter is used, all other query parameters will be ignored, besides `limit`, `page`, and `fields` |

The Cumulus API uses multiple versions. The defult version can be reached using `{API_URL}/{query}`

Example:
`$ curl https://example.com/providers`

To use any version other than the default, include the version number in the path before the query endpoint. `{API_URL}/{version}/{query}`

Example:
`$ curl https://example.com/v1/providers`
