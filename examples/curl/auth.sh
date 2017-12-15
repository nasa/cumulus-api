#! /bin/sh

ORIGIN=$(dirname $CUMULUS_BASEURL)
LOGIN_URL="$CUMULUS_BASEURL/token"

# create a base64 hash of your login credentials
AUTH=$(printf "$EARTHDATA_USERNAME:$EARTHDATA_PASSWORD" | base64)

# Request the Earthdata url with client id and redirect uri to use with Cumulus
AUTHORIZE_URL=$(curl -s -i ${LOGIN_URL} | grep location | sed -e "s/^location: //");

# Request an authorization grant code
TOKEN_URL=$(curl -s -i -X POST \
  -F "credentials=${AUTH}" \
  -H "Origin: ${ORIGIN}" \
  ${AUTHORIZE_URL%$'\r'} | grep Location | sed -e "s/^Location: //")

# Request the token through the CUMULUS API url that's returned from Earthdata
# Response is a JSON object of the form { token: String }
# This uses the cli tool jq to parse the JSON and get the token string
# More info on jq: https://stedolan.github.io/jq/
TOKEN=$(curl -s ${TOKEN_URL%$'\r'} | jq -r '.token')

echo $TOKEN
