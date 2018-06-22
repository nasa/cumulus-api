#! /bin/sh

# Get the access token using the auth example
TOKEN=`"./auth.sh"`
URL="$CUMULUS_BASEURL/reconciliationReports"

# Get list of reconciliation reports
curl $URL \
  -H "Authorization: Bearer ${TOKEN}"
