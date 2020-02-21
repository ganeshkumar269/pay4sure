//importing packages


//importing custom files


//declaring app variables


module.exports = async(client,record) => {
    try{
        await client.db('pay4sure').collection('TransactionRecords').insertOne(record)
        console.log("addRecord.js: Record added")
    }catch(err){
        throw err
    }
}