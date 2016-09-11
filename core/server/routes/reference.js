'use strict';

const action = require('../actions');

module.exports = (app) => {

  app.post('/api/reference/replace', (request, response) => {
    const reference = request.body.reference.replace('..', 'backstop_data');
    const test = request.body.test.replace('..', 'backstop_data');

    //TODO real path
    // const reference = 'backstop_data/bitmaps_reference/My Homepage_0_header_0_phone.png';
    // const test = 'backstop_data/bitmaps_test/20160908-104127/My Homepage_1_main_0_phone.png';

    action.overrideReferenceFile(reference, test)
      .then(function() {
        return action.updateTestPair();
      })
      .then(function() {
        response.json({
          reference,
          test
        });
      })
      .catch(function (err) {
          console.log(err);
      });
  });

};
