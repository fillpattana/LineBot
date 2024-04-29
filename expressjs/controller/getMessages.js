const express = require('express')
const request = require('request')
const accessTok = process.env.PORT || 'artTKZj5KSTdsQDRQn3MNCWu5npgYENltosda2+i1NPNuRJugPrrDX821jzQLxcdC9MTB1t+Ue+70542bUgX1kfvhrQXexg0U4GwLScMjzImleNQwYwI7Draciv10vsuqPbUQheOhSKTx0x5BRPpVQdB04t89/1O/w1cDnyilFU=';

const getMessage = (request, response) => {
    let reply_token = request.body.events[0].replyToken
    let msg = request.body.events[0].message
    reply(reply_token, msg)
    response.sendStatus(201)
}

function reply(reply_token, msg) {
    let headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessTok}`
    }
    let body = JSON.stringify({
        replyToken: reply_token,
        messages: [{
            type: 'text',
            text: JSON.stringify(msg)
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


module.exports = {getMessage};