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
        let productObj = {
            item: new objectId(productId),
            quantity: 1
        }
        return new Promise(async (resolve, reject) => {
            //if the user have cart, the product will add to cart otherwise create db cart and add.
            let userCart = await client.db(dataBase.DBNAME).collection(dataBase.CART_COLLECTION).findOne({ user: userId })
            if (userCart) {
                //console.log('started if')
                let productExist = userCart.products.findIndex(product => product.item == productId)
                //console.log('product exist');
                //product index -1: not eixst 
                if (productExist != -1) {
                    //user have cart and adding same product
                    await client.db(dataBase.DBNAME).collection(dataBase.CART_COLLECTION).updateOne(
                        {
                            //error while different user adding same item (solved)
                            'user': userId,
                            'products.item': new objectId(productId)
                        },
                        {
                            //increament function to increse product quantity
                            $inc: { 'products.$.quantity': 1 }
                        }).then(() => {
                            resolve()
                        })
                } else {
                    //user have cart and adding different product
                    await client.db(dataBase.DBNAME).collection(dataBase.CART_COLLECTION).updateOne(
                        {
                            //matching userid with user
                            user: userId
                        },
                        {
                            $push: { products: productObj }
                        }
                    ).then((response) => {
                        resolve()
                    })
                    //console.log('insert error')
                }

            } else {
                //creat cart collection: contain user id and product array
                let cartObj = {
                    userName: user.name,
                    user: userId,
                    products: [productObj]
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
            let cartUser = await client.db(dataBase.DBNAME).collection(dataBase.CART_COLLECTION).findOne({ user: userId })
            if (cartUser) {
                let cartItems = await client.db(dataBase.DBNAME).collection(dataBase.CART_COLLECTION).aggregate([
                    {
                        //selecting the cart
                        $match: { user: userId }
                    },
                    {
                        //SQL joining two tables
                        $lookup: {
                            from: dataBase.PRODUCT_COLLECTION,
                            //accessing variable productList to all available products from DB array
                            let: { productList: '$products' },
                            pipeline: [
                                {
                                    //writing conditions to match user products array to products DB
                                    $match: {
                                        $expr: {
                                            //matching product collection id with all id in productList
                                            //issue while matching the ID's
                                            $in: ['$_id', '$$productList']
                                        }
                                    }
                                }
                            ],
                            //we got productList and it saving
                            //matching items(productList with products DB) saving in cartItems
                            as: 'cartItems'
                        }
                    }
                ]).toArray()
                productId = cartItems[0].cartItems
            } else {
                productId = false
            }
            resolve(productId)
        })
    },
    //cart items count
    getCartCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cartCount = 0
            let cartUser = await client.db(dataBase.DBNAME).collection(dataBase.CART_COLLECTION).findOne({ user: userId })
            if (cartUser) {
                //finding array elements
                cartCount = cartUser.products.length
            }
            resolve(cartCount)
        })
    }
}