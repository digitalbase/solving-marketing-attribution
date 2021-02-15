const AWS = require('aws-sdk');
const { DocumentClient } = require('aws-sdk/clients/dynamodb');

module.exports = () => {
    return new DocumentClient( {
        // ensures empty values (userId = null) are converted
        // more @ https://stackoverflow.com/questions/37479586/nodejs-with-dynamodb-throws-error-attributevalue-may-not-contain-an-empty-strin
        convertEmptyValues: true
    });
};