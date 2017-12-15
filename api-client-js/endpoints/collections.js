var joinUrl = require('url-join')

/**
* Request collections
* @name collections
* @example
*
* const api = new CumulusApi({ baseUrl: 'baseurl' })
* const listPromise = api.collections.list()
**/
module.exports = class Collections {
  constructor (client) {
    this.client = client
    this.endpoint = 'collections'
  }

  /**
  * @name post
  * @memberof collections
  **/
  post (name, options, callback) {
    return this.client._req('post', joinUrl(this.endpoint, name), options, callback)
  }

  /**
  * @name put
  * @memberof collections
  **/
  put (name, options, callback) {
    return this.client._req('put', joinUrl(this.endpoint, name), options, callback)
  }

  /**
  * @name get
  * @memberof collections
  **/
  get (name, options, callback) {
    return this.client._req('get', joinUrl(this.endpoint, name), options, callback)
  }

  /**
  * @name list
  * @memberof collections
  **/
  list (options, callback) {
    return this.client._req('get', this.endpoint, options, callback)
  }

  /**
  * @name del
  * @memberof collections
  **/
  del (name, callback) {
    return this.client._req('delete', joinUrl(this.endpoint, name), callback)
  }
}
