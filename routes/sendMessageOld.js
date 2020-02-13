var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');
var MongoClient = require('mongodb').MongoClient;
var ObjectID  = require('mongodb').ObjectID

var uri = require("@mymongodbURI")
const client = new MongoClient(uri,{useNewUrlParser:true,useUnifiedTopology: true});
var userExists = require('@userExists');
var getUserInfo = require('@getUserInfo')
var createConversation = require('@createConversation')
var convExists = require('@conversationExists')


module.exports = (request,response,next) => {
    jwt.verify(request.token,'secretkey',(err,authData)=>{
        if(err){
            console.log("sendMessage.js: token verification failed " + err)
            response.json({status:401,message:"Token Verification failed"})
        }
        else {
            console.log("Token Verified");
            userExists(request.body.username, async message => {
                    var senderUsername = authData.user.username
                    var recieverUsername = request.body.username
                    if(message === true){
                        try{
                            var [recieverInfo,senderInfo] = await Promise.all([getUserInfo(recieverUsername) , getUserInfo(senderUsername)])
                            console.log(recieverInfo.user+ " " + senderInfo.user)
                            var t = request.headers['convid']
                        }catch(err){
                            console.log("sendMessage.js: Failed await , err " + err)
                            response.json({status:500})
                        }
                        console.log("sendMessage.js: t.convId " + t + " "+(t==undefined))
                        if(t == undefined){
                            var conv = await createConversation([senderInfo.user.userId,recieverInfo.user.userId])                         
                            console.log("sendMessage.js:Conv created, " + conv.conversation)
                            client.connect().then( async db=>{
                            try{
                                

                                console.log("sendMessage.js: Message inserted Successfully")
                                var res={ 
                                            status:200,
                                            message:'Message Sent Successfully!',
                                            convId:conv.conversation.convId
                                        }
                                response.json(res)
                            }catch(err){
                                console.log("sendMessage.js: Try-Catch, err " + err)
                                response.json({status:500})
                            }
                            }).catch(err=>{
                                console.log("sendMessage.js: Try-Catch , err " + err)
                                response.json({status:500})
                            })
                        } else{
                                client.connect()
                                .then(async db=>{
                                    try {
                                        await client.db('User-Data')
                                        .collection('Messages')
                                        .insertOne({
                                                    convId:t,
                                                    msgId:new ObjectID().toHexString(),
                                                    creatorUserId:senderInfo.user.userId,
                                                    body:request.body.message,
                                                    timestamp:Date.now()
                                                    })
                                        console.log("sendMessage.js: Message inserted Successfully")
                                        response.json({status:200,message:'Message Sent Successfully',convId:t});
                                    }catch(err){
                                        console.log("sendMessage.js: Try-Catch, err "+err)
                                        response.json({status:500})
                                    }
                                })
                                .catch(err=>{

                                })
                        }
                    }else{  // r-user doesnt exist
                        console.log("sendMessages.js:R-User doenst exist")
                        response.json({status:401,message:"R-User Doesnt Exist"})
                    }}
                        , message => {
                        console.log(message);
                        response.json({status:500,message:"Internal Error"});
                        })
                    
        }})
}