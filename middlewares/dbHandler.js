var config = require("@config")
const uri = config.DB_URI
var options = { 
                useNewUrlParser:true,
                useUnifiedTopology: true
              }
var MongoClient = require('mongodb').MongoClient
var client;

var getDb = async (req,res,next)=>{
    if(req.app.locals.db){
        console.log("DB connection exists")
        next()
    }
    else{
        client = new MongoClient(uri, options)
        console.log("DB connection doesnt exists, reconnecting")
        client.connect()
        .then(db=>{
            req.app.locals.db = db
            next()
        })
        .catch(err=>{
            console.log("GetDb: Failed to Connect To Db, err " + err)
            res.json({status:500})
        })
    }
}

module.exports = getDb
