// /src/handlers/segment/trackAnonymous.js
const { withStatusCode } = require('../../utils/response.util');
const { parseWith } = require('../../utils/request.util');

const {SegmentTracking} = require('../../SegmentTracking');
const SegmentTracker = new SegmentTracking();

const parseJson = parseWith(JSON.parse);
const ok = withStatusCode(200);
const problem = withStatusCode(400);

exports.handler = async (event) => {
    const request_body = parseJson(event.body);
    const { type, anonymousId, userId, traits } = request_body;

    if (type !== 'identify') {
        return ok('not an identify event');
    }

    if (
        traits['j_o_visitor_attribution__update_traits_first_last_attribution_yuno7'] === true ||
        traits['j_o_visitor_attribution_copy__update_traits_first_last_attribution_5flui'] === true
    ) {
        const include_track_events = false;
        if (userId) {
            await SegmentTracker.trackUser(userId, include_track_events);
        } else if (anonymousId) {
            await SegmentTracker.trackAnonymous(anonymousId, include_track_events);
        }

        return ok('Web Channel Source Attribution done');
    }

    if (
        traits['j_o_sales_attribution__sales_attribution_1_day_1yq1c'] === true ||
        traits['j_o_sales_attribution__sales_attribution_3_days_qqrve'] === true ||
        traits['j_o_sales_attribution__sales_attribution_7_days_607hs'] === true ||
        traits['j_o_sales_attribution__sales_attribution_21_days_lzu3g'] === true
    ) {
        if (userId) {
            await SegmentTracker.trackUserSales(userId);
        }

        return ok('Web Channel Source Attribution done');
    }



    return problem('Incorrect payload.');

};
