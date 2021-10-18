const ATTRIBUTION_TABLE = process.env.ATTRIBUTION_TABLE;

const extractor = require('../utils/event_extraction.util');

if (!ATTRIBUTION_TABLE) {
    throw new Error('ATTRIBUTION_TABLE not set');
}

class SourceAttributionModel {
    get _baseParams() {
        return {
            TableName: ATTRIBUTION_TABLE
        };
    }

    constructor(documentClient) {
        this._documentClient = documentClient;
    }

    async store(eventData, extraction) {
        const extractedData = extractor(eventData);
        const {referrer, href, anonymousId, userId, timestamp, messageId } = extractedData;

        const eventId = `${timestamp}-${messageId}`; // using as hash function
        const params = this._createParamObject({
            Item: {
                anonymousId,
                eventId,
                messageId,
                timestamp,
                userId,
                url: href,
                referrerUrl: referrer,
                ...extraction
            }
        });

        return await this._documentClient.put(params).promise();
    }

    async getForAnonymousId(anonymousId) {

        const params = this._createParamObject({
            KeyConditionExpression: "#anonymousId = :anonymousId",
            ExpressionAttributeNames:{
                "#anonymousId": "anonymousId"
            },
            ExpressionAttributeValues: {
                ":anonymousId": anonymousId
            }
        });
        const allItems = await this._documentClient.query(params).promise();

        return allItems.Items;
    }

    async getForAnonymousIds(anonymousIds) {
        const promises = anonymousIds.map(async anonymousId => {
            return this.getForAnonymousId(anonymousId);
        });

        //extra level is created?
        const results = await Promise.all(promises);

        return results.filter((el) => {
            return el.length !== 0;
        });
    }

    async flattenSessionsForAnonymousIds(anonymousIds) {
        const sessions_per_id = await this.getForAnonymousIds(anonymousIds);

        // Flattening
        const flattened_sessions = sessions_per_id.reduce((result, current_sessions) => {
            return [ ...current_sessions ];
        },[]);

        console.log('before_sort', flattened_sessions);

        flattened_sessions.sort((a, b) => {
            const date_a = new Date(a.timestamp);
            const date_b = new Date(b.timestamp);

            return date_a.getTime() - date_b.getTime();
        });
        console.log('after_sort', flattened_sessions);

        return flattened_sessions;
    }

    _createParamObject(additionalArgs = {}) {
        return Object.assign({}, this._baseParams, additionalArgs);
    }
}

exports.SourceAttributionModel = SourceAttributionModel;
