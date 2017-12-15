#! /bin/sh

# Get the access token using the auth example
TOKEN=`"./auth.sh"`
URL="$CUMULUS_BASEURL/workflows"

# Get list of workflows
curl $URL \
  -H "Authorization: Bearer ${TOKEN}"
