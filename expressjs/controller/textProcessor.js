const request = require('request')
require('dotenv').config();
const moment = require('moment-timezone')
var Getter = require('./Getter')
const accessTok = process.env.ACCESSTOKEN;
const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessTok}`
}

const processText = (reply_token, msg) => {
    reply(reply_token, msg)
}

async function reply(reply_token, msg) {

    const msgType = msg.message.type;
    const msgContent = msg.message.text;
    const timeStamp = msg.timestamp;
    const bkkTimeStamp = moment(timeStamp).tz('Asia/Bangkok').format('LLLL');
    const groupId = msg.source.groupId
    const senderId = msg.source.userId
    const groupName = await Getter.getGroupName(groupId);
    const senderName = await Getter.getSenderName(groupId, senderId);

    let body = JSON.stringify({
        replyToken: reply_token,
        messages: [{
            type: 'text',
            text: `GroupId: ${groupId}\nSenderId: ${senderId}\nMessage Type: ${msgType}\nMessage Content: ${msgContent}\nTime Stamp: ${bkkTimeStamp}\nGroup Name: ${groupName}\nSender Name: ${senderName}`
        }]
    })
    request.post({
        url: 'https://api.line.me/v2/bot/message/reply',
        headers: headers,
        body: body
    }, (err, response, body) => {
        console.log('status = ' + response.statusCode);
    });
}

module.exports = {processText}