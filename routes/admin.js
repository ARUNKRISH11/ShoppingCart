var express = require('express');
const fileupload = require('fileupload');
var router = express.Router();
//accessing product helprs
var productHelpers = require('../helpers/product-helpers');

/* Admin Centre */
router.get('/', (req, res) => {
  //accessing product detailes from DB
  productHelpers.getAllProducts().then((products) => {
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

  productHelpers.addProduct(req.body, (id) => {
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
  let proId = req.params.id
  //console.log('admin', proId)
  productHelpers.deleteProduct(proId).then((response) => {
    //console.log("Product delete error")
    res.redirect('/admin')
  })
})
router.get('/edit-product/:id', async (req, res, next) => {
  let product = await productHelpers.getProductDetailes(req.params.id)
  //console.log(product)
  res.render('admin/edit-product', { product, admin: true })

})
router.post('/edit-product/:id', (req, res, next) => {
  //the form action should be: action="/admin/edit-product/{{product._id}}"
  //console.log('error function')
  //for updating the product id not changing so there accessing id
  productHelpers.updateProduct(req.params.id, req.body).then(() => {
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
module.exports = router;
