var Cumulus = require('../../api-client-js')

var api = new Cumulus({
  baseUrl: process.env.CUMULUS_BASEURL
})

var options = {
  username: process.env.EARTHDATA_USERNAME,
  password: process.env.EARTHDATA_PASSWORD
}

api.login(options, function (err, token) {
  getExecutionsList(function (err, list) {
    var execution = list[0]
    api.executionStatus.get(execution.arn, function (err, response) {
      console.log(response)
    })
  })
})

function getExecutionsList (callback) {
  api.executions.list(function (err, res) {
    if (err) return callback(err)
    return callback(null, res.results)
  })
}
