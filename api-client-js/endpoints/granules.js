var joinUrl = require('url-join')

module.exports = class Granules {
  constructor (client) {
    this.client = client
    this.endpoint = 'granules'
  }

  put (name, options, callback) {
    return this.client._req('put', joinUrl(this.endpoint, name), options, callback)
  }

  get (name, options, callback) {
    return this.client._req('get', joinUrl(this.endpoint, name), options, callback)
  }

  list (options, callback) {
    return this.client._req('get', this.endpoint, options, callback)
  }

  del (name, callback) {
    return this.client._req('delete', joinUrl(this.endpoint, name), callback)
  }
}
