


module.exports = async (client,userId)=>{   
    return client.db('pay4sure')
    .collection('Credentials')
    .find({"userId":userId},{_id:0,userId:0})
    .limit(1).toArray()
    .then(res=> {
        return res[0]
    })
    .catch(err=>{
        console.log("login.js: Error in client.connect.find: " + err)
        throw err
    })
}