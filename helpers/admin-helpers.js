//Product related functions

//var db=require('../config/connection')
const { log } = require('handlebars');
var dataBase = require('../config/db-connect')
//accessing object id for deletion of the product
var objectId = require('mongodb').ObjectId
const bcrypt = require('bcrypt'); //npm i bcrypt


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
        //console.log(productDetailes)

        async function productDB(product) {
            await client.db(dataBase.DBNAME).collection(dataBase.PRODUCT_COLLECTION).insertOne(product).then((data) => {
                //accessing Object id and return
                const objectId = (data.insertedId).toString()
                //console.log("Id from product helpers", objectId)
                callback(objectId)
            })
        }
        productDB(productDetailes)
    },
    //accessing product detailes from DB
    //Promise: recive the data using 'then', where the function is calling
    getAllProducts: () => {
        return new Promise(async (resolve, reject) => {
            let products = await client.db(dataBase.DBNAME).collection(dataBase.PRODUCT_COLLECTION).find().toArray()
            //await for execution of the line of action
            resolve(products)
        })
    },
    deleteProduct: (productId) => {
        //console.log('helpers', productId)
        return new Promise(async (resolve, reject) => {
            await client.db(dataBase.DBNAME).collection(dataBase.PRODUCT_COLLECTION).deleteOne({ _id: new objectId(productId) }).then((response) => {
                //gathering the informations about deleted item
                //console.log(response);
                resolve(response)
            })
        })
    },
    getProductDetailes: (productId) => {
        return new Promise(async (resolve, reject) => {
            await client.db(dataBase.DBNAME).collection(dataBase.PRODUCT_COLLECTION).findOne({ _id: new objectId(productId) }).then((product) => {
                resolve(product)
            })
        })
    },
    updateProduct: (productId, productDetailes) => {
        return new Promise(async (resolve, reject) => {
            //console.log('function start')
            await client.db(dataBase.DBNAME).collection(dataBase.PRODUCT_COLLECTION).updateOne(
                {
                    _id: new objectId(productId)
                },
                {
                    //items want to update
                    $set: {
                        name: productDetailes.name,
                        category: productDetailes.category,
                        price: productDetailes.price,
                        description: productDetailes.description
                    }
                }
            ).then((response) => {
                resolve()
            })
            //console.log('function end')
        })
    },
    //get all users
    getAllUsers: () => {
        return new Promise((resolve, reject) => {
            users = client.db(dataBase.DBNAME).collection(dataBase.USER_COLLECTION).find().toArray()
            //console.log(users);
            resolve(users)
        })
    },
    //get orders of particular user
    getUserOrders: (userId) => {
        return new Promise(async (resolve, reject) => {
            //console.log(userId);
            let orders = await client.db(dataBase.DBNAME).collection(dataBase.ORDER_COLLECTION).find(
                { userId: new objectId(userId) }
            ).toArray()
            //console.log(orders);
            resolve(orders)
        })
    },
    //ger products of certain order
    getOrderProducts: (orderId) => {
        return new Promise(async (resolve, reject) => {
            let orderItems = await client.db(dataBase.DBNAME).collection(dataBase.ORDER_COLLECTION).aggregate([
                {
                    //selecting the cart
                    $match: { _id: new objectId(orderId) }
                },
                {
                    //create multiple obj for different product ids
                    $unwind: '$products'
                },
                {
                    //selecting item and quantity from DB Cart and assign to variables
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        //matching products id with products from DB
                        from: dataBase.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        //whichone want to project from cart to product array
                        item: 1,
                        quantity: 1,
                        product: { $arrayElemAt: ['$product', 0] }
                    }
                }
            ]).toArray()
            resolve(orderItems)
        })
    },
    doLoginAdmin: (adminData) => {
        return new Promise(async (resolve, reject) => {
            let loginStatus = false
            let response = {}
            //matching email
            let admin = await client.db(dataBase.DBNAME).collection(dataBase.ADMIN_COLLECTION).findOne({ email: adminData.email })
            if (admin) {
                //matching password 
                bcrypt.compare(adminData.password, admin.password).then((status) => {
                    if (status) {
                        //console.log("Login success")
                        response.admin = admin
                        response.status = true
                        resolve(response)
                    } else {
                        //console.log("Login failed. Check your password!")
                        resolve({ status: false })
                    }
                })
            } else {
                //console.log("Login failed. User not found!")
                resolve({ status: false })
            }
        })
    },
    doSignupAdmin: (adminData) => {
        let response = {}
        return new Promise(async (resolve, reject) => {
            //callback or await: for execution of one line of code then other
            adminData.password = await bcrypt.hash(adminData.password, 10)
            await client.db(dataBase.DBNAME).collection(dataBase.ADMIN_COLLECTION).insertOne(adminData).then((data) => {
                return new Promise(async (resolve, reject) => {
                    let admin = await client.db(dataBase.DBNAME).collection(dataBase.ADMIN_COLLECTION).findOne({ email: adminData.email })
                    response.admin = admin
                    resolve(response)
                })
            })
            resolve(response)
        })
    },
    getAllOrders: () => {
        return new Promise((resolve, reject) => {
            orders = client.db(dataBase.DBNAME).collection(dataBase.ORDER_COLLECTION).find().toArray()
            resolve(orders)
        })
    }

}