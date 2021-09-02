const ATTRIBUTION_TABLE = process.env.ATTRIBUTION_TABLE;

const extractor = require('../utils/event_extraction.util');

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

        const results = await Promise.all(promises);

        return results.filter((el) => {
            return el.length !== 0;
        });
    }

    _createParamObject(additionalArgs = {}) {
        return Object.assign({}, this._baseParams, additionalArgs);
    }
}

exports.SourceAttributionModel = SourceAttributionModel;
