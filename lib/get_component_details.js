/*global console */
/** get_component_details
 *
 * hit couchdb to get component details
 *
 * all the data is in couchdb tracking database
 *
 * docs are by detector id.  For vds, this is just the number.  for
 * wim it is wim_number_direction, as in wim_1_N
 *
 * use the _all_docs "view" to get multiple doc ids at once
 *
 * do not pull down attachments.
 *
 * scan each doc for properties, etc.
 *
 * sort by absolute postmile
 *
 * spit out to client
 *
 */
var _ = require('lodash')
var get_docs = require('couchdb_get_views')

function get_details(task,callback){
    var opts={}
    opts.db=task.couchdb.db
    opts.reduce=false
    opts.include_docs=true
    if(task.components === undefined || task.components.length < 1){
        console.log(_.keys(task))
        console.log(task.components)
        return callback(null,task)
    }
    // make sure that the "detectors" array matches the couchdb
    // database's id requirements
    var patterns= {'wim':/(wim\.\d*\.[NSEW])/
                  ,'vds':/(\d{5,7})/
                  }

    opts.keys = task.components.map(function(v){
                    var result = patterns.wim.exec(v)
                    if(result && result[1]){
                        return result[1]
                    }
                    result=patterns.vds.exec(v)
                    if(result && result[1]){
                        return result[1]
                    }
                    return null
                })


    get_docs(opts,function(e,r){
        if(e) return callback(e,null)
        task.component_details = {}

        r.rows.forEach(function(row){
            var properties
            if(!row.doc){
                throw new Error(row)
            }
            if(row.doc.properties !== undefined){
                properties = check_property(row.doc.properties)
            }else{
                var years = Object.keys(row.doc)
                _.some(years,function(y){
                    properties =  check_property(row.doc[y].properties)
                    if(properties){
                        return true
                    }
                    return false
                })
            }
            task.component_details[row.id] = properties
            return null
        })

        return callback(e,task)
    })
    return null

}

function check_property(ps){
    if(!ps) return false
    var properties
    _.some(ps,function(p){
        if(p.abs_pm !== undefined){
            properties = p
            return true
        }
        return false
    })
    if(properties) return properties
    return null

}

module.exports=get_details;
