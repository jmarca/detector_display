var fetch = require('./fetch');
var data_handler = require('barchart');
var dom = require('dom')
function handler(val,chart_class){
    fetch({'detector':val}
         ,function(doc){
              data_handler(doc,chart_class)
          })
}
module.exports = function(formid, inputid, chart_class){
    dom( formid ).on('submit',function( event ){
        event.preventDefault();
        var detector_id = dom( inputid ).val();
        handler(detector_id,chart_class)
        return null;
    })
    return null
}
