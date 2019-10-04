

## overview

Cumulus can be configured to protect the API via SAML.  In this case, a request is made to a login endpoint which creates a login request and submits that request to a SAML Identity Provider. NASA deployments will be using [Launchpad](https://launchpad.nasa.gov), info: [SAML2 workflows](https://en.wikipedia.org/wiki/SAML_2.0).

A successful SAML sign on, will result in a [JWT (JSON Web Token)](https://jwt.io/introduction/) returned to the caller as an additional query parameter on the response from `/saml/auth` that is valid for 1 hour.

## login

```endpoint
GET /saml/login
```

### Query Parameters

| query string parameter | description |
| -----  | ----------- |
| `RelayState={string}` | The URI to redirect to after successful authentication. |


#### Example request
Most requests are done from the dashboard as SAML workflow generally requires a user to enter their credentials by hand.

```curl
$ curl -i https://example.com/saml/login?RelayState=https%3A%2F%2Fexample-client.com%2Fauth
```

#### Example response
```curl
HTTP/1.1 302 Found
Server: Server
Date: Fri, 04 Oct 2019 19:55:51 GMT
Content-Type: text/plain; charset=utf-8
Content-Length: 737
Connection: keep-alive
x-amzn-RequestId: 2157eee5-20bd-4d5b-9eff-25f27252aad8
access-control-allow-origin: *
strict-transport-security: max-age=31536000; includeSubDomains
x-amzn-Remapped-content-length: 737
x-amzn-Remapped-connection: close
x-amz-apigw-id: BDaHGF19oAMFt_g=
vary: Accept
location: https://auth.launchpad-sbx.nasa.gov/affwebservices/public/saml2sso?SAMLRequest=pZLNbtswEIRfReBdP4wkWyZkBW6MogbS1ojdHHopVtTKJiCRqpa03T59ablBc2kuuS5m95sZsry%2F9F1wwpGU0UvGo4TdV%2BXK2aN%2Bwp8OyQZeoGnJ3KiFAVIkNPRIwkqxW31%2BFHdRIobRWCNNx25iQdB3b28AEY7WM1nw%2FAL3cxZs1kv2o0WOWToDjpjNmzSV85QvZkWa46zJ0zZpinTRZOm84H6ByOFGkwVt%2FY2EL0KehEm25wuR5yL3kXjynQVrn0VpsBPqaO1AIo7BB406cFoeB2hCqi%2BRBoLoYE4xtO0Za2%2FzpCRSPLi6UzK%2BRrsjMixYvUR4MJpcj%2BPuJv329PgP4AqN8%2FqgZBPhBaWzGMKgIkchAtmQR9DDb6PhTJE0vSiSJIsbPE2YyR0Ltn%2FL%2FaB0o%2FTh7V7rm4jEp%2F1%2BG26%2F7vYs%2BGhGidOTLlkLHSGryut9MVU3Vu%2F1Wsavr5VfvKnNemt8W7%2Bu7B7s%2Fz3ziE8T1YTtJBVO04BStQob33HXmfPDiGBxyezokMVVGb%2F%2BntUf&RelayState=http%3A%2F%2Flocalhost%3A3000%2F%23%2Fauth
x-powered-by: Express
X-Amzn-Trace-Id: Root=1-5d97a3c6-19bd637148b511a5ec3e1850;Sampled=0
x-amzn-Remapped-date: Fri, 04 Oct 2019 19:55:51 GMT
```

The example response shows a redirect to the Identity provider SAML2 Single Sign On page with an encoded request.  Following the location header will take you to a modal login page for Launchpad (or similiar SAML provider based on the Cumulus configuration).

Successful authorization will redirect the SAML workflow back to the Assertion Consumer Service at `/saml/auth`.

## authorize

```endpoint
POST /saml/auth
```

The `saml/auth` endpoint recieves and validates an HTTP POST from a SAML Identity Provider after a successful login.
Cumulus validates the response, verifies the `name_id` from the SAMLResponse is in the UsersTable and creates a JWT using the returned `session_index` value as the `accessToken` and the `name_id` as as the `username`.  This token has an 1 hour expiration and can be presented as a Bearer token to access the Cumulus API.  The token is returned as an additional query parameter, `token` added to the end of the `RelayState`.


The Identity Provider responds POSTing a request body with the relay state and the SAMLResponse.  The SAMLResponse is an encoded SAML assertion document.

#### example POST body
```json
{
    "RelayState": "http://example.com/#/auth",
    "SAMLResponse": "PFJlc3BvbnNlIHhtbG5zPSJ1cm46b2FzaXM6bmFtZXM6dGM<truncated>"
}
```

The successful response from `/saml/auth/` is a redirect to the RelayState with a valid JWT query parameter on `token`

#### example redirect response
```curl
http://relayState.com/?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1NzAyMzA3ODUsImFjY2Vzc1Rva2VuIjoiYkVIV2szQStkdnpQWnFEWlJIMnVNeW1KbVZFPXB3NU9GQT09IiwidXNlcm5hbWUiOiJtaHNhdm9pZSJ9.hLj6MTaPhHrmKw5hxUrevl_fMOF-6MtAEJM86_IG2hE
```
