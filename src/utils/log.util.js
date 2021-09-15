const log = (message) => {
    if (process.env.LOGGING === 'true') {
        console.log(message);
    }
}


module.exports = {
    log
};
