var express = require('express');
var router = express.Router();
//accessing product helprs
const productHelpers = require('../helpers/product-helpers');
const userHelpers = require('../helpers/user-helpers')
//user loggedin 
const verifyLogin = (req, res, next) => {
  if (req.session.loggedIn) {
    next()
  } else {
    res.redirect('/login')
  }
}

/* GET home page. */
router.get('/', function (req, res, next) {
  //user loggedin section
  let user = req.session.user
  //accessing product detailes from DB
  productHelpers.getAllProducts().then((products) => {
    //console.log('session', user)
    res.render("user/view-products", { products, admin: false, user })
  })
});
router.get('/login', (req, res, next) => {
  if (req.session.loggedIn) {
    res.redirect('/')
  } else {
    res.render("user/login", { 'LoginError': req.session.loginError })
    req.session.loginError = false
  }
})
router.post('/user/login', (req, res, next) => {
  userHelpers.doLogin(req.body).then((response) => {
    //console.log(response.staus)
    if (response.status) {
      //user loggedin session
      req.session.loggedIn = true
      req.session.user = response.user
      //the page already mentioned above. So there using redirect
      res.redirect('/')
    } else {
      //user not found message
      req.session.loginError = 'Check your email address or password once again!'
      res.redirect('/login')
    }
  })
})
router.get('/signup', (req, res, next) => {
  console.log(req.session.loggedIn)
  if (req.session.loggedIn) {
    res.redirect('/')
  } else {
    res.render("user/signup")
    req.session.loggedIn=false
  }
})
router.post('/user/signup', (req, res, next) => {
  userHelpers.doSignup(req.body).then((response) => {
    //console.log('response error')
    //console.log(response)
    req.session.loggedIn = true
    req.session.user = response.user
    res.redirect('/')
  })
})
router.get('/logout', (req, res, next) => {
  //clearing the session
  req.session.destroy()
  res.render('user/logout')
})
router.get('/cart', verifyLogin, (req, res, next) => {
  let user = req.session.user
  res.render('user/cart', { user })
})

module.exports = router;
