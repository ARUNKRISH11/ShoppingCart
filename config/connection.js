const mongoClient=('mongodb').MongoClient
const state={
    db:null
}

module.exports.connect=function(done){ //you can use the function connect by using requiring connection.js
    const url='mongodb://localhost:27017'
    const dbname='shopping'

    mongoClient.connect(url,(err,data)=>{
        if(err) return done(err)
        state.db=data.db(dbname)
    })

    done()

}

module.exports.get=function(){
    return state.db
}