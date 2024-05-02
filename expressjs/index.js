const bodyParser = require('body-parser');
const app = require('./routes/LineMessage');
const functions = require('firebase-functions');

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

app.post('/webhook', (request, response) => {
    response.send("*executed*")
})

exports.LineBotYdm = functions.https.onRequest(app)