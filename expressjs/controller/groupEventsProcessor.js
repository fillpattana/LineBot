const request = require('request')
const { getGroupName } = require('./Getter');
const { lineVerify } = require('./Getter');
var firebase = require('./fireStoreQuery')
require('dotenv').config();
const line_reply = process.env.LINE_REPLY
const accessTok = process.env.ACCESS_TOKEN;
const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessTok}`
}

const groupEvents = (request, response, next) => {
    if (!lineVerify(request.headers["x-line-signature"], request.body)) {
        return res.status(401).send("Unauthorized");
    }
    let reply_token = request.body.events[0].replyToken
    let events = request.body.events[0]
    eventType(reply_token, events, next)
}

async function eventType(reply_token, events, next){

    console.log("events.type", JSON.stringify(events.type));
    
    if (events.source.type !== 'group'){
        return "I only operate in groups for the time being..."
    }

    if (events.type === 'join'){
        let body = JSON.stringify({
            replyToken: reply_token,
            messages: [{
                type: 'text',
                text: `สวัสดีครับสมาชิก "${await getGroupName(events.source.groupId)}\nถ้าไม่เป็นการรบกวนผมจะขออณุญาตดูแลบทสนทนาของทุกท่านไว้ให้อยู่ยงคงกระพันราวกับน้ำผึ้งเลยครับผม!"`
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

    if (events.type === 'leave'){

        await firebase.deleteGroupByIdFirestore(events)
        await firebase.deleteGroupByIdStorage(events)

    }
    next();
}

module.exports = {groupEvents}