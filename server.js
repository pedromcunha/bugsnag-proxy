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

// bugsnag.notify(new Error("Non-fatal"));

app.post("/", upload.any(), function (request, response) {
  var file = request.files[0];
  if(file) {
    minidump.walkStack(file.path, function(error, report) {
      if(report) {
        const reportString = report.toString('utf-8');
        const reason = reportString.split("Crash reason: ")[1].split("Crash address")[0];
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
