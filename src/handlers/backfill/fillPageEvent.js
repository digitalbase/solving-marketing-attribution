const {withStatusCode} = require('../../utils/response.util');
const dynamoDBFactory = require('../../utils/dynamodb.factory');
const referrer_detection = require("../../utils/referrer_detection.util");
const {SourceAttributionModel} = require("../../models/SourceAttribution");

const dynamoDb = dynamoDBFactory();
const model = new SourceAttributionModel(dynamoDb);

const ok = withStatusCode(200, JSON.stringify);
const problem = withStatusCode(400);

// help https://www.fernandomc.com/posts/eight-examples-of-fetching-data-from-dynamodb-with-node/

const PAGE_TABLE = process.env.PAGE_TABLE;

exports.handler = async (event) => {
    const {messageId} = event.pathParameters;

    const params = {
        Key: {
            "messageId": messageId,
        },
        TableName: PAGE_TABLE,
    };

    try {
        const Item = await dynamoDb.get(params).promise();
        const pageEvent = Item.Item;

        const {referrer, href} = pageEvent;

        const extraction = await referrer_detection(href, referrer);

        if (!extraction) {
            console.log('Skipping useless extraction', pageEvent);
            return;
        }

        await model.store(pageEvent, extraction);
    } catch (e) {
        console.log('Could find page event', e);
        return problem(e.message);
    }

    return ok();
};
