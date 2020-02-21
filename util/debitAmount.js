require('module-alias/register')

//importing packages



//importing custom files



//declaring app variables


module.exports = async (client,userInfo,debitAmount) => {
    try{
        await client.db('pay4sure').collection('Credentials')
        .updateOne({userId:userInfo.userId},{$inc:{amountLeft:-debitAmount}})
        console.log("debitAmount.js: Amount Debited")
    }catch(err){
        throw err
    }
}