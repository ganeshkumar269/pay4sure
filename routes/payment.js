require('module-alias/register')
//importing packages
var config = require("@config")
var stripe  = require("stripe")((config.STRIPE_SECRET_KEY).toString())
var paypal = require('paypal-rest-sdk')
var jwt = require('jsonwebtoken')


//importing custom files
var creditAmount = require('@creditAmount')
var getUserCredentials = require('@getUserCredentials')



//declaring app variables




module.exports = async(request,response) => {
    console.log("payment.js: Request Arrived")
    var mode = request.body.mode
    var token = request.body.token
    var client = request.app.locals.db;
    console.log("payment.js: mode " + mode)
    var chargeAmount = parseInt(request.body.chargeAmount)
    if(mode == "stripe"){
        var token = request.body.stripeToken
        const options = {
            amount:chargeAmount,
            currency:"inr",
            source:token
        }
        var charge = await stripe.charges.create(options,(err,charge)=>{
            if(err & typeof(err) === "StripeCardError"){
                console.log("Card was declined by stripe")
                response.status(401).json({status:401,message:"Card was declined by stripe"})
            }
        })
        try{
            var userData = await jwt.verify(token,"secretkey")
        }catch(err){
            console.log("payment.js: Failed JWT verification , err " + err)
            response.status(500).json({status:500,message:"Internal Error"})
        }
        try{
            var userInfo = await getUserCredentials(client,"5e481628693664001794b587") 
        }catch(err){
            console.log("payment.js: Failed await getUserCredentials")
            response.status(500).json({status:500,message:"Internal Error"})
        }
        console.log("payment.js: userInfo :" + userInfo)
        try{
            await creditAmount(client,userInfo,chargeAmount)
        }catch(err){
            console.log("payment.js: Error in crediting amount")
            response.status(500).json({status:500,message:"Error in crediting amount"})
        }
        response.status(200).json({status:200,message:"Payment Successfull",amountLeft:userInfo.amountLeft+chargeAmount})
    }else if(mode == "paypal"){
        paypal.configure({
                'mode': 'sandbox', //sandbox or live 
                'client_id': (config.PAYPAL_PUBLIC_KEY).toString(), // please provide your client id here 
                'client_secret': (config.PAYPAL_SECRET_KEY).toString() // provide your client secret here 
                });
        var payment = {
            "intent": "sale",
            "payer": {
                "payment_method": "paypal"
            },
            "redirect_urls": {
                "return_url": "http://localhost:3000/api/v1/success",
                "cancel_url": "http://localhost:3000/api/v1/error"
            },
            "transactions": [{
                "amount": {
                    "total": chargeAmount,
                    "currency": "INR"
                },
                "description": " a book on mean stack "
            }]
        }
        paypal.payment.create(payment,(err,payment)=>{
            if(err) console.log( "payment.js: err , " + err)
            else{
                console.log(payment)
                var id = payment.id; 
                var links = payment.links;
                var counter = links.length; 
                while(counter--)
                    if(links[counter].method == 'REDIRECT') // redirect to paypal where user approves the transaction 
                        response.redirect(links[counter].href)
            }
        })
    }
}