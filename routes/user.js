var express = require('express');
var router = express.Router();
//accessing product helprs
var productHelpers = require('../helpers/product-helpers');

/* GET home page. */
router.get('/', function (req, res, next) {
  //accessing product detailes from DB
  productHelpers.getAllProducts().then((products) => {
    //console.log(products)
    res.render("user/view-products", { products, admin: false })

  })
});
router.get('/login',(req, res, next)=>{
  res.render("user/login")
})
router.post('/user/login',(req, res, next)=>{
  res.send("Log in successful...")
})
router.get('/signup',(req, res, next)=>{
  res.render("user/signup")
})
router.post('/user/signup',(req, res, next)=>{
  res.send("Sign up successful...")
})

module.exports = router;
