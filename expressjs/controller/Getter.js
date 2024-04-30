const request = require('request')
const accessTok = process.env.PORT || 'artTKZj5KSTdsQDRQn3MNCWu5npgYENltosda2+i1NPNuRJugPrrDX821jzQLxcdC9MTB1t+Ue+70542bUgX1kfvhrQXexg0U4GwLScMjzImleNQwYwI7Draciv10vsuqPbUQheOhSKTx0x5BRPpVQdB04t89/1O/w1cDnyilFU=';
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

module.exports = {getGroupName, getSenderName}