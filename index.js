const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const AWS = require('aws-sdk');

const IDENTIFY_TABLE = process.env.IDENTIFY_TABLE;
const TRACK_TABLE = process.env.TRACK_TABLE;
const dynamoDb = new AWS.DynamoDB.DocumentClient( {
    // ensures empty values (userId = null) are converted
    // more @ https://stackoverflow.com/questions/37479586/nodejs-with-dynamodb-throws-error-attributevalue-may-not-contain-an-empty-strin
    convertEmptyValues: true
});

app.use(bodyParser.json({ strict: false }));

// Create User endpoint
app.post('/events', function (req, res) {
    const request_body = req.body;
    const type = request_body.type;

    if (type === 'page' || type === 'identify') {
        const { messageId } = req.body;

        const params = {
            TableName: ( type === 'identify' ? IDENTIFY_TABLE : TRACK_TABLE),
            Item: {
                messageId: messageId,
                ...request_body,
            },
        };

        dynamoDb.put(params, (error) => {
            if (error) {
                console.log(error);
                res.status(400).json({ error: 'Could not store event' });
            }
            res.json({ messageId, request_body });
        });
    } else {
        res.status(200).send(`Not a page / identify event. Skipping`);
    }
});

module.exports.handler = serverless(app);