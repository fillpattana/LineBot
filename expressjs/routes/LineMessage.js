const express = require('express');
var router = express();
var messageController = require('../controller/messageFilter');
var eventController = require('../controller/groupEventsProcessor');
const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({extended:false}));
router.use(bodyParser.json());

router.post('/webhook', eventController.groupEvents, messageController.messageFilter);

router.get('/', (request, response) => {
    response.send("HELLO THIS IS FIREBASE")
})

router.set('view engine', )
router.get('/:groupId', async (request, response) => {
    const groupId = request.params.groupId;
    response.send(`${groupId}`)
});

module.exports = router;