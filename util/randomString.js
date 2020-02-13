const crypto = require('crypto');

module.exports = (length)=>{
    return crypto.randomBytes(length || 48).toString('hex');
}