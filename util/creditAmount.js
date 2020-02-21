require('module-alias/register')

//importing packages

var MongoClient = require('mongodb').MongoClient;


//importing custom files
var config = require("@config")
const uri = config.DB_URI

//declaring app variables


module.exports = async (client,userInfo,creditAmount) => {
    try{
        await client.db('pay4sure').collection('Credentials')
        .updateOne({userId:userInfo.userId},{$inc:{amountLeft:creditAmount}})
        console.log("creditAmount.js: Amount Credited")
    }catch(err){
        throw err
    }
}