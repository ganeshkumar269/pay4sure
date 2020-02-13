//importing packages
require('module-alias/register')
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');

//importing custom files
var userExists = require('@userExists')
var createMessage = require("@createMessage")


//declaring app variables


module.exports = async (request,response)=>{
    const client = request.app.locals.db
    var convId = request.headers['convid'] 
    try{
        var authData = jwt.verify(request.token,"secretkey")
    }catch(err){
        console.log("sendMessage.js: err, "+err)
        response.json({status:400,message:"Invalid Token"})
    }
    if(convId == undefined){
        console.log("sendMessage.js: undefined convid")
        if(request.body.participants != undefined){
            try{
                var t = await userExists(client,request.body.participants[0])
                if(t == false){
                    console.log("sendMessage.js: participants doesnt exist")
                    response.json({status:400})
                }
            }catch(err){
                console.log("sendMessage.js: await userExists, err " + err)
                response.json({status:500})
            }
        }
        else {
            console.log("sendMessage.js: undefined Username")
            response.json({status:400})
        }
    }

    var doc = {
        convId:convId,
        sender:authData.user.username,
        participants:request.body.participants,
        message:request.body.message
    }
    try{
        var convId = await createMessage(client,doc);
        response.json({status:200,convId:convId})
    }catch(err){
        console.log("sendMessage.js: Error in createMessage, err " + err)
        response.json({status:500})    
    } 
}