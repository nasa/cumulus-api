#! /bin/sh

# Get the access token using the auth example
TOKEN=`"./auth.sh"`
URL="$CUMULUS_BASEURL/granules"

# Get list of granules
curl $URL \
  -H "Authorization: Bearer ${TOKEN}"
