const request = require('request')
const moment = require('moment-timezone')
var Getter = require('./Getter')
var Storage = require('../initializeStorage');
require('dotenv').config();
const accessTok = process.env.ACCESS_TOKEN;
const line_reply = process.env.LINE_REPLY;
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
    const bkkTimeStamp = moment(timeStamp).tz('Asia/Bangkok').format('DD/MMMM/YYYY-h:mm:ss');
    const groupId = msg.source.groupId
    const senderId = msg.source.userId
    const groupName = await Getter.getGroupName(groupId);
    const senderName = await Getter.getSenderName(groupId, senderId);

    insertTextByGroupId(groupId, senderId, msgType, msgContent, bkkTimeStamp)

    let body = JSON.stringify({
        replyToken: reply_token,
        messages: [{
            type: 'text',
            text: `GroupId: ${groupId}\nSenderId: ${senderId}\nMessage Type: ${msgType}\nMessage Content: ${msgContent}\nTime Stamp: ${bkkTimeStamp}\nGroup Name: ${groupName}\nSender Name: ${senderName}`
        }]
    })
    request.post({
        url: `${line_reply}`,
        headers: headers,
        body: body
    }, (err, response, body) => {
        console.log('status of message sending= ' + response.statusCode);
    });
}

async function insertTextByGroupId(groupId, userId, messageType, msgContent, timestamp){
    await Storage.lineTextDB.add({
        groupId: groupId,
        userId: userId,
        messageType: messageType,
        msgContent: msgContent,
        timestamp: timestamp
    })
}

module.exports = {processText}