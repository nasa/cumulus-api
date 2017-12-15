var Cumulus = require('../../api-client-js')

var api = new Cumulus({
  baseUrl: process.env.CUMULUS_BASEURL
})

var options = {
  username: process.env.EARTHDATA_USERNAME,
  password: process.env.EARTHDATA_PASSWORD
}

api.login(options, function (err, token) {
  console.log('token', token)
})
