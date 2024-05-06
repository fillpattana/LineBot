const express = require('express');
var router = express();
var controller1 = require('../controller/messageFilter');
var controller2 = require('../controller/groupEventsProcessor');
const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({extended:false}));
router.use(bodyParser.json());

router.post('/webhook', controller2.groupEvents, controller1.messageFilter);
router.get('/', (request, response) => {
    response.send("HELLO THIS IS FIREBASE")
})
router.get('/messageDisplay', (request, response) => {
    response.render("displayMessages")
})

module.exports = router;