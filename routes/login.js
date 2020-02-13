//importing packages
require('module-alias/register')
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');

//importing custom files
var userExists = require('@userExists');
var authenticateUser = require("@authenticateUser")
var getUserInfo = require('@getUserInfo')

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
                    var userInfo = await getUserInfo(client,user.username)
                    var userId = userInfo.userId
                }catch(err){
                    console.log("login.js: Failed await getUserInfo, err" + err)
                    response.json({status:400})
                }
                try{
                    var token = jwt.sign({user},"secretkey")
                }catch(err){
                    console.log("login.js: JWT error: ", + err)
                    response.json({status:400})
                }
                response.json({status:200,userId:userId,token:"Bearer "+token})
            }
        
        }else{
            console.log(user.username + " User Doesnt Exist")
            response.status(401).json({status:401,message:"User Doesnt Exist"})
        }    
    }catch(err){
        console.log("login.js: Try-Catch, err " + err)
        response.json({status:500})
    }
}