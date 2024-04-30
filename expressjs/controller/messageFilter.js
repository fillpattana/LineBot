const request = require('request')
const messageIsText = require('./textProcessor')
const messageIsImage = require('./imageProcessor')
require('dotenv').config();
const accessTok = process.env.ACCESSTOKEN;
const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessTok}`
}
// const bodyParser = require('body-parser');
// router.use(bodyParser.urlencoded({extended:false}));
// router.use(bodyParser.json());

const messageFilter = (request, response) => {
    let reply_token = request.body.events[0].replyToken
    let msg = request.body.events[0]
    msg_type(reply_token, msg)
    response.sendStatus(201)
}

async function msg_type(reply_token, msg){
    const msgType = msg.message.type
    console.log("Message Type:", msgType)
    if (msgType === 'text'){
        console.log("text handled successfully\n")
        messageIsText.processText(reply_token, msg)
    }
    if (msgType === 'image'){
        messageIsImage.processImage(reply_token, msg)
        console.log("We are working on the image handling\n")
    }
    if (msgType === 'File'){
        console.log("We are working on the file handling\n")
    }

}

module.exports = {messageFilter}