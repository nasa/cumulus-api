var joinUrl = require('url-join')

module.exports = class Logs {
  constructor (client) {
    this.client = client
    this.endpoint = 'logs'
  }

  list (options, callback) {
    return this.client._req('get', this.endpoint, options, callback)
  }
}
