var express = require('express');
var router = express.Router();

/* Admin Centre */
router.get('/', function(req, res, next) {
 res.render("index",{admin:true})
});

module.exports = router;
