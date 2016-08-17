// init project
const express = require('express');
const multer  = require('multer');
const minidump = require('minidump');
const fs = require('fs');
const bugsnag = require("bugsnag");
const config = require('./config.json');
const app = express();
const upload = multer({ dest: 'temp/' });

bugsnag.register(config.bugsnagKey);

app.post("/", upload.any(), function (request, response) {
  const file = request.files[0];
  if(file) {
    minidump.walkStack(file.path, function(error, report) {
      const data = {
        extraData: {
          electron_version: request.body.ver,
          platform: request.body.platform
        }
      };

      if(report !== undefined) {
        const reportString = report.toString('utf-8');
        if(reportString !== undefined) {
          const reason = reportString.split("Crash reason: ")[1].split("Crash address")[0];
          bugsnag.configure({
            appVersion: request.body._version
          });
          bugsnag.notify(new Error(reason), data);
        }
      }
      fs.unlink(file.path);
    });
  }
  response.sendStatus(200);
});


// listen for requests :)
const listener = app.listen(config.port, function () {
  console.log('Listening on port ' + listener.address().port);
});
