var path = require('path')
var rootdir = path.normalize(__dirname)
var config_okay = require('config_okay')
var config_file = rootdir+'/../'+'config.json'
var _ = require('lodash')
var async = require('async')

    // perhaps wrap this in an if statement.
    // if pg options are set, then don't bother with this
    // or better, we don't need this here, so defer it down to the pg
    // query function


function get_components(task,cb){
    pg_get_components(task,function(e,result){
        // result is an array over time, components
        // each element has keys components,direction,ts,endts
        // middle value of components is always the task.detector
        // first value of components is the upstream
        // last value is the downstream

        // not sure what the array will be converted into.
        // possibly just a string?
        // test and see

        var nearby = {}
        result = _.map(result,function(v){
                     v.upstream = v.components[0]
                     v.downstream = v.components[2]
                     // need pm, etc for upstream, downstream, so collect up
                     nearby[v.upstream]=1
                     nearby[v.downstream]=1
                 });
        // add in this detector
        nearby[task.detector]=1
        task.result = result
        task.nearby = nearby

        return cb(null,task)
    })
    return null
}

function nearby_info(task,cb){
    // ping couchdb, get information for each detector
    cdb_nearby_info(Object.keys(task.nearby),function(e,result){
        // result is object, lookup.  pass in key, get result.
        // unless of course the client already has this information

        // all I really need is the postmile so I can sort all detectors properly

        // ferret out properties
        // copy my couchdb view for this, but...

        var output = {}
        _.each(result,function(row,id){
            var props
            var years = _.filter(Object.keys(row),function(k){
                            return (/^\d{4}$/.test(k))
                        })
            // FIXME whatever the function is really called
            // I made "findOne" up
            _.findOne(years,function(y){
                var props_test row[y]
                var outcome = false
                _.findOne(props_test,function(p){
                    if(p.abs_pm){
                        props[id]=p.abs_pm
                        outcome = true
                    }
                    return outcome
                })
                return outcome
            })

        task.detector_info=result
        return cb(null,task)

    })
    return null
}

function do_it(task,callback){

    async.waterfall([
        ,
        return null
    })
    return null
}

// at the end of that routine, task has an element "result" that
// contains all of the upstream and downstream detectors, plus the
// time stamps.  Does not have the postmile of the upstream,
// downstreams.

//