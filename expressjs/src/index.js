const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')

const app = express();

const PORT = process.env.PORT || 3000;
const accessTok = process.env.PORT || 'artTKZj5KSTdsQDRQn3MNCWu5npgYENltosda2+i1NPNuRJugPrrDX821jzQLxcdC9MTB1t+Ue+70542bUgX1kfvhrQXexg0U4GwLScMjzImleNQwYwI7Draciv10vsuqPbUQheOhSKTx0x5BRPpVQdB04t89/1O/w1cDnyilFU=';

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

app.post('/webhook', (request, response) => {
    let reply_token = request.body.events[0].replyToken
    let msg = request.body.events[0].message.text
    reply(reply_token, msg)
    response.sendStatus(200)
})

app.listen(PORT, () => {
    console.log(`Running on Port: ${PORT}`)
});

function reply(reply_token, msg) {
    let headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessTok}`
    }
    let body = JSON.stringify({
        replyToken: reply_token,
        messages: [{
            type: 'text',
            text: msg
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










// const mockUsers = [{id: 1, user: "phil", displayName: "Phil"},
//                    {id: 2, user: "jack", displayName: "Jack"},
//                    {id: 3, user: "joe", displayName: "Joe"},
// ];

// app.get("/api/users", (request, response) => {
//     response.send(mockUsers);
// });

// app.get("/api/users/:id", (request, response) => {
//     console.log(request.params);
//     const parsedId = parseInt(request.params.id);
//     console.log(parsedId)

//     if (isNaN(parsedId)){
//         return response.status(400).send({msg: "Bad Request. Invalid Id"});
//     } 

//     const findUser = mockUsers.find((user) => user.id === parsedId);
//     if (!findUser){
//         return response.sendStatus(404);
//     }
//     return response.send(findUser);
// });

