const AWS = require('aws-sdk');

const unmarshallNewImageEvent = (eventData) => {
    if (!eventData.dynamodb) {
        throw new Error('Not a dynamo event');
    }

    // if you want the raw event we need to unmarshall it
    // more @ https://stackoverflow.com/questions/44535445/unmarshall-dynamodb-json
    return AWS.DynamoDB.Converter.unmarshall(eventData.dynamodb.NewImage);
};


module.exports = {
    unmarshallNewImageEvent
};