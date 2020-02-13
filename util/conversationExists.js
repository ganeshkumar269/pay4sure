var MongoClient = require('mongodb').MongoClient;
var ObjectID  = require('mongodb').ObjectID

var config = require("@config")
const uri = config.DB_URI
var userExists = require('@userExists')

module.exports = async (client,sender,reciever)=>{
    console.log("conversationExists.js: Request Arrived , "+ sender+" "+reciever)
    try {
        var res = await client.db(sender).collection('past-conv')
                .find({})
                .limit(100)
                .toArray()
        if(res.length != 0)
        res.forEach(async el=>{
            try{
                var msg = await client.db('User-Data').collection('Conversations')
                        .find({convId:el.convId})
                        .limit(1)
                        .toArray()
                if(msg[0].participants[0] == sender && msg[0].participants[1] == reciever
                    || msg[0].participants[0] == reciever && msg[0].participants[1] == sender)
                        return {status:200,convId:msg[0].convId}
            }catch(err){
                console.log("conversationExists.js: Failed to find , err: " + err)
                return {status:500}
            }         
        })
        return {status:201}
    }catch(err){
        console.log("conversationExists.js: Failed , err: " + err)
        return {status:500}
    }
}