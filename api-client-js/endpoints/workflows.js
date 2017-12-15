var joinUrl = require('url-join')

module.exports = class Workflows {
  constructor (client) {
    this.client = client
    this.endpoint = 'workflows'
  }

  get (name, options, callback) {
    return this.client._req('get', joinUrl(this.endpoint, name), options, callback)
  }

  list (options, callback) {
    return this.client._req('get', this.endpoint, options, callback)
  }
}
