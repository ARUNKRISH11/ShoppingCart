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
let footer = true

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
      res.render("user/view-products", { products, cartCount, user, footer })
    })
  } else {
    productHelpers.getAllProducts().then((products) => {
      res.render("user/view-products", { products, footer })
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
  //this products required because loading cart items
  let products = await userHelpers.getCartProducts(userId)
  let total = await userHelpers.getTotalAmount(userId)
  if (total) {
    res.render('user/cart', { user, products, total })
  } else {
    res.render('user/cart', { user, products, total })
  }
})
router.get('/add-to-cart/:id', verifyLogin, (req, res, next) => {
  //accessing user id and product id
  productId = req.params.id
  userId = req.session.user._id
  user = req.session.user
  //console.log('id error')
  //console.log(productId, userId)
  userHelpers.addToCart(productId, userId, user).then(() => {
    //json: data representing format
    //sending true to script
    res.json({ status: true })
  })
})
router.post('/change-quantity/', verifyLogin, (req, res, next) => {
  //console.log('change quantity');
  userHelpers.changeQuantity(req.body).then(async (response) => {
    userId = req.session.user._id
    //here you used response.total because response already have object response.status=true
    //if the response already have any value like respone=true you can't use response.total here.
    response.total = await userHelpers.getTotalAmount(userId)
    //refreshing a part of page (not loading the full page , so using res.json)
    res.json(response)
  })
})
router.post('/remove-product/', verifyLogin, (req, res, next) => {
  userHelpers.removeProduct(req.body).then(() => {
    //there you can't use verifyLogin because you used there json file format
    res.json({ status: true })
  })
})
router.get('/place-order', verifyLogin, async (req, res, next) => {
  //console.log('place order get');
  user = req.session.user
  userId = user._id
  //user each quntity multiple price
  let total = await userHelpers.getTotalAmount(userId)
  res.render('user/place-order', { user, total })
})
router.post('/place-order', verifyLogin, async (req, res, next) => {
  console.log('place order');
  let products = await userHelpers.getCartProductsList(req.body.userId)
  let totalPrice = await userHelpers.getTotalAmount(req.body.userId)
  //console.log(req.body,products,totalPrice);
  userHelpers.placeOrder(req.body, products, totalPrice).then((orderId) => {
    //console.log('orderid',orderId);
    if (req.body['payment-method'] === 'COD') {
      res.json({ codSuccess: true })
    } else {
      console.log('working online payment');
      userHelpers.generateRazorpay(orderId, totalPrice).then((response) => {
        res.json(response)
      })
    }

  })
})
router.get('/order-success', verifyLogin, (req, res, next) => {
  user = req.session.user
  res.render('user/order-success', { user })
})
router.get('/order-failed', verifyLogin, (req, res, next) => {
  user = req.session.user
  res.render('user/order-failed', { user })
})
router.get('/order-detailes', verifyLogin, async (req, res, next) => {
  user = req.session.user
  orders = await userHelpers.getUserOrders(user._id)
  //console.log('order detailes');
  //console.log(orders);
  res.render('user/order-detailes', { user, orders })
})
router.get('/view-order-products/:id', verifyLogin, async (req, res, next) => {
  user = req.session.user
  orderId = req.params.id
  products = await userHelpers.getOrderProducts(orderId)
  //console.log('products');
  //console.log(products);
  res.render('user/order-products', { products, user })
})
router.post('/verify-payment', (req, res, next) => {
  console.log('verify payment');
  console.log(req.body);
  userHelpers.verifyPayment(req.body).then(() => {
    userHelpers.changePaymentStatus(req.body['order[receipt]']).then(() => {
      console.log('Payment successfull');
      res.json({ status: true })
    })
  }).catch((err) => {
    console.log(err);
    res.json({ status: false, errMst: '' })
  })
})
router.get('/about', (req, res, next) => {
  console.log('about');
  res.render('user/about', { footer })
})
module.exports = router;
