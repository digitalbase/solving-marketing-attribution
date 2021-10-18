const { withStatusCode } = require('../../utils/response.util');
const ok = withStatusCode(200, JSON.stringify);
const nok = withStatusCode(500, JSON.stringify);

const {SegmentTracking} = require('../../SegmentTracking');
const SegmentTracker = new SegmentTracking();

exports.handler = async (event) => {
    try {
        const { id } = event.pathParameters;

        await SegmentTracker.trackUser(id, false);

        return ok('Track Completed');
    } catch (e) {
        return nok(e.message);
    }
};
