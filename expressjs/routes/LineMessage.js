var express = require('express');
var router = express();
var controller = require('../controller/getMessages');
const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({extended:false}));
router.use(bodyParser.json());

router.post('/webhook', controller.getMessage);

module.exports = router;