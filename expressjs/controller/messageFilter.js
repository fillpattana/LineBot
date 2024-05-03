const request = require('request')
const messageIsText = require('./textProcessor')
const messageIsFile = require('./fileProcessor')
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
    if (msg && msg.message && msg.message.type) {
    const msgType = msg.message.type;
    console.log("Message Type But Even Deeper:", msgType)
    switch (msgType) {
        case 'text':
            console.log("text handled successfully\n");
            messageIsText.processText(reply_token, msg);
            break;
        case 'image':
            messageIsFile.processFile(reply_token, msg);
            console.log("We are working on the file handling\n");
            break;
        case 'file':
            messageIsFile.processFile(reply_token, msg);
            console.log("We are working on the file handling\n");
            break;
        case 'video':
            messageIsFile.processFile(reply_token, msg);
            console.log("We are working on the file handling\n");
            break;
        case 'audio':
            messageIsFile.processFile(reply_token, msg);
            console.log("We are working on the file handling\n");
            break;
    }
    }
    else{
        next();
    }
    next();
}

module.exports = {messageFilter}