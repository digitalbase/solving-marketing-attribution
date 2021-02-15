const inbound = require('prezly-inbound');

module.exports = async(href, referrer) => {
    console.log('going extraction', href, referrer);

    return new Promise((resolve, reject) => {
        inbound.referrer.parse(href, referrer, (error, data) => {
            if (error) {
                reject(error);
            } else {
                if (data.referrer.type === 'internal') {
                    resolve(null);
                }

                resolve(data);
            }
        });
    });
};