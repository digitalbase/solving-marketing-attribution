module.exports = (request_body) => {
    const referrer = request_body.context.page.referrer;
    const href = request_body.context.page.url;
    const anonymousId = request_body.anonymousId;
    const messageId = request_body.messageId;
    const userId = request_body.userId;
    const type = request_body.type;
    const timestamp = request_body.timestamp;

    // Only handle `page` and `track` events
    if (type !== 'page' && type !== 'track') {
        return false;
    }

    return {
        referrer,
        messageId,
        href,
        anonymousId,
        timestamp,
        userId
    }
};