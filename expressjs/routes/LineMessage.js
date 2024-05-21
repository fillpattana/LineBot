const express = require('express');
const gemini = require('../controller/gemini');
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

//display entire chat history
router.get('/display/:groupId', async (request, response) => {
    const groupId = request.params.groupId;
    let file = await fireStore.getAllFileOrderByAsc(groupId)
    let text = await fireStore.getAllTextOrderByAsc(groupId)
    const groupName = await Getter.getGroupName(groupId)
    const groupPicture =await Getter.getGroupProfilePicture(groupId)
    file = await fireStore.addSenderNameToJsonByUserId(file)
    text = await fireStore.addSenderNameToJsonByUserId(text)
    const messageCollection = await fireStore.getAllTextsForGemini(groupId)
    const textByGem = await gemini.run(messageCollection)
    const fileCollection = await fireStore.getAllFilesForGemini(groupId)
    const imageByGem = await gemini.multipleImageByArray(fileCollection)
    const bothByGem = await gemini.bothTextandImage(textByGem, imageByGem)
    response.render('../view/displayMessages', { groupName, groupPicture, messageCollection, textByGem, imageByGem, bothByGem, file, text, logMessage1: "File JSON from get by ID: " + file,
    logMessage2: "text JSON from get by ID: " + JSON.stringify(text)
    });
});

//display by date specified
router.get('/displayByDate/:groupId/:date', async (request, response) => {
    const groupId = request.params.groupId;
    const date = request.params.date;
    let file = await fireStore.getFileByDateOrderByAsc(groupId, date)
    let text = await fireStore.getTextByDateOrderByAsc(groupId, date)
    const groupName = await Getter.getGroupName(groupId)
    const groupPicture = await Getter.getGroupProfilePicture(groupId)
    file = await fireStore.addSenderNameToJsonByUserId(file)
    text = await fireStore.addSenderNameToJsonByUserId(text)
    const messageCollection = await fireStore.getTextsByDateForGemini(groupId, date)
    const textByGem = await gemini.gemTextFlash(messageCollection)
    response.render('../view/displayByDate', { groupName, groupPicture, file, text, textByGem, logMessage1: "File JSON from get by ID: " + file,
    logMessage2: "text JSON from get by ID: " + JSON.stringify(text)
    });
});

module.exports = router;