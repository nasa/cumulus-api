#! /bin/sh

# Get the access token using the auth example
TOKEN=`"./auth.sh"`
URL="$CUMULUS_BASEURL/providers"

# Get list of providers
curl -i $URL \
  -H "Authorization: Bearer ${TOKEN}"
