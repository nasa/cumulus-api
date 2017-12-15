#! /bin/sh

# Get the access token using the auth example
TOKEN=`"./auth.sh"`

# Get logs
URL="$CUMULUS_BASEURL/logs"
curl $URL \
  -H "Authorization: Bearer ${TOKEN}"
