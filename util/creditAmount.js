require('module-alias/register')

//importing packages

var MongoClient = require('mongodb').MongoClient;


//importing custom files
var config = require("@config")
const uri = config.DB_URI

//declaring app variables


module.exports = async (client,userInfo,creditAmount) => {
    await client.db('pay4sure').collection('Credentials')
        .update({userId:userInfo.userId},{$inc:{amountLeft:creditAmount}})
}