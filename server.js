/*global require process */
// a small server to run while testing the UI

var express = require('express')

var app = express()
          .use(express.logger())
var app,server
var env = process.env;
var testhost = env.TEST_HOST || '127.0.0.1'
var testport = env.TEST_PORT || 3000

var data = require('./server/app')

var path = require('path')
var rootdir = path.normalize(__dirname)

var config_file = rootdir+'/test.config.json'
var config_okay=require('config_okay')


config_okay(config_file,function(err,c){
            app = express()
                  .use(express.logger())

            data(c)(app)
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }))
    app.use(express.static('public'))

    app.listen(testport,testhost,function(){
        console.log('server listening on host: '+testhost+':'+testport)
    })
})
