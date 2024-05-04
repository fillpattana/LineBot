const request = require('request');
const crypto = require('crypto');
require('dotenv').config();
const axios = require("axios");
const accessTok = process.env.ACCESS_TOKEN;
const line_message_api = process.env.LINE_MESSAGING_API;
const line_data_message_api = process.env.LINE_DATA_MESSAGING_API;
const channel_secret = process.env.LINE_CHANNEL_SECRET;

const textheaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessTok}`
}
const fileheaders = {
    'Authorization': `Bearer ${accessTok}`
}

async function getGroupName(groupId) {
    const url = `${line_message_api}/group/${groupId}/summary`;
    const response = await axios({
        method: 'get',
        headers: textheaders,
        url: url,
        responseType: 'json',
      });
      return response.data.groupName
}

async function getSenderName(groupId, userId) {
    const url = `${line_message_api}/group/${groupId}/member/${userId}`;
    const response = await axios({
        method: 'get',
        headers: textheaders,
        url: url,
        responseType: 'json',
      });
      return response.data.displayName
}

async function getFile(messageId) {
    const url = `${line_data_message_api}/message/${messageId}/content`;
    const response = await axios({
        method: 'get',
        headers: fileheaders,
        url: url,
        responseType: 'arraybuffer',
      });
      return response
}

async function lineVerify(originalSignature, body){
    let text = JSON.stringify(body);
    text = text.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, (e) => {
        return "\\u" + e.charCodeAt(0).toString(16).toUpperCase() + "\\u" + e.charCodeAt(1).toString(16).toUpperCase();
    });
    const signature = crypto.createHmac("SHA256", channel_secret).update(text).digest("base64").toString();
    if (signature !== originalSignature) {
        functions.logger.error("Unauthorized");
        return false;
    }
    console.log(`Signature verified, authority granted`)
    return true;
}

module.exports = {getGroupName, getSenderName, getFile, lineVerify}