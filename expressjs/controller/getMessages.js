const request = require('request')
const moment = require('moment-timezone')
const accessTok = process.env.PORT || 'artTKZj5KSTdsQDRQn3MNCWu5npgYENltosda2+i1NPNuRJugPrrDX821jzQLxcdC9MTB1t+Ue+70542bUgX1kfvhrQXexg0U4GwLScMjzImleNQwYwI7Draciv10vsuqPbUQheOhSKTx0x5BRPpVQdB04t89/1O/w1cDnyilFU=';
const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessTok}`
}

const getMessage = (request, response) => {
    let reply_token = request.body.events[0].replyToken
    let msg = request.body.events[0]
    reply(reply_token, msg)
    response.sendStatus(201)
}

async function getGroupName(groupId) {
    const url = `https://api.line.me/v2/bot/group/${groupId}/summary`;
    const response = await fetch(url, {
        headers: headers,
    });
    const data = await response.json();
    return data.groupName;
}

async function getSenderName(groupId, userId) {
    const url = `https://api.line.me/v2/bot/group/${groupId}/member/${userId}`;
    const response = await fetch(url, {
        headers: headers,
    });
    const data = await response.json();
    return data.displayName;
}

async function reply(reply_token, msg) {

    const msgType = msg.message.type;
    const msgContent = msg.message.text;
    const timeStamp = msg.timestamp;
    const bkkTimeStamp = moment(timeStamp).tz('Asia/Bangkok').format('LLLL');
    const groupName = await getGroupName(msg.source.groupId);
    const senderName = await getSenderName(msg.source.groupId, msg.source.userId);

    console.log("msg body:", JSON.stringify(msg));

    let body = JSON.stringify({
        replyToken: reply_token,
        messages: [{
            type: 'text',
            text: `Message Type: ${msgType}\nMessage Content: ${msgContent}\nTime Stamp: ${bkkTimeStamp}\nGroup Name: ${groupName}\nSender Name: ${senderName}`
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

module.exports = {getMessage}