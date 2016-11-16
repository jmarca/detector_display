/*global require describe it */

var should = require('should')
var fix_component_names = require('../lib/fix_component_names')

/**
 * some example components
 *
 *  {vdsid_1003210,vdsid_1003310,NULL}          | west
 *  {vdsid_1003410,vdsid_1003510,vdsid_1003610} | south
 *  {vdsid_1003510,vdsid_1003610,wimid_27}      | south
 *  {vdsid_1003610,wimid_27,vdsid_1009310}      | south
 *  {vdsid_1003710,vdsid_1004510,vdsid_1004410} | east
 *  {vdsid_1003810,vdsid_1003910,NULL}          | east
 *  {vdsid_1004010,vdsid_1004110,vdsid_1004210} | north
 *  {vdsid_1004110,vdsid_1004210,vdsid_1004310} | north
 *  {vdsid_1004210,vdsid_1004310,wimid_75}      | north
 *  {vdsid_1004310,wimid_75,vdsid_1011410}      | north
 *  {vdsid_1004410,vdsid_1003810,vdsid_1003910} | east
 *  {vdsid_1004510,vdsid_1004410,vdsid_1003810} | east
 *  {vdsid_1004610,vdsid_1004710,vdsid_1004810} | north
 *  {vdsid_1004710,vdsid_1004810,vdsid_1004910} | north
 *
 */



describe('fix component names',function(){

    it('should fix wim names with a direction',function(done){
        var fixed = fix_component_names('south',['wimid_27'])
        fixed[0].should.eql('wim.27.S')
        return done()
    })
    it('should fix a whole set of components',function(done){
        var fixed = fix_component_names('south',['vdsid_1003510','vdsid_1003610','wimid_27'])
        fixed.should.eql(['1003510','1003610','wim.27.S'])
        return done()
    })
    it('should not choke on a null component',function(done){
        var fixed = fix_component_names('south',[null,'vdsid_1003610',null])
        fixed.should.eql([null,'1003610',null])
        return done()
    })

})
