require('module-alias/register')
//importing packages
var config = require("@config")
var stripe  = require("stripe")((config.STRIPE_SECRET_KEY).toString())
var paypal = require('paypal-rest-sdk')
var jwt = require('jsonwebtoken')



//importing custom files
var creditAmount = require('@creditAmount')
var getUserCredentialsByUsername = require('@getUserCredentialsByUsername')



//declaring app variables




module.exports = async(request,response) => {
    console.log("payment.js: Request Arrived")
    var mode = request.body.modeOfPayment
    // let authToken =  request['token']
    // console.log("payment.js:Token:" + authToken)
    var client = request.app.locals.db
    console.log("payment.js: mode " + mode) 
    var chargeAmount = parseInt(request.body.chargeAmount)
    console.log("payment.js: chargeAmount : " + chargeAmount)
    if(mode == "stripe"){
        var stripeToken = request.body.stripeToken
        console.log("payment.js: stripeToken: " + stripeToken)
        const options = {
            amount:chargeAmount,
            currency:"inr",
            source:stripeToken
        }
        var charge = await stripe.charges.create(options,(err,charge)=>{
            if(err & typeof(err) === "StripeCardError"){
                console.log("Card was declined by stripe")
                response.status(401).json({status:401,message:"Card was declined by stripe"})
            }
        })
        try{
            var userData = await jwt.verify(authToken,"secretkey")
            console.log("payment.js: userData " + JSON.stringify(userData))
        }catch(err){
            console.log("payment.js: Failed JWT verification , err " + err)
            response.status(500).json({status:500,message:"Internal Error"})
        }
        try{
            var userInfo = await getUserCredentialsByUsername(client,userData.user.username) 
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
        let amountLeft = userInfo.amountLeft+chargeAmount
        response.status(200).json({status:200,message:"Payment Successfull",amountLeft:amountLeft})
    }else if(mode == "paypal"){
        paypal.configure({
                'mode': 'sandbox', //sandbox or live 
                'client_id': (config.PAYPAL_PUBLIC_KEY).toString(), // please provide your client id here 
                'client_secret': (config.PAYPAL_SECRET_KEY).toString() // provide your client secret here 
                });
        let successUrl = "http://localhost:3000/api/v1/success?chargeAmount=" + chargeAmount
        console.log("payment.js:SuccessUrl  ",successUrl)
        var payment = {
            "intent": "sale",
            "payer": {
                "payment_method": "paypal"
            },
            "redirect_urls": {
                "return_url": successUrl,
                "cancel_url": "http://localhost:3000/api/v1/error"
            },
            "transactions": [{
                "amount": {
                    "total": chargeAmount,
                    "currency": "INR"
                }
            }]
        }
        paypal.payment.create(payment,(err,payment)=>{
            if(err) {
                console.log( "payment.js: err , " + err)
                response.status(500).json({status:500,message:"Internal Error"})
            }else{
                console.log("payment.js: Sent to paypal")
                var id = payment.id;
                console.log("payment.js: paymentId ",id) 
                var links = payment.links;
                var counter = links.length; 
                while(counter--)
                    if(links[counter].method == 'REDIRECT') // redirect to paypal where user approves the transaction 
                        response.json({status:200,redirect_url:links[counter].href})
            }
        })
    }
}