

module.exports = (request,response,next)=>{
    const  bearer = request.header('authorization')
    if(typeof bearer !== 'undefined'){
        const bearerToken = bearer.split(' ')[1]
        request.token = bearerToken
        console.log("spliToken.js: Token is split")
        next()
    } else {
        console.log('splitToken.js: Undefined Token')
        response.json({status:403,message:"Undefined Token"})
    }
}