module.exports = function(casper) {
    console.log('onBeforeStart.global.js');

    casper.on('resource.requested', function(requestData, request) {
        var self = this;

        // If any of these strings are found in the requested resource's URL, skip
        // this request. These are not required for running tests.
        var skip = [
            'google.ch',
            'google.com',
            'google.de',
            'ssl.hurra.com',
            'doubleclick.net',
            'googleadservices.com'
        ];

        skip.forEach(function(needle) {
            // self.echo(requestData.url.indexOf(needle));
            if (requestData.url.indexOf(needle) >= 0) {
                self.echo('killed request to url containing: ' + needle, 'COMMENT');
                request.abort();
            }
        })
    });
};
