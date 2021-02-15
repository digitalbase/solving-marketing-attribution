// Once a noteworthy source is identified we fire a tracking call
// spec @ https://segment.com/docs/connections/spec/track/
analytics.track('Visitor Origin Identified`, {
{
    "referrer": {
    type: "email",
        client: "gmail",
        from: "https://mail.google.com/",
        link: "http://blog.intercom.io/churn-retention-and-reengaging-customers/?utm_source=feedburner&utm_medium=feed&utm_campaign=Feed%3A+contrast%2Fblog+%28The+Intercom+Blog%29"
},
    "campaign": {
    source: "feedburner",
        medium: "feed",
        campaign: "Feed: contrast/blog (The Intercom Blog)"
}
});

// Once in a while we calculate the different models for the user
// spec @ https://segment.com/docs/connections/spec/identify/
analytics.identify(userId, {
    first_source_primary: 'email',
    first_source_secondary: 'gmail',
    last_source_primary: 'paid',
    last_source_secondary: 'adwords',
});