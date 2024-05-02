const request = require('request')
const messageIsText = require('./textProcessor')
const messageIsImage = require('./imageProcessor')
require('dotenv').config();
const accessTok = process.env.ACCESS_TOKEN;
const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessTok}`
}

const messageFilter = (request, response, next) => {
    let reply_token = request.body.events[0].replyToken
    let msg = request.body.events[0]
    msg_type(reply_token, msg, next)
}

async function msg_type(reply_token, msg, next){
    const msgType = msg.message.type;
    console.log("Message Type:", msgType)
    if (msgType === 'text'){
        console.log("text handled successfully\n")
        messageIsText.processText(reply_token, msg)
    }
    if (msgType === 'image' | ''){
        messageIsImage.processImage(reply_token, msg)
        console.log("We are working on the image handling\n")
    }
    if (msgType === 'File'){
        console.log("We are working on the file handling\n")
    }

    next();
}

module.exports = {messageFilter}