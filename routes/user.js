var express = require('express');
var router = express.Router();
//accessing product helprs
const productHelpers = require('../helpers/product-helpers');
const userHelpers = require('../helpers/user-helpers')

/* GET home page. */
router.get('/', function (req, res, next) {
  //accessing product detailes from DB
  productHelpers.getAllProducts().then((products) => {
    //console.log(products)
    res.render("user/view-products", { products, admin: false })

  })
});
router.get('/login', (req, res, next) => {
  res.render("user/login")
})
router.post('/user/login', (req, res, next) => {
  userHelpers.doLogin(req.body).then((response)=>{
    if (response.staus) {
      //the page already mentioned above. So there using redirect
      res.redirect('/')
    }else{
      res.redirect('/user/login')
    }
  })
  res.send("Log in successful...")
})
router.get('/signup', (req, res, next) => {
  res.render("user/signup")
})
router.post('/user/signup', (req, res, next) => {
  userHelpers.doSignup(req.body).then((response) => {
    console.log(response)
    res.send("Sign up successful...")
  })
})

module.exports = router;
