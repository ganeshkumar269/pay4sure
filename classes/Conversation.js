var ObjectID  = require('mongodb').ObjectID;

class Conversation {
    constructor(creatorUserId , participants){
        this._convId = new ObjectID().toHexString()
        this._createdAt = Date.now()
        this._creatorId = creatorUserId
        this._participants = []
        this._participants.forEach(el=>_participants.push(el))
        this._lastUsed = Date.now()
    }

    get convId(){
        return this._convId
    }

    get createdAt(){
        return this._createdAt
    }
    get creatorId(){
        return this._creatorId 
    }
    get participants(){
        return this._participants
    }
    get lastUsed(){
        return this._lastUsed
    }
    set convId(x){
        this._convId = x
    }
    set createdAt(x){
        this._createdAt = x
    }
    set creatorId(x){
        this._creatorId = x 
    }
    set participants(x){
        this._participants = x
    }
    set lastUsed(x){
        this._lastUsed = x
    }
    addParticipant(x){
        this._participants.push(x)
    }
    json(){
        return {
            convId :this._convId,
            createdAt : this._createdAt,
            creatorId : this._creatorId,
            participants : this._participants,
            lastUsed : this._lastUsed
        }
    }
} 

module.exports = Conversation