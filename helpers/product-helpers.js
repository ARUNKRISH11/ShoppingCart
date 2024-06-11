//Product related functions

var db=require('../config/connection').get
var client=require('../config/connection').client
module.exports={
    //function addProduct with argument product
    addProduct:(product,callback)=>{
        console.log(product)
        async function run() {
            try {
        
              await client.db('product').collection('user').insertOne(product).then((data)=>{
                callback(true)
              })
        
            } finally {
              // Ensures that the client will close when you finish/error
              await client.close();
            }
          }
          run().catch(console.dir);        
          
          //db.collection('product').insertOne(product).then((data)=>{
            //callback(true)
        //})
    }
}