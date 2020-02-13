var crypto = require('crypto')
var secret = require('./serveSecretKey.js')()
module.exports = (msg)=>{
    return crypto.createHmac("sha256",secret).update(msg).digest('hex')
}