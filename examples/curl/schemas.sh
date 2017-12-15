#! /bin/sh

# Get the access token using the auth example
TOKEN=`"./auth.sh"`
SCHEMA="" # TODO
URL="$CUMULUS_BASEURL/schemas/$SCHEMA"

# Get list of schemas
curl $URL \
  -H "Authorization: Bearer ${TOKEN}"
