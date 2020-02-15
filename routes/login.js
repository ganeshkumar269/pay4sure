//importing packages
require('module-alias/register')
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');

//importing custom files
var userExists = require('@userExists');
var authenticateUser = require("@authenticateUser")
var getUserCredentials = require('@getUserCredentials')

//declaring app variables


module.exports = async (req,response)=>{
    var user = req.body
    const client = req.app.locals.db
    console.log("Incoming login request")
    try{
        var t = await userExists(client,user.username)
        if(t === true){   
            try{
                var o = await authenticateUser(client,user)
            }catch(err){
                console.log("login.js: Failed await authenticateUser, err " + err)
                response.json({status:500})
            }
            if(o === false)
                response.json({status:401,message:"Incorrect Details"})
            else{
                try{
                    var userInfo = await getUserCredentials(client,user.username)
                    var userId = userInfo.userId
                    var encryptionKey = userInfo.encryptionKey
                }catch(err){
                    console.log("login.js: Failed await getUserCredentials, err" + err)
                    response.statu(400).json({status:400})
                }
                try{
                    var token = jwt.sign({user},"secretkey")
                }catch(err){
                    console.log("login.js: JWT error: ", + err)
                    response.json({status:400})
                }
                response.status(200).json({status:200,userId:userId,token:"Bearer "+token,encryptionKey:encryptionKey})
            }
        
        }else{
            console.log(user.username + " User Doesnt Exist")
            response.status(401).json({status:401,message:"User Doesnt Exist"})
        }    
    }catch(err){
        console.log("login.js: Try-Catch, err " + err)
        response.statu(500).json({status:500})
    }
}