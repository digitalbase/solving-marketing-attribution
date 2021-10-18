const {withStatusCode} = require('../../utils/response.util');
const dynamoDBFactory = require('../../utils/dynamodb.factory');
const referrer_detection = require("../../utils/referrer_detection.util");
const {SourceAttributionModel} = require("../../models/SourceAttribution");

const dynamoDb = dynamoDBFactory();
const model = new SourceAttributionModel(dynamoDb);
const { log } = require('../../utils/log.util');

const ok = withStatusCode(200, JSON.stringify);
const problem = withStatusCode(400);

// help https://www.fernandomc.com/posts/eight-examples-of-fetching-data-from-dynamodb-with-node/

const PAGE_TABLE = process.env.PAGE_TABLE;

if (!PAGE_TABLE) {
    throw new Error('PAGE_TABLE not set');
}

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

        if (!pageEvent) {
            log('Page event not found');
            return problem('Page event not found');
        }

        const {referrer, href} = pageEvent;

        const extraction = await referrer_detection(href, referrer);

        if (!extraction) {
            log('Skipping useless extraction', pageEvent);

            return problem('Skipping useless extraction');
        }

        await model.store(pageEvent, extraction);
    } catch (e) {
        log('Could find page event', e);
        return problem(e.message);
    }

    return ok();
};
