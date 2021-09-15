const { unmarshallNewImageEvent } = require('../../utils/unmarshallNewImageEvent.util');
const { log } = require('../../utils/log.util');
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
        log('No insert/identify')
        return;
    }

    if (!anonymousId || anonymousId === '') {
        log('No anonymous id')
        return;
    }

    try {
        log('storing', userId, anonymousId);
        await model.storeMap(userId, anonymousId);
    } catch (e) {
        log(e.message)
    }

    return eventData.eventName;
};
