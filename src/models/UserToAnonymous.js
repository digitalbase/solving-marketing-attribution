const USER_MAP_TABLE = process.env.USER_MAP_TABLE;

class UserToAnonymousModel {
    get _baseParams() {
        return {
            TableName: USER_MAP_TABLE
        };
    }

    constructor(documentClient) {
        this._documentClient = documentClient;
    }

    /**
     *
     * Checks if the map already exists
     * If no -> create
     * If yes -> merge new anonymous ids and store
     *
     * @param userId
     * @param anonymousId
     * @returns {Promise<D & {$response: Response<D, E>}>}
     */
    async storeMap(userId, anonymousId) {
        const params = this._createParamObject({
            Item: {
                userId,
                anonymousId,
            }
        });

        await this._documentClient.put(params).promise();

        return;
    }

    async getAnonymousIdsForUser(userId) {

        const params = this._createParamObject({
            KeyConditionExpression: "#userId = :userId",
            ExpressionAttributeNames:{
                "#userId": "userId"
            },
            ExpressionAttributeValues: {
                ":userId": userId
            }
        });

        const allItems = await this._documentClient.query(params).promise();

        return allItems.Items.map(({ anonymousId }) => anonymousId);
    }

    _createParamObject(additionalArgs = {}) {
        return Object.assign({}, this._baseParams, additionalArgs);
    }
}

exports.UserToAnonymousModel = UserToAnonymousModel;