/*global require describe it */

var should = require('should')
var config_okay=require('config_okay')
var async = require('async')
var get_components = require('../lib/get_component_details')
var path    = require('path')
var rootdir = path.normalize(__dirname)

describe('get details on some detectors',function(){

    it('should get data for vds detectors',function(done){

        async.waterfall([function(cb){
                             var config_file = rootdir+'/../test.config.json'

                             config_okay(config_file,function(err,c){
                                 if(!c.couchdb || ! c.couchdb.db){ throw new Error('need valid db defined in test.config.json under couchdb.db.  See the README for details')}
                                 return cb(null,c)
                             })
                             return null
                         }
                        ,function(task,cb){
                             task.detector='vdsid_100210'
                             task.components=['1000410'
                                             ,'1000110'
                                             ,'1000210'
                                             ,'1000310'
                                            ]
                             return cb(null,task)
                         }
                        ,get_components]
                       ,function(e,r){
                            should.not.exist(e)
                            should.exist(r)
                            r.should.have.property('component_details')
                            var components = Object.keys(r.component_details)
                            r.component_details.should.have.keys('1000410'
                                                                ,'1000310'
                                                                ,'1000210'
                                                                ,'1000110')
                            return done()
                        })
        return null
    })
    it('should get data for wim detectors',function(done){

        async.waterfall([function(cb){
                             var config_file = rootdir+'/../test.config.json'

                             config_okay(config_file,function(err,c){
                                 if(!c.couchdb || ! c.couchdb.db){ throw new Error('need valid db defined in test.config.json under couchdb.db.  See the README for details')}
                                 return cb(null,c)
                             })
                             return null
                         }
                        ,function(task,cb){
                             task.components=['wim.82.E'
                                            ]
                             return cb(null,task)
                         }
                        ,get_components]
                       ,function(e,r){
                            should.not.exist(e)
                            should.exist(r)
                            r.should.have.property('component_details')
                            var components = Object.keys(r.component_details)
                            r.component_details.should.have.keys('wim.82.E')
                            r.component_details['wim.82.E'].should.be.ok
                            r.component_details['wim.82.E'].should.have.keys(
                                ['loc'
                                ,'wim_type'
                                ,'cal_pm'
                                ,'cal_pm_numeric'
                                ,'latitude'
                                ,'longitude'
                                ,'freeway'
                                ,'geojson'
                                ,'lanes'
                                ,'county'
                                ,'abs_pm'])


                            return done()
                        })
        return null
    })

})
describe('hide passwords',function(done){
    it('should not expose the original config object',function(done){

        async.waterfall([function(cb){
                             var config_file = rootdir+'/../test.config.json'

                             config_okay(config_file,function(err,c){
                                 if(!c.couchdb || ! c.couchdb.db){ throw new Error('need valid db defined in test.config.json under couchdb.db.  See the README for details')}
                                 return cb(null,c)
                             })
                             return null
                         }
                        ,function(task,cb){
                             task.detector='vdsid_100210'
                             task.components=['1000410'
                                             ,'1000110'
                                             ,'1000210'
                                             ,'1000310'
                                            ]
                             return cb(null,task)
                         }
                        ,get_components]
                       ,function(e,r){
                            should.not.exist(e)
                            should.exist(r)
                            r.should.not.have.property('couchdb')
                            r.should.not.have.property('postgresql')
                            return done()
                        })
        return null
    })
})