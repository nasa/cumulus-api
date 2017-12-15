var test = require('tape')

var CumulusApiClient = require('../index')

var api = new CumulusApiClient({
  baseUrl: process.env.CUMULUS_BASEURL
})

test('login', function (t) {
  var options = {
    username: process.env.EARTHDATA_USERNAME,
    password: process.env.EARTHDATA_PASSWORD
  }

  api.login(options, function (err, token) {
    t.notOk(err)
    t.ok(token && typeof token === 'string')
    t.end()
  })
})
