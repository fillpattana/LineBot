const express = require('express');
var router = express();
var messageController = require('../controller/messageFilter');
var eventController = require('../controller/groupEventsProcessor');
var fireStore = require('../controller/fireStoreQuery');
const bodyParser = require('body-parser');
router.set('view engine', 'ejs');
router.use(bodyParser.urlencoded({extended:false}));
router.use(bodyParser.json());
var Getter = require('../controller/Getter')

router.post('/webhook', eventController.groupEvents, messageController.messageFilter);

router.get('/', (request, response) => {
    response.send("HELLO THIS IS FIREBASE")
})

router.get('/display/:groupId', async (request, response) => {
    const groupId = request.params.groupId;
    const file = await fireStore.getFileByGroupIdFireStore(groupId)
    let text = await fireStore.getTextByGroupIdFireStore(groupId)
    const groupName = await Getter.getGroupName(groupId)
    text = await addSenderNameToText(text)
    response.render('../view/displayMessages', { groupName, file, text, logMessage1: "File JSON from get by ID: " + file,
    logMessage2: "text JSON from get by ID: " + text
     });
});

async function addSenderNameToText(texts) {
    for (const text of texts) {
        const userName = await Getter.getUserNameFromProfile(text.userId);
        text.senderName = userName;
    }
    return texts;
}

module.exports = router;