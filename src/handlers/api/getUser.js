const { withStatusCode } = require('../../utils/response.util');
const dynamoDBFactory = require('../../utils/dynamodb.factory');
const { UserToAnonymousModel } = require('../../models/UserToAnonymous');
const { SourceAttributionModel } = require('../../models/SourceAttribution');

const dynamoDb = dynamoDBFactory();
const model_usermap = new UserToAnonymousModel(dynamoDb);
const model_source = new SourceAttributionModel(dynamoDb);

const ok = withStatusCode(200, JSON.stringify);

exports.handler = async (event) => {
    const { id } = event.pathParameters;

    const anonymousIds = await model_usermap.getAnonymousIdsForUser(id);
    // get all things from sessions with those anonymousId
    const attributionSessions = await model_source.getForAnonymousIds(anonymousIds);

    return ok({
        anonymousIds : anonymousIds,
        sessions: attributionSessions
    });
};
