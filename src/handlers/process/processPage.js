const extractor = require('../../utils/event_extraction.util');
const referrer_detection = require('../../utils/referrer_detection.util');
const { log } = require('../../utils/log.util');
const { unmarshallNewImageEvent } = require('../../utils/unmarshallNewImageEvent.util');
const dynamoDBFactory = require('../../utils/dynamodb.factory');

const { SourceAttributionModel } = require('../../models/SourceAttribution');

const dynamoDb = dynamoDBFactory();
const model = new SourceAttributionModel(dynamoDb);

module.exports.handler = async (event) => {
    const eventData = event.Records[0];

    if (eventData.eventName !== 'INSERT') {
        log('No insert/identify')
        return;
    }

    const eventAddedUnmarshalled = unmarshallNewImageEvent(eventData);
    const extractedData = extractor(eventAddedUnmarshalled);
    const {referrer, href } = extractedData;

    const extraction = await referrer_detection(href, referrer);
    if (!extraction) {
        log('Skipping useless extraction', extractedData);
        return;
    }

    try {
        await model.store(eventAddedUnmarshalled, extraction);
    } catch (e) {
        log(e.message)
    }

    return eventData.eventName;
};
