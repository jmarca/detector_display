/*global require process */
// a small server to run while testing the UI

var express = require('express')
var data = require('./.').detector_details
var county_detectors_service=require('county_detector_collation')
var app = express()
          .use(express.logger())
var app,server
var env = process.env;
var testhost = env.TEST_HOST || '127.0.0.1'
var testport = env.TEST_PORT || 3000

var path = require('path')
var rootdir = path.normalize(__dirname)



data(app)
county_detectors_service(app,'/county/detectors',rootdir+'/config.json')

app.use(express.errorHandler({ dumpExceptions: true, showStack: true }))
app.use(express.static('public'))

app.listen(testport,testhost,function(){
    console.log('server listening on host: '+testhost+':'+testport)
})
