var joinUrl = require('url-join')

module.exports = class Schemas {
  constructor (client) {
    this.client = client
    this.endpoint = 'schemas'
  }

  get (name, options, callback) {
    return this.client._req('get', joinUrl(this.endpoint, name), options, callback)
  }
}
