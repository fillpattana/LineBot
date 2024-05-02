const request = require('request')
const moment = require('moment-timezone')
var Getter = require('./Getter')
const accessTok = 'artTKZj5KSTdsQDRQn3MNCWu5npgYENltosda2+i1NPNuRJugPrrDX821jzQLxcdC9MTB1t+Ue+70542bUgX1kfvhrQXexg0U4GwLScMjzImleNQwYwI7Draciv10vsuqPbUQheOhSKTx0x5BRPpVQdB04t89/1O/w1cDnyilFU=';
const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessTok}`
}

const processImage = (reply_token, msg) => {
    reply(reply_token, msg)
}

async function reply(reply_token, msg) {

    const msgType = msg.message.type;
    const timeStamp = msg.timestamp;
    const bkkTimeStamp = moment(timeStamp).tz('Asia/Bangkok').format('LLLL');
    const groupId = msg.source.groupId
    const senderId = msg.source.userId
    const groupName = await Getter.getGroupName(groupId);
    const senderName = await Getter.getSenderName(groupId, senderId);

    const image = await Getter.getImage(msg.message.id)

    console.log("image in binary:", image)

    const msgContent = JSON.stringify(image);

    let body = JSON.stringify({
        replyToken: reply_token,
        messages: [
            {
            type: 'text',
            text: "Working on it!"
            },
            {
            type: 'text',
            text: `GroupId: ${groupId}\nUserId: ${senderId}\nMessage Type: ${msgType}\nTime Stamp: ${bkkTimeStamp}\nGroup Name: ${groupName}\nSender Name: ${senderName}\n\nMessage Content: ${msgContent}`
            }
    ]
    })
    request.post({
        url: 'https://api.line.me/v2/bot/message/reply',
        headers: headers,
        body: body
    }, (err, response, body) => {
        console.log('status = ' + response.statusCode);
    });
}

module.exports = {processImage}