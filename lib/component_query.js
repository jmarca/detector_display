/** componentQuery
*
* generalities:
*
* call this function with a task object.  It will return a handler for
* the pg.connect statement that will query the db, and process the
* results.
*
* What:
*
* the query will basically grab everything from the table
* tempseg2.detector_segment_conditions, which contains components,
* direction, and timestamps.  So it will get all components and
* timestamps with the provided direction and the provided detector in
* the middle of the component.
*
* Why:
*
* The point of this module is to creat a table that can be inspected
* containing every day of data for each detector, with the upstream
* and downstream detectors.
*
* The issue is that some detectors have very long segments, and others
* have bad data.  I need an interface that allows me to inspect
* everything, and flag outliers.  This is the query that populates the
* table of
*
*
*      ...              | ts1 | ts2 | ts3 |   ...
*                       |=======================
* upstream milepost b   |     |     |     |   ...
*                       |------------------------
* upstream milepost a   |     |     |     |   ...
*                       |------------------------
* detector milepost     |     |     |     |   ...
*                       |-----------------------
* downstream milepost a |     |     |     |   ...
*                       |-----------------------
* downstream milepost b |     |     |     |   ...
*                       |-----------------------
*       ...             |     |     |     |   ...
*                       |=======================
*
*
*
*
**/
var _ = require('lodash') // mostly for clone

function component_query(task,next){
    var detector = task.detector_id

    // need to break detector into detector, and direction

    //var query = "select components,date_trunc('day', ts) as date from tempseg2.detector_segment_conditions where components[2]='"+detector+"'"


    var query = "select distinct last_value(components) over (partition by"
                + " date_trunc('day',ts), direction) as components,"
                + " date_trunc('day', ts) as date, direction "
                + "from tempseg2.detector_segment_conditions "
                + "where components[2]='"+detector+"'"

    // also probably need to merge this with a calendar to make sure
    // that I have every day covered, or else just do it in JS in a
    // loop, where I increment by one and create and all that

    if(task.direction !== undefined){
        query += " and direction = lower('"+task.direction+"')"
    }
    query += " group by components,date,direction order by date,direction,components "

    // while testing
    //query += "limit 100"

    console.log(query)
    var features=[]
    var last_row_day
    var prior_row
    return function(err,client,done){
        if(err) {
            console.log(err)
            next(err)
            return done()
        }
        var result = client.query(query)
        result.on('row',function(row){
            // I could slap something here and increment by day until features[-1].day = row.date
            var row_day = new Date(row.date)
            if(!last_row_day){
                last_row_day = row_day
            }else{
                // already set from last iteration
            }
            for(last_row_day.setDate(last_row_day.getDate()+1);
                last_row_day.getTime() < row_day.getTime();
                last_row_day.setDate(last_row_day.getDate()+1)){
                prior_row.date = new Date(last_row_day)
                features.push(_.clone(prior_row))
            }
            // caught up, now push current record
            last_row_day = new Date(row_day)
            prior_row = _.clone(row)
            features.push(row)
            return null
        })
        var error_condition = false
        result.on('error',function(err){
            error_condition = true
            console.log('query error: ')
            console.log(err)
            return next(err)
        })
        result.on('end',function(){
            if(!error_condition){
                task.features = features
                next(null,task)
            }
            done()
            return null
        })
        return null
    }


}

module.exports=component_query