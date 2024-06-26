const request = require('request')
const { getGroupName } = require('./Getter');
const { lineVerify } = require('./Getter');
var firebaseFireStore = require('./fireStoreQuery')
var firebaseStorage = require('./storageQuery')
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

    if (events.type === 'join') {
        // let body = JSON.stringify({
        //     replyToken: reply_token,
        //     messages: [{
        //         type: 'text',
        //         text: `สวัสดีครับทุกท่านสมาชิก "${await getGroupName(events.source.groupId)}"\nหากไม่เป็นการรบกวน\nผมจะขออณุญาตดูแลบทสนทนาของทุกท่านไว้ให้อยู่ยงคงกระพันราวกับน้ำผึ้งเลยครับผม!`
        //     }]
        // });
        // request.post({
        //     url: `${line_reply}`,
        //     headers: headers,
        //     body: body
        // }, (err, response, body) => {
        //     if (err) {
        //         console.error('Error sending message:', err);
        //     } else {
        //         console.log('Status of message sending: ' + response.statusCode);
        //     }
        // });
    
        await firebaseFireStore.addGroupId(events);
    }

    if (events.type === 'leave') {
        try { 
            await firebaseFireStore.deleteGroupByIdFirestore(events);
            await firebaseStorage.deleteGroupByIdStorage(events);
            await firebaseFireStore.removeGroupId(events);
        } catch (error) {
            console.error("Error handling leave event: ", error);
        }
    }
    next();
}

module.exports = {groupEvents}