// src/SegmentTracking.js
const https = require('https');

const dynamoDBFactory = require('./dynamodb.factory');
const {UserToAnonymousModel} = require('./models/UserToAnonymous');
const {SourceAttributionModel} = require('./models/SourceAttribution');

const SOURCE_IDENTIFIED_EVENT_NAME = process.env.ANALYTICS_SOURCE_IDENTIFICATION_EVENT;

class SegmentTracking {
    constructor() {
        this._dynamoDb =  dynamoDBFactory();
        this._model_usermap = new UserToAnonymousModel(this._dynamoDb);
        this._model_source = new SourceAttributionModel(this._dynamoDb);
    }

    extractPropertiesFromEvent(event, prefix = '') {
        const properties = {};

        if (prefix !== '') {
            prefix = prefix + '_';
        }

        properties[prefix+'url'] = event.url;
        properties[prefix+'referrer'] = event.referrerUrl;

        if (event.referrer) {
            properties[prefix+'referrer_type'] = event.referrer.type || null;
            properties[prefix+'referrer_network'] = event.referrer.network || null;
            properties[prefix+'referrer_engine'] = event.referrer.engine || null;
            properties[prefix+'referrer_host'] = event.referrer.host || null;
            properties[prefix+'referrer_client'] = event.referrer.client || null;
        }

        if (event.campaign) {
            properties[prefix+'campaign_name'] = event.campaign.campaign || null;
            properties[prefix+'campaign_source'] = event.campaign.source || null;
            properties[prefix+'campaign_medium'] = event.campaign.medium || null;
            properties[prefix+'campaign_term'] = event.campaign.term || null;
        }


        return properties;
    }

    async trackUser(user_id, include_track_events= false) {
        const anonymousIds = await this._model_usermap.getAnonymousIdsForUser(user_id);
        const attributionSessions = await this._model_source.getForAnonymousIds(anonymousIds);
        let data = [];

        if (anonymousIds.length > 0) {
            const [first] = attributionSessions;
            const [last] = [...attributionSessions ].reverse(); //to not modify the original
            const user_properties = {
                type: "identify",
                userId: user_id,
                active: false,
                ip: null,
                context: {
                    active:false
                },
                traits: {
                    lastSyncedSma: new Date(),
                    ...this.extractPropertiesFromEvent(first, 'source_first'),
                    ...this.extractPropertiesFromEvent(last, 'source_last'),
                }
            };

            //console.log(user_properties);
            data.push(user_properties);
        }

        if (include_track_events === true) {

            attributionSessions.forEach((session) => {
                const event_timestamp = new Date(session.timestamp);
                //console.log(session.timestamp);
                const tracking_properties = {
                    type: "track",
                    //anonymousId: "c333e5eb-4eb2-4a9d-a312-5e3fff3e2620",
                    userId: user_id,
                    context: {
                        active:false
                    },
                    integrations: { All: true },
                    event: SOURCE_IDENTIFIED_EVENT_NAME,
                    timestamp: event_timestamp.toISOString(),
                    properties: this.extractPropertiesFromEvent(session)
                };

                data.push(tracking_properties);
                //console.log(tracking_properties);
            });
        }

        return this.callSegment(data);
    }

    async callSegment(events) {
        return new Promise((resolve, reject) => {
            const data = JSON.stringify({ batch: events });

            // https://segment.com/docs/connections/sources/catalog/libraries/server/http-api/#headers
            const auth_username = process.env.ANALYTICS_WRITE_KEY + ":";
            const auth_buffer = Buffer.from(auth_username);
            const auth = 'Basic: ' + auth_buffer.toString('base64');
            const options = {
                hostname: 'api.segment.io',
                port: 443,
                path: '/v1/batch',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': data.length,
                    'Authorization': auth
                }
            };

            const req = https.request(options,
                (res) => {
                    let body = '';
                    res.on('data', (chunk) => (body += chunk.toString()));
                    res.on('error', reject);
                    res.on('end', () => {
                        if (res.statusCode >= 200 && res.statusCode <= 299) {

                            resolve({statusCode: res.statusCode, headers: res.headers, body: body});
                        } else {
                            reject('Request failed. status: ' + res.statusCode + ', body: ' + body);
                        }
                    });
                });

            req.on('error', reject);
            req.write(data);
            req.end();
        });
    }

    async trackAnonymous(anonymous_id) {
        const attributionSessions = await this._model_source.getForAnonymousId(anonymous_id);
        let data = [];

        attributionSessions.forEach((session) => {
            //console.log(session.timestamp);
            const tracking_properties = {
                type: "track",
                anonymousId: anonymous_id,
                event: SOURCE_IDENTIFIED_EVENT_NAME,
                timestamp: session.timestamp,
                properties: this.extractPropertiesFromEvent(session)
            };

            data.push(tracking_properties);

            //console.log(tracking_properties);
        });

        return this.callSegment(data);
    }
}


exports.SegmentTracking = SegmentTracking;