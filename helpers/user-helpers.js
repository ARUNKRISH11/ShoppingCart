var dataBase = require('../config/db-connect')
const bcrypt = require('bcrypt') //npm i bcrypt
const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = 'mongodb://0.0.0.0:27017/'

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
        return new Promise(async (resolve, reject) => {
            //callback or await: for execution of one line of code then other
            userData.password = await bcrypt.hash(userData.password, 10)
            await client.db(dataBase.DBNAME).collection(dataBase.USER_COLLECTION).insertOne(userData).then((data) => {
                resolve(data.insertedId.toString())

            })
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
                        response.user=user
                        response.status=true
                        resolve(response)
                    } else {
                        console.log("Login failed. Check your password!")
                        resolve({status:false})
                    }
                })
            } else {
                console.log("Login failed. User not found!")
                resolve({status:false})
            }
        })
    }

}