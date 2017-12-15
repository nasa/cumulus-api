
module.exports = class Pdrs {
  constructor (client) {
    this.client = client
  }

  get (granuleId, options, callback) {
    return this.client._req('get', granuleId, options, callback)
  }
}
