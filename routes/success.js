var paypal = require('paypal-rest-sdk')


module.exports = async (req,s) => { 
    var chargeAmount = req.query.chargeAmount
    var PayerID = req.query.PayerID;
    var paymentId = req.query.paymentId;
    var execute_payment_json = {
        payer_id: PayerID,
        transactions: [
            {
                amount: {
                    currency: "INR",
                    total: chargeAmount
                }
            }
        ]
    };

    paypal.payment.execute(paymentId, execute_payment_json,(error,payment)=> {
        if (error) {
            console.log(error);
            console.log(error.response.details)
            s.status(500).send("Internal Error")
        } else {
            console.log("success.js:Got Payment Response");
            console.log("success.js:" ,JSON.stringify(payment));
            s.sendFile(path.join(__dirname + '../public/success.html'))
        }
    });
}