require('module-alias/register')
var express = require('express');
var bodyParser = require('body-parser');
var Ddos = require('ddos')
var cors = require('cors')
var MongoClient = require('mongodb').MongoClient
var path = require('path');


//importing utility functions
var config = require("@config")



// App variables
var app = express();
var ddos = new Ddos({burst:5, limit:15})
const uri = config.DB_URI
var options = { useNewUrlParser:true,useUnifiedTopology:true}
var client = new MongoClient(uri, options)



//importing route handlers
var createHandler = require('./routes/create.js')
var loginHandler = require('./routes/login.js')
var paymentHandler = require('./routes/payment.js')

//importing middlewares
var splitToken = require('./middlewares/splitToken.js')
var dbHandler = require("@dbHandler")




//express handles
app.use(ddos.express)
app.use(bodyParser.urlencoded({extended : true}))
app.use(bodyParser.json())
app.use(cors())
app.options("*",cors())
app.use(express.static('public'))

//GET methods
app.get('/',(q,s) => {
    console.log("Home Page Request Arrived")
    s.send('index.html')
})
app.get('/api/v1/charge',(q,s)=>{
    s.sendFile(path.join(__dirname + '/public/pay.html'))
})
app.get('/api/v1/success',(q,s) => { s.sendFile(path.join(__dirname + '/public/success.html'))})
app.get('/api/v1/error',(q,s) => { s.sendFile(path.join(__dirname + '/public/error.html'))})


//POST methods
app.post('/api/v1/create',dbHandler,createHandler);
app.post('/api/v1/login',dbHandler,loginHandler);
app.post('/api/v1/payment',dbHandler,paymentHandler)

//Listener
client.connect()
    .then(db => {
        console.log("Connected to DB")
        app.locals.db = db
        app.listen(process.env.PORT || 3000, () => {console.log(`Node.js app is listening at http://localhost:3000`)})
    })
    .catch(err => console.error(err.stack))
