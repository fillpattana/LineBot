var express = require('express');
var router = express();
var controller = require('../controller/messageFilter');
const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({extended:false}));
router.use(bodyParser.json());

router.post('/webhook', controller.messageFilter);

module.exports = router;