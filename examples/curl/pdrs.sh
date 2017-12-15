#! /bin/sh

# Get the access token using the auth example
TOKEN=`"./auth.sh"`
URL="$CUMULUS_BASEURL/pdrs"

# Get list of pdrs
curl $URL \
  -H "Authorization: Bearer ${TOKEN}"
