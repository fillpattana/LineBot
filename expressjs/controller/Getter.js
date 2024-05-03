const { text } = require('body-parser');
const request = require('request')
require('dotenv').config();
const accessTok = process.env.ACCESS_TOKEN;
const line_message_api = process.env.LINE_MESSAGING_API;
const line_data_message_api = process.env.LINE_DATA_MESSAGING_API
const textheaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessTok}`
}
const fileheaders = {
    'Authorization': `Bearer ${accessTok}`
}

async function getGroupName(groupId) {
    const url = `${line_message_api}/group/${groupId}/summary`;
    const response = await fetch(url, {
        headers: textheaders,
    });
    const data = await response.json();
    return data.groupName;
}

async function getSenderName(groupId, userId) {
    const url = `${line_message_api}/group/${groupId}/member/${userId}`;
    const response = await fetch(url, {
        headers: textheaders,
    });
    const data = await response.json();
    return data.displayName;
}

async function getFile(messageId) {
    const url = `${line_data_message_api}/message/${messageId}/content`;
    const response = await fetch(url, {
        headers: fileheaders,
    });
    const binary = await response.arrayBuffer();
    return binary;
}

module.exports = {getGroupName, getSenderName, getFile}