var joinUrl = require('url-join')

module.exports = class Providers {
  constructor (client) {
    this.client = client
    this.endpoint = 'providers'
  }

  post (name, options, callback) {
    return this.client._req('post', joinUrl(this.endpoint, name), options, callback)
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
