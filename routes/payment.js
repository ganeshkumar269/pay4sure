//importing packages
require('module-alias/register')
var config = require("@config")
var stripe  = require("stripe")((config.STRIPE_SECRET_KEY).toString())
var paypal = require('paypal-rest-sdk')

//importing custom files


//declaring app variables



var createPay = (payment) => {
    return new Promise((resolve,reject) => {
        paypal.payment.create( payment , function( err , payment ) {
            if(err) reject(err) 
            else{
                console.log(payment)
                resolve(payment) 
            }
        })
    })
}


module.exports = async(request,response) => {
    console.log("payment.js: Request Arrived")
    var mode = request.body.mode
    console.log("payment.js: mode " + mode)
    var chargeAmount = parseInt(request.body.chargeAmount)
    if(mode == "stripe"){
        var token = request.body.stripeToken
        const options = {
            amount:chargeAmount,
            currency:"inr",
            source:token
        }
        console.log(options)
        var charge = await stripe.charges.create(options,(err,charge)=>{
            if(err & typeof(err) === "StripeCardError"){
                console.log("Card was declined by stripe")
                response.status(401).json({status:401,message:"Card was declined by stripe"})
            }
        })
        response.status(200).json({status:200,message:"Payment Successfull"})
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
        console.log(payment)
        paypal.payment.create( payment , function( err , payment ) {
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
        // createPay(payment) 
        // .then((transaction) => {
        //     var id = transaction.id; 
        //     var links = transaction.links;
        //     var counter = links.length; 
        //     while( counter -- ) {
        //         if ( links[counter].method == 'REDIRECT') {
		// 			// redirect to paypal where user approves the transaction 
        //             response.redirect( links[counter].href )
        //         }
        //     }
        // })
        // .catch(err => { 
        //     console.log( "payment.js: err , " + err )
        //     response.redirect('/api/v1/error')
        // })
    }
}