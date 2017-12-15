var joinUrl = require('url-join')

module.exports = class ExecutionStatus {
  constructor (client) {
    this.client = client
    this.endpoint = 'executions/status'
  }

  get (name, options, callback) {
    return this.client._req('get', joinUrl(this.endpoint, name), options, callback)
  }
}
