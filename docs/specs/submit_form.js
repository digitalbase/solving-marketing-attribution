fetch(HUBSPOT_FORM_URL, {
    method: 'POST',
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json;charset=utf-8',
    },
    body: dataForHubspot,
})
    .then((response) => {
        if (response.ok) {
            this.form.reset(); // clear input
            ModalManager.hide();

            trackAnalyticsEventsForSuccess(data);
        } else {
            // general validation error
            response.json().then((responsePayload) => {
                const errors = responsePayload.errors || [];
                this.highlightInvalidHubspotInputs(errors);
                trackAnalyticsEventsForValidationFailure(data);
                if (responseContainsInvalidEmailError(errors)) {
                    this.toggleEmailValidationError(true);
                }
            });
        }
    })
    .catch(() => {
        this.toggleSubmissionError(true);
        trackAnalyticsEventsForFailure(data);
    })
    .finally(() => {
        submitButton.removeAttribute('disabled');
        this.toggleLoadingState(false);
    });