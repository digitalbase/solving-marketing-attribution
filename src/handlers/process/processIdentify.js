const { unmarshallNewImageEvent } = require('../../utils/dynamo_stream.util');
const dynamoDBFactory = require('../../utils/dynamodb.factory');
const { UserToAnonymousModel } = require('../../models/UserToAnonymous');

const dynamoDb = dynamoDBFactory();
const model = new UserToAnonymousModel(dynamoDb);

module.exports.handler = async (event) => {
    const eventData = event.Records[0];
    const eventAddedUnmarshalled = unmarshallNewImageEvent(eventData);
    const { type: eventType, userId, anonymousId } = eventAddedUnmarshalled;

    // only handle dynamo INSERTS and events with type identify
    if (eventData.eventName !== 'INSERT' || eventType !== 'identify') {
        return;
    }

    if (!anonymousId || anonymousId === '') {
        return;
    }

    try {
        await model.storeMap(userId, anonymousId);
    } catch (e) {
        console.log(e.message)
    }

    return eventData.eventName;
};
