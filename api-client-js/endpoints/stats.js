var joinUrl = require('url-join')

module.exports = class Stats {
  constructor (client) {
    this.client = client
    this.endpoint = 'stats'
  }

  get (options, callback) {
    return this.client._req('get', this.endpoint, options, callback)
  }

  aggregate (options, callback) {
    return this.client._req('get', joinUrl('aggregate', this.endpoint), options, callback)
  }

  average (options, callback) {
    return this.client._req('get', joinUrl('average', this.endpoint), options, callback)
  }

  histogram (options, callback) {
    return this.client._req('get', joinUrl('histogram', this.endpoint), options, callback)
  }
}
