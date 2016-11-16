/*global require describe it */
var pg = require ('pg')
var should = require('should')
var config_okay=require('config_okay')
var async = require('async')
var detector_display = require('../lib/detector_display')
var path    = require('path')
var rootdir = path.normalize(__dirname)

describe('get data from psql and couchdb for displayl',function(){

    it('should get data for wim detector',function(done){

        async.waterfall([function(cb){
                             var c={}
                             c.detector_id='wim.82.E'
                             //c.direction='east'
                             c.config_file = rootdir+'/../test.config.json'
                             return cb(null,c)
                         }
                        ,detector_display.fetch
                        ,detector_display.sort
                        ]
                       ,function(e,r){
                            should.not.exist(e)
                            should.exist(r)
                            r.should.have.property('features')
                            r.should.have.property('components')
                            r.features.should.have.lengthOf(365)
                            r.components.should.have.lengthOf(3)
                            r.component_details.should.have.length(3)

                            r.component_details[0].detector.should.eql('772953')
                            r.component_details[1].detector.should.eql('wim.82.E')
                            r.component_details[2].detector.should.eql('716142')

                            return done()
                        })
        return null
    })
})
