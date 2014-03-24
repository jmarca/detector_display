var d3 = require('d3')
var barChart = require('./barchart')
// date looks like "2007-01-04 16:00"
var ts_regex=/(\d*-\d*-\d*)\s(\d*:\d*)/
function parseDate(d) {
    var match = ts_regex.exec(d)
    var canonical_date = [match[1],'T',match[2],':00-0800'].join('')
    return new Date(canonical_date)
}

// Various formatters.
var formatNumber = d3.format(",d"),
    formatChange = d3.format("+,d"),
    formatDate = d3.time.format("%B %d, %Y"),
    formatDOW = //d3.time.format("%a"),
function(d){
    return dow[d]
},
    formatTime = d3.time.format("%I:%M %p");

var formatTOD = function(d){
    if (d===0) return '12:00 AM'
    if (d<12) return d+':00 AM'
    if (d===12) return '12:00 PM'
    return d-12 + ':00 PM'
}

// A nest operator, for grouping hourly data by day
var nestByDate = d3.nest()
                 .key(function(d) { return d3.time.day(d.date); });

function correct_detector_ids(id,direction){
    if(!id){
        return null
    }
    if(!direction){
        throw new Error('direction required')
    }
    var match = /wimid_(\d{1,3})/.exec(id)
    if(match && match [1]){
       return ["wim",match[1],direction].join('.')
    }else{
        // vds case
        match = /(\d{5,7})/.exec(id)
        //console.log(match[0],match[1])
        return match[1]
    }

}
function data(doc){
    // doc has keys
    // [detector_id,direction,features,component_details]
    // features is a list of records, each iwth keys:
    //  [components,date,direction]
    //

    var lookup = {}
    var records = doc.features
    records = doc.features.map(function(v){
                  var record = v
                  record.direction = record.direction.substr(0,1).toUpperCase()
                  record.upstream = correct_detector_ids(record.components[0]
                                                        ,record.direction)
                  record.downstream = correct_detector_ids(record.components[2]
                                                          ,record.direction)
                  record.detector = correct_detector_ids(record.components[1]
                                                        ,record.direction)
                  record.date=new Date(record.date)
                  return record
              })
    var details = {}
    doc.component_details.forEach(function(v){
        details[v.detector]=v
        return null
    })

    var detector_abspm = details[records[0].detector].abs_pm
    var charts = [


        barChart()
        .data(records)
        .key('date')
        .minvalue(function(d){
            if(d.upstream){
                return detector_abspm + (details[d.upstream].abs_pm - detector_abspm)/2
            }
            return detector_abspm-0.25 // cheat back quarter mile
        })
        .maxvalue(function(d){

            if(d.downstream){
                return detector_abspm + (details[d.downstream].abs_pm - detector_abspm)/2
            }
            return detector_abspm+0.25 // cheat forward quarter mile
        })
        .value(function(d){
            return details[d.detector].abs_pm
        })
        //.detectors(details)
        //.round(d3.time.day.round)
        .x(d3.time.scale()
           .rangeRound([0, 10 * 90]))

    ];

    // set up the time and day checkboxes

    // Given our array of charts, which we assume are in the same order as the
    // .chart elements in the DOM, bind the charts to the DOM and render them.
    // We also listen to the chart's brush events to update the display.
    d3.selectAll(".chart").selectAll("svg").remove()
    d3.selectAll(".chart").selectAll("g").remove()
    d3.selectAll(".chart").selectAll(".total > .value").remove()
    var chart = d3.selectAll(".chart")
                .data(charts)
                .each(function(chart) {
                    if(chart.on !== undefined ){
                        chart.on("brush", renderAll).on("brushend", renderAll);
                    };
                })


    renderAll();

    // Renders the specified chart or list.
    function render(method) {
        d3.select(this).call(method);
    }

    // Whenever the brush moves, re-rendering everything.
    function renderAll() {
        chart.each(render);
        //d3.select("#active").text(formatNumber(all.value()));
    }

    window.renderAll = renderAll
  // window.filter = function(filters) {
  //   filters.forEach(function(d, i) { charts[i].filter(d); });
  //   renderAll();
  // };

  window.reset = function(i) {
    charts[i].filter(null);
    renderAll();
  };


    return null
}
module.exports=data
