/*global require describe it */
var pg = require ('pg')
var should = require('should')
var config_okay=require('config_okay')
var async = require('async')
var component_query = require('../lib/component_query')
var path    = require('path')
var rootdir = path.normalize(__dirname)

describe('get daily from postgresql',function(){

    it('should get data for vds detector',function(done){

        async.waterfall([function(cb){
                             var config_file = rootdir+'/../test.config.json'

                             config_okay(config_file,function(err,c){
                                 if(!c.postgresql || ! c.postgresql.db){ throw new Error('need valid db defined in test.config.json under postgresql.db.  See the README for details')}
                                 c.detector_id='vdsid_1000210'
                                 c.direction='south'
                                 return cb(null,c)
                             })
                             return null
                         }
                        ,function(task,cb){
                             var connection_string = "pg://"
                                                   + task.postgresql.auth.username+":"
                                                   + task.postgresql.auth.password+"@"
                                                   + task.postgresql.host+":"
                                                   + task.postgresql.port+"/"
                                                   + task.postgresql.db
                             pg.connect(connection_string
                                       ,component_query(task,cb)
                                       )
                             return null
                         }]
                       ,function(e,r){
                            should.not.exist(e)
                            should.exist(r)
                            r.should.have.property('features')
                            r.should.have.property('components')
                            r.features.should.have.lengthOf(365  +366 + 365)
                            r.components.should.have.lengthOf(4)
                            return done()
                        })
        return null
    })
    it('should get data for vds detector without a direction specified',function(done){

        async.waterfall([function(cb){
                             var config_file = rootdir+'/../test.config.json'

                             config_okay(config_file,function(err,c){
                                 if(!c.postgresql || ! c.postgresql.db){ throw new Error('need valid db defined in test.config.json under postgresql.db.  See the README for details')}
                                 c.detector_id='vdsid_1000210'
                                 return cb(null,c)
                             })
                             return null
                         }
                        ,function(task,cb){
                             var connection_string = "pg://"
                                                   + task.postgresql.auth.username+":"
                                                   + task.postgresql.auth.password+"@"
                                                   + task.postgresql.host+":"
                                                   + task.postgresql.port+"/"
                                                   + task.postgresql.db
                             pg.connect(connection_string
                                       ,component_query(task,cb)
                                       )
                             return null
                         }]
                       ,function(e,r){
                            should.not.exist(e)
                            should.exist(r)
                            r.should.have.property('features')
                            r.should.have.property('components')
                            r.features.should.have.lengthOf(365  +366 + 365)
                            r.components.should.have.lengthOf(4)
                            console.log(r.components)
                            return done()
                        })
        return null
    })
    it('should get data for wim detector',function(done){

        async.waterfall([function(cb){
                             var config_file = rootdir+'/../test.config.json'

                             config_okay(config_file,function(err,c){
                                 if(!c.postgresql || ! c.postgresql.db){ throw new Error('need valid db defined in test.config.json under postgresql.db.  See the README for details')}
                                 c.detector_id='wimid_82'
                                 c.direction='east'
                                 return cb(null,c)
                             })
                             return null
                         }
                        ,function(task,cb){
                             var connection_string = "pg://"
                                                   + task.postgresql.auth.username+":"
                                                   + task.postgresql.auth.password+"@"
                                                   + task.postgresql.host+":"
                                                   + task.postgresql.port+"/"
                                                   + task.postgresql.db
                             pg.connect(connection_string
                                       ,component_query(task,cb)
                                       )
                             return null
                         }]
                       ,function(e,r){
                            should.not.exist(e)
                            should.exist(r)
                            r.should.have.property('features')
                            r.should.have.property('components')
                            r.features.should.have.lengthOf(365  +366 + 365)
                            r.components.should.have.lengthOf(5)
                            console.log(r.components)
                            return done()
                        })
        return null
    })
})
