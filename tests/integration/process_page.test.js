require('dotenv').config();

const expect = require('chai').expect;
const supertest = require('supertest');
const request = supertest(process.env.TEST_ENDPOINT);
const fs = require('fs');
const uuid = require('uuid');

const anonymousId = uuid.v4();
const userId = uuid.v4();

const identify_payload = JSON.parse(fs.readFileSync('docs/events/identify.json'));
identify_payload.messageId = uuid.v4();
identify_payload.anonymousId = anonymousId;
identify_payload.userId = userId;

const page_payload = JSON.parse(fs.readFileSync('docs/events/page.json'));
page_payload.messageId = uuid.v4();
page_payload.anonymousId = anonymousId;

describe('Check if page events are stored', () => {

    it(`POST /dev/events - Store identify event`, async () => {
        await request
            .post(`/dev/events`)
            .send(identify_payload)
            .expect('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .expect({ message: "Successfully stored the event"})
            .expect(201); //settimeout and done.
    });

    it(`POST /dev/events - Store page event`, async () => {
        await request
            .post(`/dev/events`)
            .send(page_payload)
            .expect('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .expect({ message: "Successfully stored the event"})
            .expect(201); //settimeout and done.

        await sleep(1000);
    });

    it(`Wait for a bit`, async () => {
        await sleep(1000);
    });


    it(`GET /dev/api/user/${userId} - Check if session was added`, async () => {
        const result = await request
            .get(`/dev/api/user/${userId}`)
            .expect('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .expect(200);

        expect(result.body.anonymousIds).to.have.lengthOf(1);
        expect(result.body.sessions).to.have.lengthOf(1);
    });

        // do call to API to see what's in it
});

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
