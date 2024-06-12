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

module.exports = router;
