var express = require('express');
var router = express.Router();
//accessing product helprs
const productHelpers = require('../helpers/product-helpers');
const userHelpers = require('../helpers/user-helpers')

/* GET home page. */
router.get('/', function (req, res, next) {
  //user loggedin section
  let user=req.session.user
  //accessing product detailes from DB
  productHelpers.getAllProducts().then((products) => {
    console.log('session',user)
    res.render("user/view-products", { products, admin: false, user })
  })
});
router.get('/login', (req, res, next) => {
  res.render("user/login")
})
router.post('/user/login', (req, res, next) => {
  userHelpers.doLogin(req.body).then((response) => {
    //console.log(response.staus)
    if (response.status) {
      //user loggedin session
      req.session.loggedIn=true
      req.session.user=response.user
      //the page already mentioned above. So there using redirect
      res.redirect('/')
    } else {
      res.redirect('/login')
    }
  })
})
router.get('/signup', (req, res, next) => {
  res.render("user/signup")
})
router.post('/user/signup', (req, res, next) => {
  userHelpers.doSignup(req.body).then((response) => {
    //console.log(response)
    res.redirect('/login')
  })
})
router.get('/logout', (req, res, next)=>{
  //clearing the session
  req.session.destroy()
  res.render('user/logout')
})

module.exports = router;
