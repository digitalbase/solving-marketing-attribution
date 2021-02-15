const { unmarshallNewImageEvent } = require('./src/utils/dynamo_stream.util');
const dynamoDBFactory = require('./src/dynamodb.factory');
const { UserToAnonymousModel } = require('./src/models/UserToAnonymous');

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

    try {
        await model.storeMap(userId, anonymousId);
    } catch (e) {
        console.log(e.message)
    }

    return eventData.eventName;
};