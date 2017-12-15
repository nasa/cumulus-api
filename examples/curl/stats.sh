#! /bin/sh

# Get the access token using the auth example
TOKEN=`"./auth.sh"`
URL="$CUMULUS_BASEURL/stats"

# Get stats summary
printf "\nsummary\n"
curl -i $URL \
  -H "Authorization: Bearer ${TOKEN}"

# Get histogram
printf "\nhistogram\n"
URL="$CUMULUS_BASEURL/stats/histogram"
curl -i $URL \
  -H "Authorization: Bearer ${TOKEN}"

# Get aggregate
printf "\naggregate\n"
URL="$CUMULUS_BASEURL/stats/aggregate"
curl -i $URL \
  -H "Authorization: Bearer ${TOKEN}"

# Get average
printf "\naverage\n"
URL="$CUMULUS_BASEURL/stats/average?field=grade"
curl -i $URL \
  -H "Authorization: Bearer ${TOKEN}"
