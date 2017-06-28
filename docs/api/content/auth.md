## Authorization header

Whenever a request is made to the Cumulus API, it must contain a user's credentials. These credentials must be provided via the [HTTP Basic Authentication](https://en.wikipedia.org/wiki/Basic_access_authentication#Client_side) mechanism, by encoding `{username}:{password}` using Base 64 and including it as a request header.

So, for example, for username `CirrusBlack` and password `NasaIHardlyNoaa`, the following HTTP header would be sent with requests: `Authorization: Basic Q2lycnVzQmxhY2s6TmFzYUlIYXJkbHlOb2Fh`. (This is because the Base 64 encoding of `CirrusBlack:NasaIHardlyNoaa` is `Q2lycnVzQmxhY2s6TmFzYUlIYXJkbHlOb2Fh`.)

If no credentials are provided, the Cumulus API server will respond with an error, requesting credentials. If incorrect credentials are provided, the server will respond with a separate error noting this.

#### Example header generation and request

```curl
$ curl https://cumulus.developmentseed.org/api/dev/providers --header "Authorization: Basic $(echo -n 'CirrusBlack:NasaIHardlyNoaa' | base64)"
```

```python
import base64
import urllib2

username = 'CirrusBlack'
password = 'NasaIHardlyNoaa'
encoded = base64.b64encode('{}:{}'.format(username, password))
header = {'Authorization': 'Basic {}'.format(encoded)}

URL = 'https://cumulus.developmentseed.org/api/dev/providers'
request = urllib2.Request(URL, headers=header)
content = urllib2.urlopen(request).read()
```

```javascript
// Using Node.js
var https = require('https');

function requestCallback (response) {
  var str = '';
  response.on('data', function (chunk) { str += chunk; });
  response.on('end', function () { console.log(str); });
}

var username = 'CirrusBlack';
var password = 'NasaIHardlyNoaa';
var encoded = new Buffer(`${username}:${password}`).toString('base64');
var header = { Authorization: `Basic ${encoded}` };

var options = {
  host: 'cumulus.developmentseed.org',
  path: '/api/dev/providers',
  headers: header
};
https.get(options, requestCallback).end();
```
