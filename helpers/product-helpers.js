//Product related functions

//var db=require('../config/connection')
var collection = require('../config/collection')

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = 'mongodb://0.0.0.0:27017/'
//dbName and collectionName
const dbName = 'shopping'
const collectionName = 'product'

const client = new MongoClient(uri, {
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
            await client.db(dbName).collection(collectionName).insertOne(product).then((data) => {
                //accessing Object id and return
                const objectId = (data.insertedId).toString()
                console.log("Id from product helpers", objectId)
                callback(objectId)
            })
        }
        productDB(productDetailes)
    },
    //accessing product detailes from DB
    //Promise: recive the data using 'then', where the function is calling
    getAllProducts: () => {
        return new Promise(async (resolve, reject) => {
            let products = await client.db(dbName).collection(collectionName).find().toArray()
            //await for execution of the line of action
            resolve(products)
        })
    }


}