require('dotenv').config();

const expect = require('chai').expect;
const supertest = require('supertest');
const request = supertest(process.env.TEST_ENDPOINT);

const anonymousId = 'posakd'

describe('API Test', () => {

    it(`GET /dev/api/anonymous/${anonymousId}`, function (done) {
        request
            .get(`/dev/api/anonymous/${anonymousId}`)
            .expect(200)
            .expect({sessions: []}, done);
    });
});
