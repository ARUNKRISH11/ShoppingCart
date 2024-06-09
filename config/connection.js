var MongoClient = require('mongodb').MongoClient;
const state={
    db:null
}

module.exports.connect=function(done){ //you can use the function connect by using requiring connection.js
    const url = 'mongodb://127.0.0.1:27017';
    const dbname='shopping'

    MongoClient.connect(url,(err,data)=>{
        if(err) return done(err)
        else state.db=data.db(dbname)
        done()
        console.log("Connected")

    })
}

module.exports.get=function(){
    return state.db
}