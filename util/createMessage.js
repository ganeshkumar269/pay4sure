require('module-alias/register')

//importing packages
var MongoClient = require('mongodb').MongoClient
var ObjectID = require('mongodb').ObjectID

//importing custom files
var createConversation = require("@createConversation")
var config = require("@config")
const uri = config.DB_URI
var getUserInfo = require("@getUserInfo")

//declaring app variables

module.exports = async(client,doc)=>{
    var timestamp = Date.now()
    try{
        var senderInfo = await getUserInfo(client,doc.sender)
    }catch(err){
        console.log("sendMessage.js: Failed getUserInfo await ")
        throw err
    }
    console.log("createMessage.js: doc.convId : " + doc.convId)
    if(doc.convId == null){
        var promises = doc.participants.map(async el=> {
            return await getUserInfo(client,el).userId 
        })
        try {
            var participants = await Promise.all(promises) //participant Ids
        }catch(err){
            console.log("createMessage.js: Failed await for promises")
            throw err
        }
        try{
            var conv = await createConversation(client,senderInfo.userId,participants)                         
        }catch(err){
            console.log("createMessage.js: Failed await createConversation")
            throw err
        }
        
        
        try{
            await Promise.all([
                client.db('pay4sure')
                .collection('Messages')
                .insertOne({
                    convId:conv.convId,
                    msgId:new ObjectID().toHexString(),
                    creatorUserId:senderInfo.userId,
                    body:doc.message,
                    timestamp:timestamp
                }),

                client.db('pay4sure')
                .collection('User-Info')
                .updateOne({userId:senderInfo.userId},
                        {$push:{"pastConv":{convId:conv.convId,lastUsed:timestamp}}}
                )] + 
                participants.map(el=>{
                    return client.db('pay4sure')
                    .collection('User-Info')
                    .updateOne({userId:el},
                            {$push:{"pastConv":{convId:conv.convId,lastUsed:timestamp}}}
                    )
                }))
            return conv.convId
        }catch(err){
            console.log("createMessage.js:Try-Catch, err "+ err)
            throw err
        }
    } else {
        try {
            client.db('pay4sure')
            .collection('Messages')
            .insertOne({
                convId:doc.convId,
                msgId:new ObjectID().toHexString(),
                creatorUserId:senderInfo.userId,
                body:doc.message,
                timestamp:timestamp
            })
            client.db('pay4sure')
            .collection('User-Info')
            .updateOne({userId:senderInfo.userId,
                    "pastConv":{$elemMatch:{convId:doc.convId}}},
                    {$set:{"pastConv.$.lastUsed":timestamp}}
            )
            try{
                var participants = await client.db('User-Data').collection('Conversations').find({convId:doc.convId}).limit(1).toArray()
            }catch(err){
                console.log("createMessage.js: Failed await participants")
            }
            participants.forEach(el=>{
                client.db('pay4sure')
                .collection('User-Info')
                .updateOne({userId:el,
                        "pastConv":{$elemMatch:{convId:doc.convId}}},
                        {$set:{"pastConv.$.lastUsed":timestamp}}
                )
            })
            return doc.convId
        }catch(err){
            console.log("createMessage.js: Try-Catch")
            throw err
        }
    }
}