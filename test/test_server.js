/*global require before after describe it process */

var should = require('should')
var fs = require('fs')
var path = require('path')
var async = require('async')
var _ = require('lodash')
var request = require('request')

var express = require('express')

var data = require('../server/app')
var http = require('http')

var path    = require('path')
var rootdir = path.normalize(__dirname)
var config_file = rootdir+'/../test.config.json'
var config_okay=require('config_okay')

var app,server
var env = process.env;
var testhost = env.TEST_HOST || '127.0.0.1'
var testport = env.TEST_PORT || 3000
testport += 2


var server_host = 'http://'+testhost + ':'+testport

before(
    function(done){

        config_okay(config_file,function(err,c){
            app = express()
                  .use(express.logger())

            data(c)(app)
            server=http
                   .createServer(app)
                   .listen(testport,testhost,done)

        })
    }
)
after(function(done){
    server.close(done)
})

describe('data server',function(){
    it('should serve Sonoma',function(done){
        var areatype = 'county'
        var areaname = 'Sonoma'
        request.get(server_host+'/'+'detector/wim.82.E'+'.json'
                   ,function(e,r,b){
                        should.not.exist(e)
                        should.exist(r)
                        should.exist(b)
                        var doc = JSON.parse(b)
                        doc.should.have.property('features')
                        doc.should.have.property('components')

                        var data_len = doc.features.length
                        data_len.should.eql(365+366+365)
                        doc.components.should.have.lengthOf(5)

                        doc.component_details.should.have.keys('765486'
                                                              ,'718469'
                                                              ,'717692'
                                                              ,'wim.82.E'
                                                              ,'716142'
                                                              )
                        return done()
                    })
        return null
    })
})
