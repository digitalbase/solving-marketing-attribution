const serverless = require('serverless-http');
const express = require('express');
const app = express();

app.post('/hello', function (req, res) {
    res.status(200).send(`Hi. Awesome guide. Keep reading @ https://medium.com/solving-marketing-attribution`);
});

module.exports.handler = serverless(app);