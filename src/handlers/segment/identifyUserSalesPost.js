// /src/handlers/segment/trackAnonymous.js
const { withStatusCode } = require('../../utils/response.util');
const { parseWith } = require('../../utils/request.util');

const {SegmentTracking} = require('../../SegmentTracking');
const SegmentTracker = new SegmentTracking();

const parseJson = parseWith(JSON.parse);
const ok = withStatusCode(200);

exports.handler = async (event) => {
    const request_body = parseJson(event.body);
    const { type, userId, traits } = request_body;

    if (type !== 'identify') {
        return ok('not an identify event');
    }

    if (
        traits['j_o_visitor_attribution__update_traits_first_last_attribution_yuno7'] !== true &&
        traits['j_o_visitor_attribution_copy__update_traits_first_last_attribution_5flui'] !== true
    ) {
        return ok('not not a last_attribution_wv3dl identify call');
    }

    if (userId) {
        await SegmentTracker.trackUserSales(userId);
    }

    return ok();
};
