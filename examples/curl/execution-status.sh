#! /bin/sh

# Get the access token using the auth example
TOKEN=`"./auth.sh"`
EXECUTION_ARN="arn:aws:states:us-east-1:433612427488:execution:LpdaacCumulusDiscoverPdrsStateMachine-TOSDNMC55QUA:7b242f9bab4628d49bc9f8d3a"
URL="$CUMULUS_BASEURL/executions/status/$EXECUTION_ARN"

curl $URL \
  -H "Authorization: Bearer ${TOKEN}"
