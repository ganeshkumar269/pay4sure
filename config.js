const dotenv = require('dotenv')
dotenv.config()

module.exports = {
    DB_URI : process.env.DB_URI,
    STRIPE_PUBLIC_KEY:process.env.STRIPE_PUBLIC_KEY,
    STRIPE_SECRET_KEY:process.env.STRIPE_SECRET_KEY,
    PAYPAL_PUBLIC_KEY:process.env.PAYPAL_PUBLIC_KEY,
    PAYPAL_SECRET_KEY:process.env.PAYPAL_SECRET_KEY
}