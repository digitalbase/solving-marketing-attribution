const { withStatusCode } = require('../../utils/response.util');
const ok = withStatusCode(200, JSON.stringify);
const nok = withStatusCode(500, JSON.stringify);

const {SegmentTracking} = require('../../SegmentTracking');
const SegmentTracker = new SegmentTracking();

exports.handler = async (event) => {
    try {
        const { id } = event.pathParameters;

        const salesData = await SegmentTracker.trackUserSales(id);

        return ok(salesData);
    } catch (e) {
        return nok(e.message);
    }
};
