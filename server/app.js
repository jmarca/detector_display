var detector_display=require('../lib/detector_display')
var _ = require('lodash')
module.exports = data
function data(config) {
    if(config){
        return _handler(config)
    }
    // get config from config_
    throw new Error('need a config object passed in')
}


function _handler(config){
    var wimre = /wim\.(\d{1,3})\.([NSEW])/i;
    var vdsre = /(\d{5,7})/;

    return function(app){
        // add year eventually
        app.get('/detector/:id.:format',function(req,res,next){
            console.log(['handling data query, with ', req.params])
            var c = _.clone(config)
            c.detector_id=req.params.id
            return detector_display.fetch(c,function(e,r){
                       if(e) return next(e)
                       res.json(r)
                       res.end()
                       return null
                   })
        })

        return null

    }
}
