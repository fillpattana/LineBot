const bodyParser = require('body-parser');
const app = require('./routes/LineMessage');
require('dotenv').config();
const PORT = process.env.PORT;

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.listen(PORT, () => {
    console.log(`Running on Port: ${PORT}`)
});

app.post('/webhook', (request, response) => {
    response.sendStatus(201)
})






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

