var jwt = require('jsonwebtoken')

module.exports = (request,response)=>{
    response.setHeader('Content-Type','application/json');
    jwt.verify(request.token,"secretkey",(err,authData)=>{
        if(err){
            response.json({status:403,message:"Invalid Token"});
            console.log("ping.js: Invalid Token:, err" + err)
        } else {
            console.log('ping.js: Token verified');
            response.json({status:200,message:'ping hasn\'t been implemented yet :(\nStay Tuned for further updates :)'});
        }
    });
}