//importing packages
require('module-alias/register')
var ObjectID = require('mongodb').ObjectID; 
var MongoClient = require('mongodb').MongoClient;
var bodyParser = require('body-parser');

//importing custom files
var config = require('@config')
var userExists = require('@userExists');
var addUserCredentials = require('@addUserCredentials')

var uri = config.DB_URI
var stringHasher = require('@stringHasher')

//Declaring App variables
const client = new MongoClient(uri,{useNewUrlParser:true,useUnifiedTopology: true })


module.exports = async (request,response) => {
    console.log("Incoming create Request");
    const user = request.body;
    const client = request.app.locals.db
    if(user.username == undefined || user.username == "" || user.password == ""){
        console.log("create.js: Invalid Inputs, empty strings not allowed")
        response.status(401).json({status:401,message:"Invalid Details,  empty strings not allowed"})
    } else {
        console.log(user);
        response.setHeader('Content-Type','application/json');
        try{
            var t = await userExists(client,user.username)
        }catch(err){
            console.log("create.js: Failed await userExists, err " + err)
            response.json({status:500})
        }
        console.log("create.js: userExists? "+ t)
        if(t === false){
            const obj = new ObjectID().toHexString()
            const userData = {
                userId:obj,
                username:user.username,
                hashedPassword: stringHasher(user.password)
            }
            console.log("Username isnt in DB, inserting user to DB")
            try {
                var res = await addUserCredentials(client,userData)
            }catch(err){
                console.log("create.js:  Try-Catch, err " + err)
                response.json({status:500,message:"Internal Error"})
            }
            response.json({status:200})                
        }else {
            console.log("Username exists")
            response.json({status:401,message:"Username Exists, try another"})
        } 
    }
}