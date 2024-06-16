var dataBase = require('../config/db-connect')
const bcrypt = require('bcrypt'); //npm i bcrypt
const { response } = require('express');
const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = 'mongodb://0.0.0.0:27017/'
var objectId = require('mongodb').ObjectId

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
}
);

module.exports = {
    doSignup: (userData) => {
        let response = {}
        return new Promise(async (resolve, reject) => {
            //callback or await: for execution of one line of code then other
            userData.password = await bcrypt.hash(userData.password, 10)
            await client.db(dataBase.DBNAME).collection(dataBase.USER_COLLECTION).insertOne(userData).then((data) => {
                return new Promise(async (resolve, reject) => {
                    let user = await client.db(dataBase.DBNAME).collection(dataBase.USER_COLLECTION).findOne({ email: userData.email })
                    response.user = user
                    //console.log('user response')
                    //console.log(response.user)
                    //userId=data.insertedId.toString()
                    resolve(response)
                })

            })
            console.log(response)
            resolve(response)
        })
    },
    doLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            let loginStatus = false
            let response = {}
            //matching email
            let user = await client.db(dataBase.DBNAME).collection(dataBase.USER_COLLECTION).findOne({ email: userData.email })
            if (user) {
                //matching password 
                bcrypt.compare(userData.password, user.password).then((status) => {
                    if (status) {
                        console.log("Login success")
                        response.user = user
                        response.status = true
                        resolve(response)
                    } else {
                        console.log("Login failed. Check your password!")
                        resolve({ status: false })
                    }
                })
            } else {
                console.log("Login failed. User not found!")
                resolve({ status: false })
            }
        })
    },
    //add to cart: creating DB with users id
    addToCart: (productId, userId, user) => {
        return new Promise(async (resolve, reject) => {
            //if the user have cart, the product will add to cart otherwise create db cart and add.
            let userCart = await client.db(dataBase.DBNAME).collection(dataBase.CART_COLLECTION).findOne({ user: new objectId(userId) })
            if (userCart) {
                //console.log('started if')
                await client.db(dataBase.DBNAME).collection(dataBase.CART_COLLECTION).updateOne(
                    {
                        user: new objectId(userId)
                    },
                    {
                        $push: { products: new objectId(productId) }
                    }
                ).then((response) => {
                    resolve()
                })
                //console.log('insert error')
            } else {
                //creat cart collection: contain user id and product array
                let cartObj = {
                    userName: user.name,
                    user: new objectId(userId),
                    products: [new objectId(productId)]
                }
                await client.db(dataBase.DBNAME).collection(dataBase.CART_COLLECTION).insertOne(cartObj).then((response) => {
                    resolve()
                })
            }
        })
    },
    //all added products 
    getCartProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cartItems = await client.db(dataBase.DBNAME).collection(dataBase.CART_COLLECTION).aggregate([
                {
                    //selecting the cart
                    $match: { user: new objectId(userId) }
                },
                {
                    //SQL joining two tables
                    $lookup: {
                        from: dataBase.CART_COLLECTION,
                        //accessing variable productList to all available products from DB
                        let: { productList: '$products' },
                        pipeline: [
                            {
                                $match: { //writing conditions
                                    $expr: {
                                        //matching id with all id in productList
                                        $in: ['$_id', '$$productList']
                                    }
                                }
                            }
                        ],
                        //we got productList
                        as: 'cartItems'
                    }
                }
            ]).toArray()
            resolve(cartItems[0].cartItems)
        })
    }
}