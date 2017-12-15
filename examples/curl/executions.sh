#! /bin/sh

# Get the access token using the auth example
TOKEN=`"./auth.sh"`
URL="$CUMULUS_BASEURL/executions"

# Get list of executions
curl $URL \
  -H "Authorization: Bearer ${TOKEN}"
