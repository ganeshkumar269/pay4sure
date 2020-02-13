
module.exports = async (client,username)=>{
    try{
        return client.db('pay4sure')
        .collection("Credentials")
        .find({"username":username},{_id:0,userId:0,hashedPassword:0})
        .limit(1)
        .toArray()
        .then(res=>{
            console.log("userExists.js: userExists? :" + res.length);
            if(res.length < 1)
                return false              
            else 
                return true                
        }).catch(err=>{
            console.log("userExists.js: Failed to find Credentials")
            throw err
        })
    }catch(err){
        console.log("userExists.js: Try-Catch")
        throw err
    }
}