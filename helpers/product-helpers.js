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

module.exports={
    //function addProduct with argument product
    addProduct:(product,callback)=>{
        console.log(product)
        async function productDB(product){
            await client.db('product').collection('phone').insertOne(product)
            callback(true)
        }
        productDB(product)          
          //db.collection('product').insertOne(product).then((data)=>{
            //callback(true)
        //})
    }
}