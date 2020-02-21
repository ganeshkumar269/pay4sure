


module.exports = async (client,username)=>{   
    return client.db('pay4sure')
    .collection('Credentials')
    .find({"username":username},{_id:0})
    .limit(1).toArray()
    .then(res=> {
        return res[0]
    })
    .catch(err=>{
        console.log("login.js: Error in client.connect.find: " + err)
        throw err
    })
}