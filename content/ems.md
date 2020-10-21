## Create EMS reports

Create EMS reports and send them to EMS. For more information on EMS reporting and types of reports see [the Cumulus EMS Reporting documentation](https://nasa.github.io/cumulus/docs/next/ems_reporting).

Overview of the request fields:

| Field | Required | Value | Description |
| --- | --- | --- | --- |
| `reportType` | `Y` | `"metadata"`&vert;`"ingest"`&vert;`"distribution"` | type of report |
| `startTime` | `N` | `string` | report startTime in format YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss <br>If startTime and endTime are not specified, the reports for previous day will be generated |
| `endTime` | `N` | `string` | report endTime in format YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss |
| `collectionId` | `N` | `string` | collectionId of the report records <br>This field can be specified when report type is `metadata` or `ingest` |

```endpoint
POST /ems
```

#### Example requests

```curl
$ curl https://example.com/ems --header 'Authorization: Bearer ReplaceWithTheToken' --data '{
    "reportType": "metadata"
}'
```

```curl
$ curl https://example.com/ems --header 'Authorization: Bearer ReplaceWithTheToken' --data '{
    "reportType": "ingest",
    "startTime": "2019-06-27",
    "endTime": "2019-06-29",
    "collectionId": "MOD14A1___006"
}'
```

#### Example response

```json
{
    "message": "Reports are being generated",
    "status": 202
}
```
