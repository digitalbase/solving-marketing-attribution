require('dotenv').config();

const expect = require('chai').expect;
const supertest = require('supertest');
const request = supertest(process.env.TEST_ENDPOINT);
const fs = require('fs');

const identify_payload = JSON.parse(fs.readFileSync('docs/events/identify.json'));

describe('Feeding Events', () => {
    it(`POST /dev/events - Test skipping invalid event`, async () => {
        await request
            .post(`/dev/events`)
            .send({ ...identify_payload, type: 'group'})
            .expect('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .expect({ message: "Skipping event (not a page/identify)"})
            .expect(202); //settimeout and done.

        //await sleep(1000);
    });

    it(`POST /dev/events - Store valid event`, async () => {
        await request
            .post(`/dev/events`)
            .send(identify_payload)
            .expect('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .expect({ message: "Successfully stored the event"})
            .expect(201); //settimeout and done.

        //await sleep(1000);
    });

});
