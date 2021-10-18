require('dotenv').config();

const expect = require('chai').expect;
const supertest = require('supertest');
const request = supertest(process.env.TEST_ENDPOINT);

if (!process.env.TEST_ENDPOINT) {
    throw new Error('TEST_ENDPOINT not set');
}

const fs = require('fs');
const uuid = require('uuid');


const identify_payload = JSON.parse(fs.readFileSync('docs/events/identify.json'));
const anonymousId = uuid.v4();
const userId = uuid.v4();
identify_payload.messageId = uuid.v4();
identify_payload.anonymousId = anonymousId;
identify_payload.userId = userId;

describe('Check if identify events are stored', () => {

    it(`POST /dev/events - Store identify event`, async () => {
        await request
            .post(`/dev/events`)
            .send(identify_payload)
            .expect('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .expect({ message: "Successfully stored the event"})
            .expect(201); //settimeout and done.

        await sleep(500);
    });

    it(`GET /dev/api/user/ - Check if anonymous Id was stored`, async () => {
        await sleep(500);

        await request
            .get(`/dev/api/user/${identify_payload.userId}`)
            .expect('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .expect(200)
            .expect({sessions: [], anonymousIds: [ anonymousId ]});
    });

        // do call to API to see what's in it
});

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
