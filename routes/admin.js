var express = require('express');
const fileupload = require('fileupload');
var router = express.Router();
//accessing product helprs
var adminHelpers = require('../helpers/admin-helpers');
// var userHelpers= require('../helpers/user-helpers')

/* Admin Centre */
router.get('/', (req, res) => {
  //accessing product detailes from DB
  adminHelpers.getAllProducts().then((products) => {
    //console.log(products)
    res.render("admin/view-products", { products, admin: true })

  })

});
router.get('/add-product', (req, res, next) => {
  res.render("admin/add-product", { admin: true })
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
        res.render('admin/add-product', { admin: true })
      } else {
        console.log("Image saving error", err)
      }
    })
  })
})
router.get('/delete-product/:id', (req, res, next) => {
  //for getting product id through paramas
  let productId = req.params.id
  //console.log('admin', proId)
  adminHelpers.deleteProduct(productId).then((response) => {
    //console.log("Product delete error")
    res.redirect('/admin')
  })
})
router.get('/edit-product/:id', async (req, res, next) => {
  let product = await adminHelpers.getProductDetailes(req.params.id)
  //console.log(product)
  res.render('admin/edit-product', { product, admin: true })

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
router.get('/users', async (req, res, next) => {
  users = await adminHelpers.getAllUsers()
  res.render('admin/user-view', { users, admin: true })
})
router.get('/user-order-detailes/:id', async (req, res, next) => {
  userId = req.params.id
  orders = await adminHelpers.getUserOrders(userId)
  console.log(userId);
  res.render('admin/order-detailes', { orders, admin: true })
})
router.get('/user-order-products/:id', async (req, res, next) => {
  console.log('view order products');
  orderId = req.params.id
  products = await adminHelpers.getOrderProducts(orderId)
  console.log(orderId);
  console.log(products);
  res.render('admin/order-products', { products, admin: true })
})
module.exports = router;
