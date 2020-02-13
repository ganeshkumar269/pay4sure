require('module-alias/register')

//importing packages
var MongoClient = require('mongodb').MongoClient;


//importing custom files
var getUserCredentials = require("@getUserCredentials")
var config = require("@config")
const uri = config.DB_URI
var stringHasher = require('@stringHasher')


//declaring app variables
// const client = new MongoClient(uri,{useNewUrlParser:true,useUnifiedTopology: true });


module.exports = async (client,user)=>{
    try {
        var t = await getUserCredentials(client,user.username)
    }catch(err){
        console.log("authenticateUser.js: Failed await getUserCrendentials, err "+ err)
        throw err
    }    
    return new Promise((rs,rj)=>{rs()}).then(()=>{
        if(stringHasher(user.password) == t.hashedPassword && t.hashedPassword != undefined)
            return true
        return false
    }).catch(err=>{
        throw err
    })
}