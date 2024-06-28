const request = require('request')
const messageIsText = require('./textProcessor')
const messageIsFile = require('./fileProcessor')
const Getter = require('./Getter')
const sentiment = require('./chatSentiment')

const messageFilter = (request, response, next) => {
    if (!Getter.lineVerify(request.headers["x-line-signature"], request.body)) {
        return res.status(401).send("Unauthorized");
    }
    let reply_token = request.body.events[0].replyToken
    let msg = request.body.events[0]
    msg_type(reply_token, msg, next)
}

async function msg_type(reply_token, msg, next){
    if (msg && msg.message && msg.message.type) {
    const msgType = msg.message.type;
    switch (msgType) {
        case 'text':
            console.log(`${msgType} Received\n`);
            sentiment.handleTextAndSentiment(reply_token, msg)
            break;
        case 'image':
            messageIsFile.processFile(reply_token, msg);
            console.log(`${msgType} Received\n`);
            break;
        case 'file':
            messageIsFile.processFile(reply_token, msg);
            console.log(`${msgType} Received\n`);
            break;
        case 'video':
            messageIsFile.processFile(reply_token, msg);
            console.log(`${msgType} Received\n`);
            break;
        case 'audio':
            messageIsFile.processFile(reply_token, msg);
            console.log(`${msgType} Received\n`);
            break;
    }
    }
    else{
        next();
    }
    next();
}

module.exports = {messageFilter}