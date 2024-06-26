var express = require('express');
const fileupload = require('fileupload');
var router = express.Router();
//accessing product helprs
var adminHelpers = require('../helpers/admin-helpers');
const verifyAdminLogin = (req, res, next) => {
  //console.log(req.session.adminLoggedIn);
  if (req.session.adminLoggedIn) {
    admin = req.session.admin
    next()
  } else {
    res.redirect('/admin/admin-login')
  }
}
/* Admin Centre */
router.get('/', (req, res) => {
  let admin = req.session.admin
  // console.log('home', req.session.adminLoggedIn);
  if (admin) {
    //accessing product detailes from DB
    adminHelpers.getAllProducts().then((products) => {
      //console.log(products)
      res.render("admin/view-products", { products, admin, adminHeader: true })
    })
  } else {
    res.redirect('admin/admin-login')
  }
});
// super admin section to add admins
router.get('/super-admin', (req, res, next) => {
  res.render('admin/super-admin', { adminHeader: true })
})
router.post('/admin/super-admin', (req, res, next) => {
  adminHelpers.doSignupAdmin(req.body).then(() => {
    res.redirect('/admin/super-admin')
  })
})
router.get('/admin-login', (req, res, next) => {
  // console.log(req.session.adminLoggedIn);
  if (req.session.adminLoggedIn) {
    res.redirect('/admin')
  } else {
    admin = false
    res.render('admin/login', { adminHeader: true, admin, 'LoginError': req.session.adminLoginError })
    req.session.adminLoggedIn = false
  }
})
router.post('/admin/login', (req, res, next) => {
  adminHelpers.doLoginAdmin(req.body).then((respone) => {
    if (respone.status) {
      req.session.adminLoggedIn = true
      req.session.admin = respone.admin
      // console.log('login', req.session.adminLoggedIn);
      res.redirect('/admin')
    } else {
      req.session.adminLoginError = ' Check your email address or password once again!'
      res.redirect('/admin/admin-login')
    }
  })
})
router.get('/add-product', verifyAdminLogin, (req, res, next) => {
  // console.log('add product', req.session.adminLoggedIn);
  res.render("admin/add-product", { admin, adminHeader: true })
  //console.log("get product")
})
router.post('/add-product', (req, res, next) => {
  //console.log(req.body)
  //console.log(req.files.image)
  //console.log("post product")

  adminHelpers.addProduct(req.body, (id) => {
    //console.log("Id from admin ",id)
    //what happen if product added
    let Image = req.files.image //'image' should match with name in the form
    Image.mv('./public/product-images/' + id + '.jpg', (err) => {
      if (!err) {
        //render page or send message
        res.render('admin/add-product', { adminHeader: true })
      } else {
        console.log("Image saving error", err)
      }
    })
  })
})
router.get('/delete-product/:id', verifyAdminLogin, (req, res, next) => {
  //for getting product id through paramas
  let productId = req.params.id
  //console.log('admin', proId)
  adminHelpers.deleteProduct(productId).then((response) => {
    //console.log("Product delete error")
    res.redirect('/admin')
  })
})
router.get('/edit-product/:id', verifyAdminLogin, async (req, res, next) => {
  let product = await adminHelpers.getProductDetailes(req.params.id)
  //console.log(product)
  res.render('admin/edit-product', { product, adminHeader: true })

})
router.post('/edit-product/:id', (req, res, next) => {
  //the form action should be: action="/admin/edit-product/{{product._id}}"
  //console.log('error function')
  //for updating the product id not changing so there accessing id
  adminHelpers.updateProduct(req.params.id, req.body).then(() => {
    //console.log('error function')
    res.redirect('/admin')
    //after redirect so the user get response first
    //image updating
    const id = req.params.id
    let Image = req.files.image
    if (Image) {
      Image.mv('./public/product-images/' + id + '.jpg')
    } else {
      console.log('Image edie error')
    }
  })
})
router.get('/users', verifyAdminLogin, async (req, res, next) => {
  users = await adminHelpers.getAllUsers()
  res.render('admin/user-view', { users, admin, adminHeader: true })
})
router.get('/user-order-detailes/:id', verifyAdminLogin, async (req, res, next) => {
  userId = req.params.id
  orders = await adminHelpers.getUserOrders(userId)
  console.log(userId);
  console.log(orders);
  if (orders) {
    res.render('admin/order-detailes', { orders, admin, adminHeader: true })
  } else {
    orders =false
    res.render('admin/order-detailes', { orders, admin, adminHeader: true })
  }
  res.render('admin/order-detailes', { orders, admin, adminHeader: true })
})
router.get('/user-order-products/:id', verifyAdminLogin, async (req, res, next) => {
  console.log('view order products');
  orderId = req.params.id
  products = await adminHelpers.getOrderProducts(orderId)
  console.log(orderId);
  console.log(products);
  res.render('admin/order-products', { products, admin, adminHeader: true })
})
router.get('/admin-logout', (req, res, next) => {
  req.session.adminLoggedIn = false
  res.render('admin/logout', { adminHeader: true })
})
module.exports = router;
