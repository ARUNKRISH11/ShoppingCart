//Product related functions

//var db=require('../config/connection').get

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = 'mongodb://0.0.0.0:27017/'

const client = new MongoClient(uri,  {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
}
);

module.exports = {
    //function addProduct with argument product
    addProduct: (productDetailes, callback) => {
        console.log(productDetailes)

        async function productDB(product) {
            //dbName and collectionName
            const dbName = 'shopping'
            const collectionName = 'product'
            await client.db(dbName).collection(collectionName).insertOne(product).then((data)=>{
                //accessing Object id
                const objectId =(data.insertedId).toString()
                console.log(objectId)
                callback(objectId)
            })
        }
        productDB(productDetailes)
    }
}