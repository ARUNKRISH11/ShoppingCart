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
                //console.log('cart items');
                //console.log(cartItems);
                resolve(cartItems)
            } else {
                cartItems = false
                resolve(cartItems)
            }
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
    },
    //change quantity
    //variables in this order set in script (ajax) file
    changeQuantity: (detailes) => {
        //console.log('function running');
        //console.log(detailes.cart,detailes.product,detailes.count)
        return new Promise(async (resolve, reject) => {
            count = parseInt(detailes.count)
            quantity = parseInt(detailes.quantity)
            if (count == -1 && quantity == 1) {
                await client.db(dataBase.DBNAME).collection(dataBase.CART_COLLECTION).updateOne(
                    {
                        _id: new objectId(detailes.cart)
                    },
                    {
                        //removing one product from cart
                        $pull: { products: { item: new objectId(detailes.product) } }
                    }
                ).then((response) => {
                    resolve({ removeProduct: true })
                })
            } else {
                await client.db(dataBase.DBNAME).collection(dataBase.CART_COLLECTION).updateOne(
                    {
                        //error while different user adding same item (solved)
                        '_id': new objectId(detailes.cart),
                        'products.item': new objectId(detailes.product)
                    },
                    {
                        //increament function to increse product quantity
                        $inc: { 'products.$.quantity': count }
                    }).then((response) => {
                        resolve(true)
                    })
            }

        })
    },
    //remove product
    removeProduct: (detailes) => {
        return new Promise(async (resolve, reject) => {
            await client.db(dataBase.DBNAME).collection(dataBase.CART_COLLECTION).updateOne(
                {
                    _id: new objectId(detailes.cart)
                },
                {
                    //removing one product from cart
                    $pull: { products: { item: new objectId(detailes.product) } }
                }
            ).then((response) => {
                resolve()
            })
        })
    },
    //get total amount
    getTotalAmount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let total = await client.db(dataBase.DBNAME).collection(dataBase.CART_COLLECTION).aggregate([
                {
                    //selecting the cart
                    $match: { user: userId }
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
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: { $multiply: ['$quantity', '$product.price'] } }
                    }
                }
            ]).toArray()
            //console.log('cart items');
            //console.log(total[0].total);
            resolve(total[0].total)
        })
    }
}