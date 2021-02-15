const { withStatusCode } = require('../../utils/response.util');
const dynamoDBFactory = require('../../dynamodb.factory');
const ok = withStatusCode(200, JSON.stringify);

const { SourceAttributionModel } = require('../../models/SourceAttribution');

const dynamoDb = dynamoDBFactory();
const model_source = new SourceAttributionModel(dynamoDb);

exports.handler = async (event) => {
    const { id } = event.pathParameters;

    const attributionSessions = await model_source.getForAnonymousId(id);

    return ok({
        sessions: attributionSessions
    });
};