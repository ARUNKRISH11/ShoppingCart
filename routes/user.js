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
router.get('/', async function (req, res, next) {
  let user = req.session.user
  if (user) {
    //user loggedin section
    //cart items count
    let cartCount = await userHelpers.getCartCount(user._id)
    //console.log('cart count')
    //console.log(cartCount)
    //accessing product detailes from DB
    productHelpers.getAllProducts().then((products) => {
      //console.log('session', user)
      res.render("user/view-products", { products, cartCount, user })
    })
  } else {
    productHelpers.getAllProducts().then((products) => {
      res.render("user/view-products", { products })
    })
  }
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
    req.session.loggedIn = false
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
router.get('/cart', verifyLogin, async (req, res, next) => {
  user = req.session.user
  userId = req.session.user._id
  let products = await userHelpers.getCartProducts(userId)
  console.log('products')
  console.log(products)
  res.render('user/cart', { user, products })
})
router.get('/add-to-cart/:id', (req, res, next) => {
  //accessing user id and product id
  productId = req.params.id
  userId = req.session.user._id
  user = req.session.user
  //console.log('id error')
  //console.log(productId, userId)
  userHelpers.addToCart(productId, userId, user).then(() => {
    //json: data representing format
    //sending true to script
    res.json({status:true})
  })
})

module.exports = router;
