var parseUrl = require('url').parse

const maybe = require('call-me-maybe')
const joinUrl = require('url-join')
const assert = require('nanoassert')
const base64 = require('base-64')
const request = require('got')

const Collections = require('./endpoints/collections')
const Distribution = require('./endpoints/distribution')
const ExecutionStatus = require('./endpoints/execution-status')
const Executions = require('./endpoints/executions')
const Granules = require('./endpoints/granules')
const Logs = require('./endpoints/logs')
const Pdrs = require('./endpoints/pdrs')
const Providers = require('./endpoints/providers')
const Rules = require('./endpoints/rules')
const Schemas = require('./endpoints/schemas')
const Stats = require('./endpoints/stats')
const Workflows = require('./endpoints/workflows')

/**
*
* @name CumulusApi
**/
class CumulusApi {
  constructor (baseUrl, options) {
    if (typeof baseUrl === 'object') {
      options = baseUrl
      baseUrl = options.baseUrl
    }

    assert(options && typeof options === 'object', 'options object is required')
    assert(baseUrl && typeof baseUrl === 'string', 'baseUrl string is required')

    this.baseUrl = baseUrl
    this.token = options.token || null

    this.collections = new Collections(this)
    this.distribution = new Distribution(this)
    this.executionStatus = new ExecutionStatus(this)
    this.executions = new Executions(this)
    this.granules = new Granules(this)
    this.logs = new Logs(this)
    this.pdrs = new Pdrs(this)
    this.providers = new Providers(this)
    this.rules = new Rules(this)
    this.schemas = new Schemas(this)
    this.stats = new Stats(this)
    this.workflows = new Workflows(this)
  }

  /**
  *
  * @name
  **/
  login (options, callback) {
    assert(options && typeof options === 'object', 'options object is required')
    assert(options.username && typeof options.username === 'string', 'options.username string is required')
    assert(options.password && typeof options.password === 'string', 'options.password string is required')

    var url = joinUrl(this.baseUrl, '/token')

    return maybe(callback, new Promise((resolve, reject) => {
      return request(url, { followRedirect: false })
        .catch(reject)
        .then((res) => {
          if (res.statusCode && res.headers.location) {
            resolve(this._authorize(res.headers.location, options))
          } else {
            reject(new Error('Error authenticating with EarthData login. Check that your baseUrl, username, and password are correct, and the app client_id and redirect_uri are correctly set up'))
          }
        })
    }))
  }

  /**
  *
  * @private
  **/
  _authorize (url, options) {
    assert(url && typeof url === 'string', 'url string is required')

    var urlObj = parseUrl(url)
    var auth = base64.encode(options.username + ':' + options.password)

    var requestOptions = {
      method: 'POST',
      form: true,
      body: { credentials: auth },
      headers: {
        origin: urlObj.protocol + '//' + urlObj.host
      }
    }

    return new Promise((resolve, reject) => {
      return request(url, requestOptions)
        .catch((err) => {
          if (err.statusCode === 302 && err.headers.location) {
            return resolve(this._getToken(err.headers.location))
          }

          reject(err)
        })
        .then((res) => {
          reject(new Error('Error authenticating with EarthData login. Check that your baseUrl, username, and password are correct, and the app client_id and redirect_uri are correctly set up'))
        })
    })
  }

  /**
  *
  * @private
  **/
  _getToken (url) {
    return new Promise((resolve, reject) => {
      request(url)
        .catch(reject)
        .then((res) => {
          var body = JSON.parse(res.body)
          this.token = body.message.token
          resolve(body.message.token)
        })
    })
  }

  _req (method, url, options, callback) {
    if (typeof options === 'function') {
      callback = options
      options = {}
    }

    if (!options) options = {}
    options.headers = { authorization: `Bearer ${this.token}` }
    options.method = method

    const requestPromise = new Promise((resolve, reject) => {
      return request(joinUrl(this.baseUrl, url), options)
        .catch(reject)
        .then((res) => {
          console.log('res.statusCode', res.statusCode)
          console.log(res)
          resolve(JSON.parse(res.body))
        })
    })

    return maybe(callback, requestPromise)
  }
}

module.exports = CumulusApi
