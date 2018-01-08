## List logs

List processing logs from the Cumulus engine. A log's `level` field may be either `info` or `error`.

```endpoint
GET /logs
```

#### Example request

```curl
$ curl https://example.com/logs?limit=5 --header 'Authorization: Bearer ReplaceWithTheToken'
```

#### Example response

```json
{
    "meta": {
        "name": "cumulus-api",
        "stack": "lpdaac-cumulus",
        "table": "logs",
        "limit": 5,
        "page": 1,
        "count": 750
    },
    "results": [
        {
            "pid": 1,
            "hostname": "ip-10-29-4-186",
            "name": "cumulus",
            "level": 50,
            "msg": "https://ba008ffc.ngrok.io/ not found",
            "file": "discover-pdrs/index.js",
            "type": "Error",
            "stack": "HostNotFound: https://ba008ffc.ngrok.io/ not found\n    at discover.discover.then.catch.e (/var/task/index.js:9006:22)\n    at process._tickDomainCallback (internal/process/next_tick.js:135:7)",
            "message": "https://ba008ffc.ngrok.io/ not found",
            "v": 1,
            "timestamp": 1513881407867
        },
        {
            "pid": 1,
            "hostname": "ip-10-29-4-186",
            "name": "cumulus",
            "level": 50,
            "file": "discover-pdrs/index.js",
            "message": "Received a 404 error from undefined. Check your endpoint!",
            "details": {
                "host": "ba008ffc.ngrok.io",
                "path": "/",
                "port": "",
                "protocol": "https",
                "uriPath": "/",
                "url": "https://ba008ffc.ngrok.io/",
                "depth": 1,
                "fetched": true,
                "status": "notfound",
                "stateData": {
                    "requestLatency": 66,
                    "requestTime": 66,
                    "contentLength": 34,
                    "contentType": "text/plain",
                    "code": 404,
                    "headers": {
                        "content-length": "34",
                        "connection": "close",
                        "content-type": "text/plain"
                    }
                },
                "id": 0
            },
            "v": 1,
            "timestamp": 1513881407867
        },
        {
            "pid": 1,
            "hostname": "ip-10-29-4-186",
            "name": "cumulus",
            "level": 50,
            "msg": "Cannot read property 'provider_path' of undefined",
            "file": "discover-pdrs/index.js",
            "type": "Error",
            "stack": "TypeError: Cannot read property 'provider_path' of undefined\n    at HttpDiscover.Discover (/var/task/index.js:10098:33)\n    at HttpDiscover._class (/var/task/index.js:96368:255)\n    at new HttpDiscover (/var/task/index.js:10342:241)\n    at handler (/var/task/index.js:8968:23)\n    at Promise (/var/task/cumulus-sled/index.js:82:5)\n    at invokeHandler (/var/task/cumulus-sled/index.js:72:10)\n    at then.then.then (/var/task/cumulus-sled/index.js:112:14)\n    at process._tickDomainCallback (internal/process/next_tick.js:135:7)",
            "v": 1,
            "timestamp": 1513881031694
        },
        {
            "pid": 1,
            "hostname": "ip-10-29-4-186",
            "name": "cumulus",
            "level": 50,
            "msg": "Provider info not provided",
            "file": "discover-pdrs/index.js",
            "type": "Error",
            "stack": "ProviderNotFound: Provider info not provided\n    at handler (/var/task/index.js:8962:20)\n    at Promise (/var/task/cumulus-sled/index.js:82:5)\n    at invokeHandler (/var/task/cumulus-sled/index.js:72:10)\n    at then.then.then (/var/task/cumulus-sled/index.js:112:14)\n    at process._tickDomainCallback (internal/process/next_tick.js:135:7)",
            "message": "Provider info not provided",
            "v": 1,
            "timestamp": 1513879654040
        },
        {
            "pid": 1,
            "hostname": "ip-10-29-4-186",
            "name": "cumulus",
            "level": 50,
            "msg": "Provider info not provided",
            "file": "discover-pdrs/index.js",
            "type": "Error",
            "stack": "ProviderNotFound: Provider info not provided\n    at handler (/var/task/index.js:8962:20)\n    at Promise (/var/task/cumulus-sled/index.js:82:5)\n    at invokeHandler (/var/task/cumulus-sled/index.js:72:10)\n    at then.then.then (/var/task/cumulus-sled/index.js:112:14)\n    at process._tickDomainCallback (internal/process/next_tick.js:135:7)",
            "message": "Provider info not provided",
            "v": 1,
            "timestamp": 1513879435010
        }
    ]
}
```

#### Example request for errors

```curl
$ curl https://example.com/logs?level=50 --header 'Authorization: Bearer ReplaceWithTheToken'
```

#### Example response for errors

```json
{
    "meta": {
        "name": "cumulus-api",
        "stack": "lpdaac-cumulus",
        "table": "logs",
        "limit": 1,
        "page": 1,
        "count": 181
    },
    "results": [
        {
            "level": 50,
            "msg": "Unexpected HTTP status code: 404",
            "pid": 1,
            "hostname": "ip-10-26-125-174",
            "name": "cumulus",
            "file": "sync-granule/index.js",
            "type": "Error",
            "stack": "Error: Unexpected HTTP status code: 404\n    at ClientRequest.<anonymous> (/var/task/sync-granule/index.js:125136:29)\n    at ClientRequest.g (events.js:292:16)\n    at emitOne (events.js:96:13)\n    at ClientRequest.emit (events.js:188:7)\n    at HTTPParser.parserOnIncomingClient (_http_client.js:473:21)\n    at HTTPParser.parserOnHeadersComplete (_http_common.js:99:23)\n    at TLSSocket.socketOnData (_http_client.js:362:20)\n    at emitOne (events.js:96:13)\n    at TLSSocket.emit (events.js:188:7)\n    at readableAddChunk (_stream_readable.js:176:18)",
            "code": 404,
            "v": 1,
            "timestamp": 1515446810226
        }
    ]
}
```
