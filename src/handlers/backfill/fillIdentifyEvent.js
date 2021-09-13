const {withStatusCode} = require('../../utils/response.util');
const dynamoDBFactory = require('../../utils/dynamodb.factory');
const {UserToAnonymousModel} = require("../../models/UserToAnonymous");

const dynamoDb = dynamoDBFactory();
const model = new UserToAnonymousModel(dynamoDb);

const ok = withStatusCode(200, JSON.stringify);
const problem = withStatusCode(400);

// help https://www.fernandomc.com/posts/eight-examples-of-fetching-data-from-dynamodb-with-node/

const IDENTIFY_TABLE = process.env.IDENTIFY_TABLE;

exports.handler = async (event) => {
    const {messageId} = event.pathParameters;

    const params = {
        Key: {
            "messageId": messageId,
        },
        TableName: IDENTIFY_TABLE,
    };

    try {
        const Item = await dynamoDb.get(params).promise();
        const identifyEvent = Item.Item;

        if (!identifyEvent) {
            return problem('Identify event not found');
        }

        console.log(identifyEvent);
        const { type: eventType, userId, anonymousId } = identifyEvent;

        console.log('userId', userId);
        console.log('anonymousId', anonymousId);
        await model.storeMap(userId, anonymousId);
    } catch (e) {
        console.log('Could find page event', e);
        return problem(e.message);
    }

    return ok();
};
