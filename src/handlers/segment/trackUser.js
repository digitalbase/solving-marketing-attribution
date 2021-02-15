const { withStatusCode } = require('../../utils/response.util');
const ok = withStatusCode(200, JSON.stringify);

const {SegmentTracking} = require('../../SegmentTracking');
const SegmentTracker = new SegmentTracking();

exports.handler = async (event) => {
    const { id } = event.pathParameters;

    await SegmentTracker.trackUser(id, true);

    return ok('Track Completed');
};