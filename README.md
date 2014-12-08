# detector display

detector based display

initial need is to display the upstream, downstream and daily status
of each detector, in some sort of grid.

Initially, look at the imputed output, so

~~~

                      |  ts1  | ts2 | ts3 | ...
                      |=========================
upstream milepost b   |       |     |     |   ...
                      |--------------------------
upstream milepost a   |       |     |     |   ...
                      |--------------------------
detector milepost     |       |     |     |   ...
                      |-------------------------
downstream milepost a |       |     |     |   ...
                      |-------------------------
downstream milepost b |       |     |     |   ...
                      |=========================


~~~

# testing and running configuration

to test this stuff, you need to have a file called test.config.json in
the root directory that looks like:

``` json
{
    "postgresql":{
        "auth":{
            "username":"...",
            "password":"..."
        },
        "host":"127.0.0.1",
        "port":5432,
        "detector_display_db":"dbname"
    }
}
```

at the moment, the exact same thing should be in config.json

both of these files need to be chmod 0600 (read/write only by the owner)

# notes and thoughts as I develop this

Use the "milepost" to establish visually the separation of the
segment?  Regardless, order all possible up and downstream mileposts
by abs_pm.

The timestamps ts1, ts2, etc are days.

Hit the table in pg osm2 database for the primary query:

```
osm2=# select * from tempseg2.detector_segment_conditions where components[2]='vdsid_1000210' order by ts limit 10;
                 components                  |         ts          |        endts        |     condition     | direction
---------------------------------------------+---------------------+---------------------+-------------------+-----------
 {vdsid_1000110,vdsid_1000210,vdsid_1000410} | 2007-01-01 00:00:00 | 2007-01-01 01:00:00 | have imputed data | south
 {vdsid_1000110,vdsid_1000210,vdsid_1000410} | 2007-01-01 01:00:00 | 2007-01-01 02:00:00 | have imputed data | south
 {vdsid_1000110,vdsid_1000210,vdsid_1000410} | 2007-01-01 02:00:00 | 2007-01-01 03:00:00 | have imputed data | south
 {vdsid_1000110,vdsid_1000210,vdsid_1000410} | 2007-01-01 03:00:00 | 2007-01-01 04:00:00 | have imputed data | south
 {vdsid_1000110,vdsid_1000210,vdsid_1000410} | 2007-01-01 04:00:00 | 2007-01-01 05:00:00 | have imputed data | south
 {vdsid_1000110,vdsid_1000210,vdsid_1000410} | 2007-01-01 05:00:00 | 2007-01-01 06:00:00 | have imputed data | south
 {vdsid_1000110,vdsid_1000210,vdsid_1000410} | 2007-01-01 06:00:00 | 2007-01-01 09:00:00 | have imputed data | south
 {vdsid_1000110,vdsid_1000210,vdsid_1000410} | 2007-01-01 09:00:00 | 2007-01-01 11:00:00 | have imputed data | south
 {vdsid_1000110,vdsid_1000210,vdsid_1000410} | 2007-01-01 11:00:00 | 2007-01-01 17:00:00 | have imputed data | south
 {vdsid_1000110,vdsid_1000210,vdsid_1000410} | 2007-01-01 17:00:00 | 2007-01-02 09:00:00 | have imputed data | south
(10 rows)
```

Then hit couchdb tracker for things like abspm, location, etc. for
each detector in all of the components.

This query might also help:

```
select distinct(components) from tempseg2.detector_segment_conditions where components[2]='vdsid_1000210';
                 components
---------------------------------------------
 {vdsid_1000110,vdsid_1000210,vdsid_1000410}
 {vdsid_1000110,vdsid_1000210,vdsid_1000310}
```

And thoughts like this

```
osm2=# select components, min(ts), max(ts) from tempseg2.detector_segment_conditions where components[2]='vdsid_1000210' group by components;
                 components                  |         min         |         max
---------------------------------------------+---------------------+---------------------
 {vdsid_1000110,vdsid_1000210,vdsid_1000410} | 2007-01-01 00:00:00 | 2007-02-08 09:00:00
 {vdsid_1000110,vdsid_1000210,vdsid_1000310} | 2007-02-08 10:00:00 | 2009-12-31 13:00:00
(2 rows)
```

# updates

One of the problems with the current UI is that the detectors are only
relevant to the detector that is selected.  So you can't move up and
down the postmiles along the freeway quite the way you think by just
clicking.  It should be nice to see all detectors up and down within
the min max of the postmiles shown on the axis.
