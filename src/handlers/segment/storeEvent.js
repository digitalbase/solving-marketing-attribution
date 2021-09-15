const dynamoDBFactory = require('../../utils/dynamodb.factory');
const dynamoDb = dynamoDBFactory();

const { jsonWithStatusCode } = require('../../utils/response.util');
const { parseWith } = require('../../utils/request.util');

const parseJson = parseWith(JSON.parse);

const IDENTIFY_TABLE = process.env.IDENTIFY_TABLE;
const PAGE_TABLE = process.env.PAGE_TABLE;

exports.handler = async (event) => {
    const request_body = parseJson(event.body);
    const { type, messageId } = request_body;

    if (type !== 'page' && type !== 'identify') {
        return jsonWithStatusCode(202,"Skipping event (not a page/identify)");
    }

    const params = {
        TableName: ( type === 'identify' ? IDENTIFY_TABLE : PAGE_TABLE),
        Item: {
            messageId,
            source: "webhook",
            ...request_body
        },
    };

    try {
        await dynamoDb.put(params).promise();
    } catch (e) {
        console.log('Could not store event', e);

        return jsonWithStatusCode(500, e.message)
    }

    return jsonWithStatusCode(201,"Successfully stored the event");
};
