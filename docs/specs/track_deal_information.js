// spec @ https://segment.com/docs/connections/spec/track/
analytics.track('Deal Status Won', {
    dealSize: 5400
    dealCurrency: 'euro'
    dealPeriod: 'annual'
});

// spec @ https://segment.com/docs/connections/spec/identify/
analytics.identify(userId, {
    dealStatus: 'won',
    dealSize: 5400,
    dealCurrency: 'euro
});