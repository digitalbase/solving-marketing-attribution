const withStatusCode = (statusCode, formatter = null) => {
    if (100 > statusCode || statusCode > 599) {
        throw new Error('status code out of range');
    }

    const hasFormatter = typeof formatter === 'function';
    // send whatever was passed in through if a formatter is not provided
    const format = hasFormatter ? formatter : _ => _;

    // return a function that will take some data and formats a response with a status code
    return (data = null) => {
        const response = {
            statusCode: statusCode
        };

        // only send a body if there is data
        if (data) {
            response.body = format(data);
        }

        return response;
    }
};

module.exports = {
    withStatusCode
};