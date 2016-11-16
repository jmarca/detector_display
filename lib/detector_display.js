/*global require */
var path = require('path')
var rootdir = path.normalize(__dirname)
var config_okay = require('config_okay')
var config_file = rootdir+'/../'+'config.json'
var _ = require('lodash')
var async = require('async')
var pg = require('pg')

var component_query = require('./component_query')
var get_components = require('./get_component_details')
var sanitize=require('./sanitize')
var _ = require('lodash')
function configure(task,cb){
    if(task.postgresql && task.couchdb){
        return cb(null,task)
    }
    var config_file = task.config_file

    config_okay(config_file,function(err,c){
        if(!c.postgresql || ! c.postgresql.detector_display_db){ throw new Error('need valid db defined in '+config_file+' under postgresql.detector_display_db.  See the README for details')}
        if(!c.couchdb || ! c.couchdb.detector_display_db){ throw new Error('need valid db defined in  '+config_file+' under couchdb.detector_display_db.  See the README for details')}
        task = _.extend(task,c)
        return cb(null,task)
    })
    return null
}

function get_daily_state(task,cb){
    var dbname = task.postgresql.detector_display_db
    var host = task.postgresql.host || '127.0.0.1';
    var port = task.postgresql.port || 5432;
    var username = task.postgresql.auth.username
    var password = task.postgresql.auth.password
    var connectionString = "pg://"+username+"@"+host+":"+port+"/"+dbname;
    if(password !== undefined){
        connectionString = "pg://"+username+":"+password+"@"+host+":"+port+"/"+dbname;
    }
    pg.connect(connectionString
               ,component_query(task,cb)
              )
    return null
}


function detector_display_fetch(task,next){
    async.waterfall([function(cb){return cb(null,task)}
                    ,configure
                    ,get_daily_state
                    ,get_components
                    ,sanitize
                    ]
                   ,next
                   )
    return null
}

exports.fetch=detector_display_fetch

// at the end of that routine, task has componens with list of
// components up and down stream, and an element called
// component_details with the properties (including abs_pm) for each
// detector

function sort_by_abspm(task,cb){
    task.component_details = _.chain(task.component_details)
                             .map(function(v,k){
                                 v.detector = k
                                 return v
                             })
                             .sortBy('abs_pm')
                             .value()
    return cb(null,task)
}

exports.sort=sort_by_abspm
