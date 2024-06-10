const { MongoClient, ServerApiVersion } = require("mongodb");
const state={
    db:null
}

module.exports.connect=function(done){ //you can use the function connect by using requiring connection.js
    const url = 'mongodb://0.0.0.0:27017/'
    const dbname='shopping'

    // Create a MongoClient with a MongoClientOptions object to set the Stable API version
  const client = new MongoClient(url, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
}
);

async function run() {
try {
// Connect the client to the server (optional starting in v4.7)
await client.connect();

// Send a ping to confirm a successful connection
// client same as data
// DB creation code from official mongodb site check telegram
await client.db("admin").command({ ping: 1 });
state.db=client.db(dbname)
    done()
console.log("Pinged your deployment. You successfully connected to MongoDB!");
} finally {
// Ensures that the client will close when you finish/error
await client.close();
}
}
run().catch(console.dir);

}

module.exports.get=function(){
    return state.db
}