require('module-alias/register')
//importing packages
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');
// var MongoClient = require('mongodb').MongoClient;



//importing custom files
var config = require("@config")
const uri = config.DB_URI
var userExists = require('@userExists')
var convExists = require('@conversationExists')
var getPastConv = require('@getPastConv')


//Declaring App variables
// const client = new MongoClient(uri,{useNewUrlParser:true,useUnifiedTopology: true})


module.exports = async (request,response)=>{ // request.username , header.authorization - token
    console.log("getMessages.js: Request Arrived")
    const client = request.app.locals.db
    response.setHeader('Content-Type','application/json')
    const token = request.token
    var recvTimestamp = parseInt(request.headers['timestamp'] || 0, 10) 
    console.log("getMessages.js: recvTimestamp " + typeof(recvTimestamp) + " " + recvTimestamp)
    const convId = request.headers['convid']
    try {
        var authData = jwt.verify(token,"secretkey") 
        if( convId == undefined){ 
            try{
                var t = await getPastConv(client,authData.user.username,recvTimestamp)
                response.json({status:200,pastConv:t})
            }catch(err){
                console.log("getMessages.js:Try-Catch, err " + err)
                response.json({status:500})
            }
        }else {
            client.db('User-Data')
            .collection('Messages')
            .find({"timestamp":{$gt:recvTimestamp}, "convId" : convId})
            .limit(100)
            .toArray()
            .then(res=>{
                if(res.length == 0){
                    console.log("getMessages.js: messages empty")
                    response.json({status:400,messages:"messages empty"})
                } else {
                    var messageJSON = {
                        'messages' : []
                    }
                    res.forEach(element => {
                        if(element.timestamp > recvTimestamp)messageJSON['messages'].push({body:element.body,userId:element.creatorUserId});
                    })
                    console.log("getMessages.js: Retrieved Messages succesfully")
                    response.json({status:200,message:"Retrieved Messages succesfully",data:messageJSON})
                }
            })
            .catch(err=>{
                console.log("getMessages.js: mongodb error, err " + err)
                response.json({status:500,message:"Internal DB error"})
            })
        }
    }catch(err){
        console.log("getMessages: Try-Catch ,err " + err)
        response.status(500).json({status:500 , message:"Internal Error"})
    }
}