const {withStatusCode} = require('../../utils/response.util');
const dynamoDBFactory = require('../../utils/dynamodb.factory');
const {UserToAnonymousModel} = require("../../models/UserToAnonymous");
const { log } = require('../../utils/log.util');

const dynamoDb = dynamoDBFactory();
const model = new UserToAnonymousModel(dynamoDb);

const ok = withStatusCode(200, JSON.stringify);
const problem = withStatusCode(400);

// help https://www.fernandomc.com/posts/eight-examples-of-fetching-data-from-dynamodb-with-node/

const IDENTIFY_TABLE = process.env.IDENTIFY_TABLE;

if (!IDENTIFY_TABLE) {
    throw new Error('IDENTIFY_TABLE not set');
}

exports.handler = async (event) => {
    const {messageId} = event.pathParameters;

    const params = {
        Key: {
            "messageId": messageId,
        },
        TableName: IDENTIFY_TABLE,
    };

    log(params);

    try {
        const Item = await dynamoDb.get(params).promise();
        const identifyEvent = Item.Item;

        if (!identifyEvent) {
            log('Identify event not found');
            return problem('Identify event not found');
        }

        const { type: eventType, userId, anonymousId } = identifyEvent;

        if (eventType !== 'identify') {
            log('Skipping. Not identify event');

            return problem('Skipping. Not identify event');
        }

        if (!userId || !anonymousId) {
            log('Skipping. Missing user and anonymousId');
            return ok('Skipping. Missing user and anonymousId')
        }

        log(`Storing map for userId ${userId} and anonymousId ${anonymousId}`)
        await model.storeMap(userId, anonymousId);
    } catch (e) {
        log('Problem storing mapping')
        log(e.message);
        return problem(e.message);
    }

    return ok();
};
