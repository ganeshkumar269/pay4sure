require('module-alias/register')
var creditAmount = require('@creditAmount')
var debitAmount = require('@debitAmount')
var addRecord = require('@addRecord')
module.exports = async(request,response) => {
    console.log("resolverecord.js: Incoming request")
    var authToken = request.token
    var client = request.app.locals.db
    var sId = request.body.sId
    var rId = request.body.rId
    var tId = request.body.tId
    var chargeAmount = parseInt(request.body.chargeAmount)
    var timestamp = request.body.timestamp
    try{
        await Promise.all[creditAmount(client,{userId:rId},chargeAmount),debitAmount(client,{userId:sId},chargeAmount)]
    }catch(err){
        console.log("resolveRecord.js: Failed to resolve credit debit promises ",err)
        response.status(500).json({status:500,message:"Internal Record"})
    }
    try{
        await addRecord(client,{sId:sId,rId:rId,tId:tId,timestamp:timestamp,resolvedOn:Date.now()})
    }catch(err){
        console.log("resolveRecord.js:Failed await addRecord,",err)
        response.status(500).json({status:500,message:"Internal Error"})
    }
    response.status(200).json({status:200,message:"transaction was successfully resolved"})
}