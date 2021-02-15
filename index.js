const dynamoDBFactory = require('./src/dynamodb.factory');
const dynamoDb = dynamoDBFactory();

const { withStatusCode } = require('./src/utils/response.util');
const { parseWith } = require('./src/utils/request.util');

const parseJson = parseWith(JSON.parse);
const ok = withStatusCode(200);
const problem = withStatusCode(400);

const IDENTIFY_TABLE = process.env.IDENTIFY_TABLE;
const PAGE_TABLE = process.env.PAGE_TABLE;

exports.handler = async (event) => {
    const request_body = parseJson(event.body);
    const { type, messageId } = request_body;

    if (type !== 'page' && type !== 'identify') {
        return ok('not a page');
    }

    const params = {
        TableName: ( type === 'identify' ? IDENTIFY_TABLE : PAGE_TABLE),
        Item: {
            messageId,
            ...request_body
        },
    };

    try {
        await dynamoDb.put(params).promise();
    } catch (e) {
        console.log('Could not store event', e);
        return problem(e.message);
    }

    return ok();
};