var configure_keys=['couchdb','postgresql'] // going to strip these
module.exports=function(task,cb){
    // strip out all but what I want
    console.log('stripping')
    configure_keys.forEach(function(v){
        delete task[v]
        return null
    })
    cb(null,task)
}
