const express = require('express');
const cors = require('cors');
const gemini = require('../controller/gemini');
var router = express();
var messageController = require('../controller/messageFilter');
var eventController = require('../controller/groupEventsProcessor');
var fireStore = require('../controller/fireStoreQuery');
const bodyParser = require('body-parser');
router.set('view engine', 'ejs');
router.use(bodyParser.urlencoded({extended:false}));
router.use(bodyParser.json());
router.use(cors({
    origin: 'https://line-ec275.web.app' // Allow only this origin for now
}));
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
    const messageCollection = await fireStore.getAllTextsForGemini(groupId)
    const textByGem = await gemini.flashText(messageCollection)
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
    const messageCollection = await fireStore.getTextsByDateForGemini(groupId, date)
    const textByGem = await gemini.flashText(messageCollection)
    const fileCollection = await fireStore.getFilesByDateForGemini(groupId, date)
    const imageByGem = await gemini.multipleImageByArray(fileCollection)
    const bothByGem = await gemini.flashBoth(textByGem, imageByGem)
    response.render('../view/displayByDate', { groupName, groupPicture, file, text, textByGem, imageByGem, bothByGem, logMessage1: "File JSON from get by ID: " + file,
    logMessage2: "text JSON from get by ID: " + JSON.stringify(text)
    });
});

//Topic Units Display
router.get('/getByTopic/:groupId/:date', async (request, response) => {
    const groupId = request.params.groupId;
    const date = request.params.date;
    let file = await fireStore.getFileByDateOrderByAsc(groupId, date)
    let text = await fireStore.getTextByDateOrderByAsc(groupId, date)
    const groupName = await Getter.getGroupName(groupId)
    const groupPicture = await Getter.getGroupProfilePicture(groupId)
    const messageByTopic = await fireStore.textMessageByTopic(text)
    response.send({ groupName, groupPicture, text, file, messageByTopic });
});

//Get All GroupIds
router.get('/getAllGroupId', async (request, response) => {
    try {
        const groupIds = await fireStore.getAllGroupId(); // Call the function to get group IDs directly
        response.send({ groupIds });
    } catch (error) {
        console.error("Error handling getAllGroupId route:", error);
        response.status(500).send({ error: "Internal Server Error" });
    }
});

router.get('/getGroupInfo/:groupId', async (request, response) => {
    const groupId = request.params.groupId;
    const groupName = await Getter.getGroupName(groupId)
    const groupPicture = await Getter.getGroupProfilePicture(groupId)
    response.send({ groupName, groupPicture });
});

router.get('/geminiFlashText/:message', async (request, response) => {
    const message = request.params.message;
    const summary = await gemini.flashText(message);
    response.send({ summary });
});

router.get('/getUserPicture/:userId', async (request, response) => {
    const userId = request.params.userId;
    const pictureUrl = await Getter.getUserProfilePicture(userId);
    response.send({ pictureUrl });
});

module.exports = router;