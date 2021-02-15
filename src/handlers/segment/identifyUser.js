// /src/handlers/segment/identifyUser.js
const { withStatusCode } = require('../../utils/response.util');
const ok = withStatusCode(200, JSON.stringify);

const {SegmentTracking} = require('../../SegmentTracking');
const SegmentTracker = new SegmentTracking();

exports.handler = async (event) => {
    const { id } = event.pathParameters;

    await SegmentTracker.trackUser(id, false);

    return ok('Track Completed');
};

//src/handlers/segment/storeEvent.js
const dynamoDBFactory = require('../../dynamodb.factory');
const dynamoDb = dynamoDBFactory();

const { withStatusCode } = require('../../utils/response.util');
const { parseWith } = require('../../utils/request.util');

const parseJson = parseWith(JSON.parse);
const ok = withStatusCode(200);
const problem = withStatusCode(400);

const IDENTIFY_TABLE = process.env.IDENTIFY_TABLE;
const PAGE_TABLE = process.env.PAGE_TABLE;

exports.handler = async (event) => {
    const request_body = parseJson(event.body);
    const { type, messageId } = request_body;

    if (type !== 'page' && type !== 'identify') {
        return ok('not a page');
    }

    const params = {
        TableName: ( type === 'identify' ? IDENTIFY_TABLE : PAGE_TABLE),
        Item: {
            messageId,
            source: "webhook",
            ...request_body
        },
    };

    try {
        await dynamoDb.put(params).promise();
    } catch (e) {
        console.log('Could not store event', e);
        return problem(e.message);
    }

    return ok();
};

// /src/handlers/segment/trackAnonymous.js
const { withStatusCode } = require('../../utils/response.util');
const ok = withStatusCode(200, JSON.stringify);

const {SegmentTracking} = require('../../SegmentTracking');
const SegmentTracker = new SegmentTracking();

exports.handler = async (event) => {
    const { id } = event.pathParameters;

    await SegmentTracker.trackAnonymous(id, true);

    return ok();
};

// /src/handlers/segment/trackUser.js
const { withStatusCode } = require('../../utils/response.util');
const ok = withStatusCode(200, JSON.stringify);

const {SegmentTracking} = require('../../SegmentTracking');
const SegmentTracker = new SegmentTracking();

exports.handler = async (event) => {
    const { id } = event.pathParameters;

    await SegmentTracker.trackUser(id, true);

    return ok('Track Completed');
};