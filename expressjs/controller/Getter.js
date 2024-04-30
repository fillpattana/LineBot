const request = require('request')
require('dotenv').config();
const accessTok = process.env.ACCESSTOKEN;
const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessTok}`
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

async function getImage(messageId) {
    const url = `https://api-data.line.me/v2/bot/message/${messageId}/content`;
    const response = await fetch(url, {
        headers: headers,
    });
    const binary = await response.arrayBuffer();
    return binary;
}

module.exports = {getGroupName, getSenderName, getImage}