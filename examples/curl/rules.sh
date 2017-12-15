#! /bin/sh

# Get the access token using the auth example
TOKEN=`"./auth.sh"`
URL="$CUMULUS_BASEURL/rules"

# Get list of rules
curl $URL \
  -H "Authorization: Bearer ${TOKEN}"
