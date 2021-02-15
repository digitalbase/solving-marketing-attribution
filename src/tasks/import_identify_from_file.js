// src/tasks/import_identify_from_file.js
// copied from https://stackoverflow.com/questions/32678325/how-can-i-import-bulk-data-from-a-csv-file-into-dynamodb

const fs = require('fs');
const parse = require('csv-parse');
const async = require('async');

const CSV_FILENAME = process.argv[2];
const DYNAMODB_TABLENAME = 'sma-identify-event-dev';

const dynamoDBFactory = require('../dynamodb.factory');
const dynamoDb = dynamoDBFactory();

const rs = fs.createReadStream(CSV_FILENAME);
const parser = parse({
    columns: true,
    delimiter: ','
}, function(err, data) {

    const split_arrays = [],
        size = 25;

    while (data.length > 0) {
        split_arrays.push(data.splice(0, size));
    }

    let data_imported = false;
    let chunk_no = 1;

    async.each(split_arrays, function(item_data, callback) {
        const params = {
            RequestItems: {}
        };
        params.RequestItems[DYNAMODB_TABLENAME] = [];
        item_data.forEach(item => {

            const transformed_item = {
                messageId: item.id,
                source: "import",
                anonymousId: item.anonymous_id,
                context: {
                    ip: item.context_ip,
                    library: {
                        name: item.context_library_name,
                        version: item.context_library_version
                    },
                    locale: item.context_locale,
                    page: {
                        path: item.context_page_path,
                        referrer: item.context_page_referrer,
                        search: item.context_page_search,
                        title: item.context_page_title,
                        url: item.context_page_url,
                    },
                    userAgent: item.context_user_agent,
                },
                integrations: { All: true },
                originalTimestamp: item.original_timestamp,
                receivedAt: item.received_at,
                sentAt: item.sent_at,
                timestamp: item.timestamp,
                type: "identify",
                userId: item.user_id
            };

            params.RequestItems[DYNAMODB_TABLENAME].push({
                PutRequest: {
                    Item: { ...transformed_item }
                }
            });

        });

        dynamoDb.batchWrite(params, function(err, res, cap) {
            console.log('done going next');
            if (err == null) {
                console.log('Success chunk #' + chunk_no);
                data_imported = true;
            } else {
                console.log(err);
                console.log('Fail chunk #' + chunk_no);
                data_imported = false;
            }

            chunk_no++;
            callback();
        });

    }, function() {
        // run after loops
        console.log('all data imported....');
    });

});
rs.pipe(parser);