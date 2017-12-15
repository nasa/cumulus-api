#! /bin/sh

# Get the access token using the auth example
TOKEN=`"./auth.sh"`
URL="$CUMULUS_BASEURL/collections"

# Get list of collections
curl $URL \
  -H "Authorization: Bearer ${TOKEN}"
