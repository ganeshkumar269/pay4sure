require('module-alias/register')

//importing packages



//importing custom files



//declaring app variables


module.exports = async (client,userInfo,debitAmount) => {
    await client.db('pay4sure').collection('Credentials')
        .update({userId:userInfo.userId},{$inc:{amountLeft:-debitAmount}})
}