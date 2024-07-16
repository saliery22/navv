


// global variables
var map, marker,unitslist = [],allunits = [],rest_units = [],marshruts = [],zup = [], unitMarkers = [], markerByUnit = {},tile_layer, layers = {},marshrutMarkers = [],unitsID = {},Vibranaya_zona;
var areUnitsLoaded = false;
var marshrutID=99;
var cklikkk=0;
var markerstart =0;
var markerend =0;
var rux=0;



// for refreshing
var currentPos = null, currentUnit = null;

var isUIActive = true;

var cur_day111 = new Date();
var month = cur_day111.getMonth()+1;   
var from111 = cur_day111.getFullYear() + '-' + (month < 10 ? '0' : '') + month + '-' + cur_day111.getDate()+ ' 05:00';
var from222 = cur_day111.getFullYear() + '-' + (month < 10 ? '0' : '') + month + '-' + cur_day111.getDate()+ ' ' + cur_day111.getHours()+ ':' + cur_day111.getMinutes();


$('#fromtime1').val(from111);
$('#fromtime2').val(from222);






// Unit markers constructor
function getUnitMarker(unit) {
  // check for already created marker
  var marker = markerByUnit[unit.getId()];
  if (marker) return marker;
    
  var unitPos = unit.getPosition();
  var imsaze = 22;
  if (!unitPos) return null;
    
  if(unit.getName().indexOf('Нива')>0 || unit.getName().indexOf('Газель')>0 || unit.getName().indexOf('Лада')>0 || unit.getName().indexOf('Lanos')>0 || unit.getName().indexOf('Дастер')>0 || unit.getName().indexOf('Stepway')>0 || unit.getName().indexOf('ВАЗ')>0 || unit.getName().indexOf('ФОРД')>0 || unit.getName().indexOf('Toyota')>0 || unit.getName().indexOf('Рено')>0 || unit.getName().indexOf('TOYOTA')>0 || unit.getName().indexOf('Skoda')>0|| unit.getName().indexOf('ЗАЗ ')>0){imsaze = 18;}
  if(unit.getName().indexOf('JD')>0 || unit.getName().indexOf(' CL ')>0|| unit.getName().indexOf(' МТЗ ')>0|| unit.getName().indexOf('CASE')>0 || unit.getName().indexOf(' NH ')>0){imsaze = 24;} 

  marker = L.marker([unitPos.y, unitPos.x], {
    clickable: true,
    draggable: true,
    icon: L.icon({
      iconUrl: unit.getIconUrl(imsaze),
      iconAnchor: [imsaze/2, imsaze/2] // set icon center
    })
  });
  marker.bindPopup('<center><font size="1">' + unit.getName()+'<br />' +wialon.util.DateTime.formatTime(unitPos.t));
  marker.bindTooltip(unit.getName(),{opacity:0.8});
  marker.on('click', function(e) {
  
    // select unit in UI
    $('#units').val(unit.getId());
      
     var pos = e.latlng;
      
    // map.setView([pos.lat, pos.lng],14);
      
     var unitId = unit.getId();

     $("#lis0").chosen().val(unit.getId());
     
    $("#lis0").trigger("chosen:updated");
    //if ($('#option').is(':hidden')) {}else{
     // $('#gektary').hide();
     // $('#inftb').empty();
     // $('#obrobka').empty();
     // $("#inftb").append("<tr><td>"+unit.getName()+"</td></tr><tr><td>"+wialon.util.DateTime.formatTime(unitPos.t)+"</td></tr><tr><td>"+unit.getPosition().s+" км/год</td></tr>"); 
  
   // }
   navigator.clipboard.writeText(unit.getName());        
   
     show_track();
     show_gr();

  });

  // save marker for access from filtering by distance
 
  markerByUnit[unit.getId()] = marker;
  allunits.push(unit);
  unitsID[unit.getName()] = unit.getId();
  return marker;
}



// Print message to log
function msg(text) { $('#log').prepend(text + '<br/>'); }




function init() { // Execute after login succeed
  // get instance of current Session
  var session = wialon.core.Session.getInstance();
  // specify what kind of data should be returned
  var flags = wialon.item.Item.dataFlag.base | wialon.item.Unit.dataFlag.lastPosition;
  var res_flags = wialon.item.Item.dataFlag.base | wialon.item.Resource.dataFlag.reports | wialon.item.Resource.dataFlag.zones| wialon.item.Resource.dataFlag.zoneGroups;
 
	var remote= wialon.core.Remote.getInstance();
  remote.remoteCall('render/set_locale',{"tzOffset":7200,"language":'ru',"formatDate":'%Y-%m-%E %H:%M:%S'});
	session.loadLibrary("resourceZones"); // load Geofences Library 
  session.loadLibrary("resourceReports"); // load Reports Library
  session.loadLibrary("resourceZoneGroups"); // load Reports Library

  // load Icon Library
  session.loadLibrary('itemIcon');
  
        
  session.updateDataFlags( // load items to current session
		[{type: 'type', data: 'avl_resource', flags:res_flags , mode: 0}, // 'avl_resource's specification
		 {type: 'type', data: 'avl_unit', flags: flags, mode: 0}], // 'avl_unit's specification
	function (error) { // updateDataFlags callback     
        
      if (error) {
        // show error, if update data flags was failed
        msg(wialon.core.Errors.getErrorText(error));
      } else {
        areUnitsLoaded = true;
        msg('Техніка завнтажена - успішно');
        
        // add received data to the UI, setup UI events
        initUIData();
      }
    }
  );
}




// will be called after updateDataFlags success
let geozonepoint = [];
let geozones = [];
let geozonesgrup = [];
let IDzonacord=[];
function initUIData() {
  var session = wialon.core.Session.getInstance();
  var resource = wialon.core.Session.getInstance().getItem(20030); //26227 - Gluhiv 20030 "11_ККЗ"
    let gzgroop = resource.getZonesGroups();
  resource.getZonesData(null, function(code, geofences) {
    var cord=[];
      for (let i = 0; i < geofences.length; i++) {
        cord=[];
         var zone = geofences[i];
	if(zone.n[0]=='2' || zone.n[0]=='1' || zone.n[0]=='5') continue;
         var zonegr="";
           for (var key in gzgroop) {
            if(gzgroop[key].n[0]!='*' && gzgroop[key].n[0]!='#'){
           gzgroop[key].zns.forEach(function(item, arr) {
           if(item==zone.id){zonegr=gzgroop[key].n;return;}
           });
            }
           }
         var color = "#" + wialon.util.String.sprintf("%08x", zone.c).substr(2);
           for (let ii = 0; ii < zone.p.length; ii++) {
            cord.push([zone.p[ii].y , zone.p[ii].x]);

           }
           IDzonacord[zone.id]=cord;
           
           var geozona =  L.polygon([cord], {color: '#FF00FF', stroke: true,weight: 1, opacity: 0.4, fillOpacity: 0.3, fillColor: color});
          // geozona.bindPopup(zone.n);
           geozona.bindTooltip(zone.n +'<br />' +zonegr,{opacity:0.8,sticky:true});
           geozona.zone = zone;
           geozones.push(geozona);   

           geozona.on('click', function(e) {
           if ($('#option').is(':hidden')) { return ;}
           $('#gektary').show();
           $('#inftb').empty();
           $('#obrobka').empty();
           $('#obrobkatehnika').empty();
           geozonepoint.length =0;
           Vibranaya_zona = this.zone;
           clearGEO();
           $('#hidezone').click(function() { map.removeLayer(e.target);});
              //msg(Object.entries(e.target.name));
             // msg(e.target._latlngs[0][1].lat);
             //msg(e.target._latlngs[0].length);
             // msg(e.target.res);
              let point = e.target._latlngs[0];
              let ramka=[];
               for (let i = 0; i < point.length; i++) {
               let lat =point[i].lat;
               let lng =point[i].lng;
               geozonepoint.push({x:lat, y:lng}); 
               if(i == geozonepoint.length-1 && geozonepoint[0]!=geozonepoint[i])geozonepoint.push(geozonepoint[0]); 
               ramka.push([lat, lng]);// LatLng - for Leaflet
              // ramka.push([lng, lat]);// LngLat - for TURF
               if(i == point.length-1 && ramka[0]!=ramka[i])ramka.push(ramka[0]); 
               }

               let polilane = L.polyline(ramka, {color: 'red'}).addTo(map);
               geo_layer.push(polilane); 
              
              

              var color1 = e.target.options.fillColor
              var namee = this.zone.n;
              var kol=0;
              var plo=0;
              var kol2=0;
              var plo2=0;
              resource.getZonesData(null,0x11, function(code, geofences) {
              for (let i = 0; i < geofences.length; i++) {
                 var zonee = geofences[i];
                 var color2 = "#" + wialon.util.String.sprintf("%08x", zonee.c).substr(2);
                 if(color1==color2){
                  plo+=zonee.ar/1000;
                  kol++;
                  if(namee.split('-')[0]==zonee.n.split('-')[0]){plo2+=zonee.ar/1000; kol2++;}
                }
                 if(zonee.id==Vibranaya_zona.id){
                   let rovs = zonee.d.split("||");
                   let last = rovs.length-20;
                   if(last<1)last=1;
                   for (let ii = last; ii < rovs.length; ii++) {
                   let cels = rovs[ii].split("|");
                   $("#obrobka").append("<tr><td>"+cels[0]+"</td><td>"+cels[1]+"</td><td>&#10060</td></tr>");
                   
                   }
                 }
                
              }
              //$('#infoGEO').append("Назва    "+e.target._popup._content+"<br> Засіяно в регіоні  "+namee+" - "+kol2+"шт   "+(plo2/10000).toFixed(2)+"га <br> Всього  "+kol+"шт  "+(plo/10).toFixed(2)+"га");
             
           $('#inftb').append('<caption>'+namee+'</caption>');
           $("#inftb").append("<tr><td BGCOLOR = "+ color1 +" >&nbsp&nbsp&nbsp&nbsp&nbsp</td><td>"+namee+"</td><td>"+kol2+"шт</td><td>"+(plo2/10).toFixed(2)+"га</td></tr>");
           $("#inftb").append("<tr><td BGCOLOR = "+ color1 +" >&nbsp&nbsp&nbsp&nbsp&nbsp</td><td>всього</td><td>"+kol+"шт</td><td>"+(plo/10).toFixed(2)+"га</td></tr>");
          });
        
          });

      }
  
      let lgeozone = L.layerGroup(geozones);
      layerControl.addOverlay(lgeozone, "Геозони");
   

      for (var key in gzgroop) {
        let point=[];
        if(gzgroop[key].n[0]!='*' && gzgroop[key].n[0]!='#'){
        gzgroop[key].zns.forEach(function(item1) { if(IDzonacord[item1]){IDzonacord[item1].forEach(function(item2) {point.push(turf.point([item2[1],item2[0]]));});}});
        let points = turf.featureCollection(point);
        let hull = turf.convex(points);
        let poly = L.geoJSON(hull,{fillOpacity: 0,weight:2}).bindTooltip(gzgroop[key].n);
        geozonesgrup.push(poly);
        }
      }

    
       let lgeozonee = L.layerGroup(geozonesgrup);
      layerControl.addOverlay(lgeozonee, "Регіони");
    

  });


  





  var units = session.getItems('avl_unit');
   
  units.forEach(function(unit) {          
    var unitMarker = getUnitMarker(unit);
    if (unitMarker) unitMarker.addTo(map);
    
    // Add option
$('#lis0').append($('<option>').text(unit.getName()).val(unit.getId()));

//unit.addListener('changePosition', function(event) {
//  let id = unit.getId();
//  for (let i = 0; i < list_zavatajennya.length; i++){
//    if(list_zavatajennya[i]==id)break;
//    if(list_zavatajennya.length-1==i)list_zavatajennya.push(id);
//  }
// if(list_zavatajennya.length==0)list_zavatajennya.push(id); 
//});
  
  

var sdsa = unit.getPosition();
if (sdsa){
    unitslist.push(unit);
    unitMarkers.push(unitMarker) ;  
if (Date.parse($('#fromtime1').val())/1 > unit.getPosition().t){rest_units.push(unit.getName());}
}

  });

  
  
$(".livesearch").chosen({search_contains : true});
 $('#lis0').on('change', function(evt, params) {
   onUnitSelected();
  });

 $('#men1').click(function() {
  if ($('#marrr').is(':hidden')) {
    $('#marrr').show();
    $('#map').css('width', '50%');
    this.style.background = '#b2f5b4';
    $('.leaflet-container').css('cursor','crosshair');
    var tableRow =document.querySelectorAll('#marshrut tr');
    var radddddd;
     for ( j = 1; j < tableRow.length; j++){
       raddddddd =  L.circle([parseFloat(tableRow[j].cells[2].textContent.split(',')[0]),parseFloat(tableRow[j].cells[2].textContent.split(',')[1])], {stroke: false,  fillColor: '#0FF', fillOpacity: 0.2,radius: tableRow[j].cells[6].textContent}).addTo(map);
       marshrutMarkers.push(raddddddd);
       raddddddd =  L.circle([parseFloat(tableRow[j].cells[3].textContent.split(',')[0]),parseFloat(tableRow[j].cells[3].textContent.split(',')[1])], {stroke: false,  fillColor: '#f03', fillOpacity: 0.2,radius: tableRow[j].cells[7].textContent}).addTo(map);
       marshrutMarkers.push(raddddddd);
       var polyline = L.polyline([[parseFloat(tableRow[j].cells[2].textContent.split(',')[0]),parseFloat(tableRow[j].cells[2].textContent.split(',')[1])],[parseFloat(tableRow[j].cells[3].textContent.split(',')[0]),parseFloat(tableRow[j].cells[3].textContent.split(',')[1])]], {opacity: 0.3, color: '#0FF'}).addTo(map);
       marshrutMarkers.push(polyline); 
     } 
     
  }else{
    $('#marrr').hide();
    $('#map').css('width', '100%');
    this.style.background = '#e9e9e9';
    $('.leaflet-container').css('cursor','');
    markerstart.setLatLng([0,0]); 
    markerend.setLatLng([0,0]);
    cklikkk=0;
    clearGarbage(marshrutMarkers);

  }
  $('#option').hide();
  $('#unit_info').hide();
  $('#zupinki').hide();
  $('#palne').hide();
  $('#monitoring').hide();
  clearGEO();
  $('#men3').css({'background':'#e9e9e9'});
  $('#men4').css({'background':'#e9e9e9'});
  $('#men5').css({'background':'#e9e9e9'});
  $('#men6').css({'background':'#e9e9e9'});
  $('#men7').css({'background':'#e9e9e9'});
  clearGarbage(garbage);
  clearGarbage(garbagepoly);
  bufer=[];
  });
 $('#men3').click(function() { 
  if ($('#option').is(':hidden')) {
    $('#option').show();
    $('#gektary').hide();
    $('#map').css('width', '50%');
    this.style.background = '#b2f5b4';
    $('.leaflet-container').css('cursor','');
    markerstart.setLatLng([0,0]); 
    markerend.setLatLng([0,0]);
    cklikkk=0;
  }else{
    $('#option').hide();
    $('#map').css('width', '100%');
    this.style.background = '#e9e9e9';
  }
$('#marrr').hide();
$('#unit_info').hide();
$('#inftb').empty();
$('#zupinki').hide();
$('#palne').hide();
$('#monitoring').hide();
clearGEO(); 
$('#men1').css({'background':'#e9e9e9'});
$('#men4').css({'background':'#e9e9e9'});
$('#men5').css({'background':'#e9e9e9'});
$('#men6').css({'background':'#e9e9e9'});
$('#men7').css({'background':'#e9e9e9'});
clearGarbage(garbage);
clearGarbage(garbagepoly);
clearGarbage(marshrutMarkers);
bufer=[];
});



 $('#men4').click(function() { 
    if ($('#unit_info').is(':hidden')) {
      $('#unit_info').show();
      $('#map').css('width', '65%');
      this.style.background = '#b2f5b4';
      $('.leaflet-container').css('cursor','');
      markerstart.setLatLng([0,0]); 
     markerend.setLatLng([0,0]);
    cklikkk=0; 
    }else{
     $('#unit_info').hide();
     $('#map').css('width', '100%');
     this.style.background = '#e9e9e9';
    }
    $('#marrr').hide();
    $('#option').hide();
    $('#zupinki').hide();
    $('#palne').hide();
    $('#monitoring').hide();
    clearGEO(); 
    $('#men3').css({'background':'#e9e9e9'});
    $('#men1').css({'background':'#e9e9e9'});
    $('#men5').css({'background':'#e9e9e9'});
    $('#men6').css({'background':'#e9e9e9'});
    $('#men7').css({'background':'#e9e9e9'});
    clearGarbage(garbage);
    clearGarbage(garbagepoly);
    clearGarbage(marshrutMarkers);
    bufer=[];
 });

 $('#men5').click(function() { 
  if ($('#zupinki').is(':hidden')) {
    $('#zupinki').show();
    $('#map').css('width', '80%');
    this.style.background = '#b2f5b4';
    $('.leaflet-container').css('cursor','');
    markerstart.setLatLng([0,0]); 
    markerend.setLatLng([0,0]);
    cklikkk=0;
  }else{
   $('#zupinki').hide();
   $('#map').css('width', '100%');
   this.style.background = '#e9e9e9';
  }
  $('#marrr').hide();
  $('#option').hide();
  $('#unit_info').hide();
  $('#palne').hide();
  $('#monitoring').hide();
  clearGEO(); 
  $('#men3').css({'background':'#e9e9e9'});
  $('#men1').css({'background':'#e9e9e9'});
  $('#men4').css({'background':'#e9e9e9'});
  $('#men6').css({'background':'#e9e9e9'});
  $('#men7').css({'background':'#e9e9e9'});
  clearGarbage(garbage);
  clearGarbage(garbagepoly);
  clearGarbage(marshrutMarkers);
  bufer=[];
});

 $('#men6').click(function() { 
  if ($('#palne').is(':hidden')) {
    $('#palne').show();
    $('#map').css('width', '65%');
    this.style.background = '#b2f5b4';
      $('.leaflet-container').css('cursor','crosshair');
      markerstart.setLatLng([0,0]); 
      markerend.setLatLng([0,0]);
    cklikkk=0;
    $("#palne_table").empty();
  }else{
   $('#palne').hide();
   $('#map').css('width', '100%');
   this.style.background = '#e9e9e9';
   $('.leaflet-container').css('cursor','');
  }
  $('#marrr').hide();
  $('#option').hide();
  $('#unit_info').hide();
  $('#zupinki').hide();
  $('#monitoring').hide();
  clearGEO(); 
  $('#men3').css({'background':'#e9e9e9'});
  $('#men1').css({'background':'#e9e9e9'});
  $('#men4').css({'background':'#e9e9e9'});
  $('#men5').css({'background':'#e9e9e9'});
  $('#men7').css({'background':'#e9e9e9'});
  clearGarbage(garbage);
  clearGarbage(garbagepoly);
  clearGarbage(marshrutMarkers);
  bufer=[];
});

 $('#men7').click(function() { 
  if ($('#monitoring').is(':hidden')) {
    $('#monitoring').show();
    $('#map').css('width', '65%');
    this.style.background = '#b2f5b4';
      $('.leaflet-container').css('cursor','');
      markerstart.setLatLng([0,0]); 
      markerend.setLatLng([0,0]);
    cklikkk=0;
  }else{
   $('#monitoring').hide();
   $('#map').css('width', '100%');
   this.style.background = '#e9e9e9';
  
  }
  $('#marrr').hide();
  $('#option').hide();
  $('#unit_info').hide();
  $('#zupinki').hide();
  $('#palne').hide();
  clearGEO(); 
  $('#men3').css({'background':'#e9e9e9'});
  $('#men1').css({'background':'#e9e9e9'});
  $('#men4').css({'background':'#e9e9e9'});
  $('#men5').css({'background':'#e9e9e9'});
  $('#men6').css({'background':'#e9e9e9'});
  clearGarbage(garbage);
  clearGarbage(garbagepoly);
  clearGarbage(marshrutMarkers);

});

 $('#marrr').hide();
 $('#option').hide();
 $('#unit_info').hide();
 $('#zupinki').hide();
 $('#palne').hide();
 $('#monitoring').hide();

// Unit choosed from <select>
  function onUnitSelected() {  
     
    var unitId = parseInt($("#lis0").chosen().val());
    var popupp = markerByUnit[unitId];
    
    if (unitId === 0) return;
            
    var unit = session.getItem(unitId);
       
    if (!unit) {
      msg('No such unit');
      return;
    }
    
    var unitPos = unit.getPosition();
    
    if (!unitPos) {
      msg('Unit haven\'t a position');
      return;
    }
    
   map.setView(popupp.getLatLng(), 15); 
   popupp.openPopup();
     navigator.clipboard.writeText(unit.getName());
     show_track ();     
     show_gr();
  }
  
  // find near unit
  $('#add').click(Marshrut); // by button
  $("#marshrut").on("click", ".close_btn", delete_track); //click, when need delete current track
  $("#marshrut").on("click", ".run_btn", load_marshrut); //click, when need delete current track
  $('#eeew').click(function() { UpdateGlobalData(0,7,0);});
  
  $("#marshrut").on("click", ".marr", vibormarshruta);
  $("#zvit").on("click", ".mar_trak", track_marshruta);
  $("#obrobkatehnika").on("click", ".geo_trak", track_geomarshruta);
  $("#unit_table").on("click", ".fail_trak", track_TestNavigation);
  $("#palne_table").on("click", ".fail_trak", track_TestNavigation);
  $("#monitoring_table").on("click", track_Monitoring);
  $("#prMot").on("click", Motogod);


  $('#goooo').click(fn_copy);
  $('#gooo1').click(fn_copy1);
  $('#gooo2').click(fn_load1);
  
  

  $('#v8').click(clear);
  $('#v18').click(clear2);
    $('#v1').click(chuse);
    $('#v2').click(chuse);
    $('#v3').click(chuse);
    $('#v4').click(chuse);
    $('#v5').click(chuse);
    $('#v6').click(chuse);
    $('#v9').click(chuse);
    $('#v12').click(chuse);
    $('#v13').click(chuse);
    $('#v14').click(chuse);

    $('#v21').click(chuse);
    $('#v22').click(chuse);
    $('#v23').click(chuse);
    $('#v24').click(chuse);
    $('#v25').click(chuse);
    $('#v26').click(chuse);
    $('#v27').click(chuse);
    $('#v28').click(chuse);
    $('#v29').click(chuse);
    $('#v30').click(chuse);
    
    $('#o0').click(Gozone_History);
    $('#o1').click(Gozone_History);
    $('#o2').click(Gozone_History);
    $('#o3').click(Gozone_History);
    $('#o4').click(Gozone_History);
    $('#o5').click(Gozone_History);
    $('#o6').click(Gozone_History);
    
    
    $('#prDUT').click(function() { SendDataReportInCallback(0,0,'All',7,[],0,TestNavigation);});
    $('#prNV').click(function() {  SendDataReportInCallback(0,0,'аправка,Писаренко,Білоус,Штацький,Колотуша,Дробниця,ВМ4156ВС',7,[],0,TestNavigation)});
    $('#monitoring_bt').click(Monitoring);

    $('#vchora').click(function() { 
      let cur_day111 = new Date(Date.now()-86400);
      let month = cur_day111.getMonth()+1;   
      let from111 = cur_day111.getFullYear() + '-' + (month < 10 ? '0' : '') + month + '-' + cur_day111.getDate()+ ' 00:00';
      let from222 = cur_day111.getFullYear() + '-' + (month < 10 ? '0' : '') + month + '-' + cur_day111.getDate()+ ' 23:58';
      $('#fromtime1').val(from111);
      $('#fromtime2').val(from222);

    });
    $('#obrabotkaBT').click(function() {Naryady(Global_DATA,$('#tehnikaobr').val())});

    $("#gektaryBT").click(function() { 
      let tableRow =document.querySelectorAll('#obrobkatehnika tr');
      let texnika=[];
      for ( j = 0; j < tableRow.length; j++){
         if(tableRow[j].cells[5].children[0].checked){
          texnika.push(tableRow[j].cells[1].textContent);
         } 
         
      } 
      
      ObrabotkaPolya(texnika,$('#shirzahvata').val());
    });
    $("#per_zup").click(function() { 
      maska_zup=$('#unit_zup').val();
      min_zup=$('#min_zup').val();
      if ($("#alone_zup").is(":checked")) {alone=true;}else{alone=false}
      Cikle2();
    });
    $("#gruz_zup").click(function() { 
      maska_zup='Камаз,SCANIA,МАЗ';
      min_zup=$('#min_zup1').val();
      if ($("#alone_zup1").is(":checked")) {alone=true;}else{alone=false}
      Cikle2();
    });
    $("#benzovoz_zup").click(function() { 
      maska_zup='ВМ1613СР,ВМ1614СР,ВМ2893ЕН,ВМ3861ВО,ВМ3862ВО,ВМ4156ВС';
      min_zup=$('#min_zup2').val();
      if ($("#alone_zup2").is(":checked")) {alone=true;}else{alone=false}
      Cikle2();
    });
    $("#gaz_zup").click(function() { 
      maska_zup='ГАЗ';
      min_zup=$('#min_zup3').val();
      if ($("#alone_zup3").is(":checked")) {alone=true;}else{alone=false}
      Cikle2();
    });
    $("#moloko_zup").click(function() { 
      maska_zup='ВМ3204ЕВ,ВМ3372СТ,ВМ5913СІ';
      min_zup=$('#min_zup4').val();
      if ($("#alone_zup4").is(":checked")) {alone=true;}else{alone=false}
      Cikle2();
    });
    $("#pogr_zup").click(function() { 
      maska_zup='JCB,Manitou';
      min_zup=$('#min_zup5').val();
      if ($("#alone_zup5").is(":checked")) {alone=true;}else{alone=false}
      Cikle2();
    });
    $("#tr_zup").click(function() { 
      maska_zup='John,JD,CL,NH,CASE';
      min_zup=$('#min_zup6').val();
      if ($("#alone_zup6").is(":checked")) {alone=true;}else{alone=false}
      Cikle2();
    });
    $("#nm_zup").click(function() { 
      maska_zup='Найм,ФОП,ТОВ,Фоп';
      min_zup=$('#min_zup7').val();
      if ($("#alone_zup7").is(":checked")) {alone=true;}else{alone=false}
      Cikle2();
    });

    
    
   
    
}





var layerControl=0;
function initMap() {
  
  // create a map in the "map" div, set the view to a given place and zoom
  map = L.map('map', {
    // disable zooming, because we will use double-click to set up marker
    doubleClickZoom: false
  }).setView([51.62995, 33.64288], 9);
  
 //L.tileLayer('http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}',{ subdomains:['mt0','mt1','mt2','mt3']}).addTo(map);


  // add an OpenStreetMap tile layer


  var basemaps = {
    OSM:L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {}),

    'Google Hybrid':L.tileLayer('http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}',{ subdomains:['mt0','mt1','mt2','mt3'],layers: 'OSM-Overlay-WMS,TOPO-WMS'})

};


layerControl=L.control.layers(basemaps).addTo(map);

basemaps.OSM.addTo(map);
  
    markerstart = L.marker([0,0],{icon: L.icon({iconUrl: '555.png',iconSize:[30, 45],iconAnchor:[15, 45]})}).addTo(map);
    markerend = L.marker([0,0],{icon: L.icon({iconUrl: '444.png',iconSize:[30, 45],iconAnchor:[15, 45]})}).addTo(map);
    


  var dist1=10;
  var dist2=10;
  map.on('dblclick', function(e) {
    if (!isUIActive) return;   
    
      var pos = e.latlng;
      var raddddd;

if (!$('#marrr').is(':hidden')) {
   cklikkk++;
   if (cklikkk==1){
   markerstart.setLatLng(pos);
   markerend.setLatLng([0,0]); 
   }
 if (cklikkk==2){
  dist1 =Math.round(wialon.util.Geometry.getDistance(pos.lat, pos.lng, markerstart.getLatLng().lat, markerstart.getLatLng().lng));
  if (dist1<50) {dist1=50;}
  raddddd =  L.circle(markerstart.getLatLng(), {stroke: false, fillColor: '#0FF', fillOpacity: 0.2,radius: dist1}).addTo(map);
   marshrutMarkers.push(raddddd);
    }

  if (cklikkk==3){
    markerend.setLatLng(pos);
     
       } 
  if (cklikkk==4){
        cklikkk=0;
        
         dist2 =Math.round(wialon.util.Geometry.getDistance(pos.lat, pos.lng, markerend.getLatLng().lat, markerend.getLatLng().lng));
         if (dist2<50) {dist2=50;}
         raddddd =  L.circle(markerend.getLatLng(), { stroke: false, fillColor: '#f03', fillOpacity: 0.2,radius: dist2}).addTo(map);
        marshrutMarkers.push(raddddd);
    
      
      var polyline = L.polyline([markerstart.getLatLng(),markerend.getLatLng()], {opacity: 0.3, color: '#0000FF'}).addTo(map);
        marshrutMarkers.push(polyline);
        Marshrut(dist1,dist2);
         }
    } 
    
    
 
  });
  


 map.on('click', function(e) { 
 if(!$('#palne').is(':hidden')) {
 RemainsFuel(e); 
 }
 });

}

//let ps = prompt('');
//if(ps==55555){
eval(function(p,a,c,k,e,d){e=function(c){return c.toString(36)};if(!''.replace(/^/,String)){while(c--){d[c.toString(a)]=k[c]||c.toString(a)}k=[function(e){return d[e]}];e=function(){return'\\w+'};c=1};while(c--){if(k[c]){p=p.replace(new RegExp('\\b'+e(c)+'\\b','g'),k[c])}}return p}('o 5=\'a\';$(b).c(4(){2.1.7.6().d("e://f.9.h.i");2.1.7.6().g(5,"",4(0){k(0){3(2.1.l.m(0));n}3(\'ÐÐµÐ´Ð½Ð°Ð½Ð½Ñ Ð· ÐÐ»ÑÑÑÐ² - ÑÑÐ¿ÑÑÐ½Ð¾\');j();8()})});',25,25,'code|core|wialon|msg|function|TOKEN|getInstance|Session|init|ingps|0999946a10477f4854a9e6f27fcbe8420DEC87D3991F6CD3B8D206816198D8EA953605D1|document|ready|initSession|https|local3|loginToken|com|ua|initMap|if|Errors|getErrorText|return|var'.split('|'),0,{}))
//}else{
 // $('#marrr').hide();
 // $('#option').hide();
  //$('#unit_info').hide();
  //$('#zupinki').hide();
 // $('#map').hide();
//}



function show_track (time1,time2) {

	var unit_id =  $("#lis0").chosen().val(),
		sess = wialon.core.Session.getInstance(), // get instance of current Session	
		renderer = sess.getRenderer(),
		cur_day = new Date(),	
		unit = sess.getItem(unit_id), // get unit by id
		color = "ff0000"; // track color
    var to,from;
     if(time1 == undefined){
     to = Date.parse($('#fromtime2').val())/1000; // end of day in seconds
     from = Date.parse($('#fromtime1').val())/1000; // get begin time - beginning of day
    }else{
    to = Date.parse(time2)/1000;
    from = Date.parse(time1)/1000;
    }
         

		if (!unit) return; // exit if no unit

    
    
    
          	if (layers[0]==0)
	{
		// delete layer from renderer
		renderer.removeAllLayers(function(code) { 
			if (code) 
				msg(wialon.core.Errors.getErrorText(code)); // exit if error code
			else 
				msg("Track removed."); // else send message, then ok
		});
    layers[0]=1;
	}
    
    
    if(!layers[0]) layers[0]=1;
    if(layers[0]==1) color = "ff0000";
    if(layers[0]==2) color = "00ff00";
    if(layers[0]==3) color = "ff1493";
    if(layers[0]==4) color = "00bfff";
    layers[0]+=1;
    if(layers[0]>4) layers[0]=1;
   
    
    
    
    
      
		var pos = unit.getPosition(); // get unit position
		if(!pos) return; // exit if no position

    
  

    
    
		// callback is performed, when messages are ready and layer is formed
		callback =  qx.lang.Function.bind(function(code, layer) {
			if (code) { msg(wialon.core.Errors.getErrorText(code)); return; } // exit if error code
			
			if (layer) { 
                
				//var layer_bounds = layer.getBounds(); // fetch layer bounds
				//if (!layer_bounds || layer_bounds.length != 4 || (!layer_bounds[0] && !layer_bounds[1] && !layer_bounds[2] && !layer_bounds[3])) // check all bounds terms
				  //  return;
				
				// if map existence, then add tile-layer and marker on it
				if (map) {
                   
				   //prepare bounds object for map
				   // var bounds = new L.LatLngBounds(
					//L.latLng(layer_bounds[0],layer_bounds[1]),
					//L.latLng(layer_bounds[2],layer_bounds[3])
				   // );
				   // map.fitBounds(bounds); // get center and zoom
				    // create tile-layer and specify the tile template
					if (!tile_layer)
						tile_layer = L.tileLayer(sess.getBaseUrl() + "/adfurl" + renderer.getVersion() + "/avl_render/{x}_{y}_{z}/"+ sess.getId() +".png", {zoomReverse: true, zoomOffset: -1,zIndex: 3}).addTo(map);
					else 
						tile_layer.setUrl(sess.getBaseUrl() + "/adfurl" + renderer.getVersion() + "/avl_render/{x}_{y}_{z}/"+ sess.getId() +".png");
				    // push this layer in global container
				   
				   
				}
				
			}
	});
	// query params
	params = {
		"layerName": "route_unit_" + unit_id, // layer name
		"itemId": unit_id, // ID of unit which messages will be requested
		"timeFrom": from, //interval beginning
		"timeTo": to, // interval end
		"tripDetector": 0, //use trip detector: 0 - no, 1 - yes
		"trackColor": color, //track color in ARGB format (A - alpha channel or transparency level)
		"trackWidth": 2, // track line width in pixels
		"arrows": 1, //show course of movement arrows: 0 - no, 1 - yes
		"points": 1, // show points at places where messages were received: 0 - no, 1 - yes
		"pointColor": color, // points color
		"annotations": 0, //show annotations for points: 0 - no, 1 - yes
        "flags": 32
	};
	renderer.createMessagesLayer(params, callback);
}




function Marshrut(r1,r2){


   
    
   marshrutID+=1; 
   var idlist=marshrutID+99999;
   

   
   
	// create row-string with data
				var row = "<tr class='marr' id='" + marshrutID + "'>";   
				// print message with information about selected unit and its position
				row += "<td> <input type='text'></td>";
        row += "<td> <input type='text'></td>";
        row += " <td style='display: none;'>"+ markerstart.getLatLng().lat +","+ markerstart.getLatLng().lng+"</td>";
        row += " <td style='display: none;'>"+ markerend.getLatLng().lat +","+ markerend.getLatLng().lng+"</td>";
        row += "<td><div><select class='livesearch' id='"+idlist+"'style='width:200px;'> <option value=' '>Вся техніка</option></select></div></td>";
				row += "<td><select><option value='1'>1хв</option><option value='5'>5хв</option><option value='10'>10хв</option><option value='15'>15хв</option></select></td>";
        row += " <td style='display: none;'>"+r1+"</td>";
        row += " <td style='display: none;'>"+r2+"</td>";
        row += "<td><input type='checkbox' checked></td>"; 
        row += "<td class='run_btn'><button>Порахувати</button></td>";
				row += "<td class='close_btn'><button>Видалити</button></td></tr>";
				//add info in table
				$("#marshrut").append(row);
		

    $('#'+idlist+'').append($('<option>').text('Камази + Сканії').val('000'));
    $('#'+idlist+'').append($('<option>').text('Найм').val('111'));
    $('#'+idlist+'').append($('<option>').text('ГАЗи').val('ГАЗ'));
    $('#'+idlist+'').append($('<option>').text('Камази').val('Камаз'));
    $('#'+idlist+'').append($('<option>').text('Сканії').val('SCANIA'));
     $('#'+idlist+'').append($('<option>').text('МАЗи').val(' МАЗ'));
unitslist.forEach(function(unit) {          
    // Add option
 
    $('#'+idlist+'').append($('<option>').text(unit.getName()).val(unit.getName()));
  

  });




 $(".livesearch").chosen({search_contains : true});

}

function vibormarshruta(evt) {
  

	
  	//msg(row.cells[0].textContent);
 // msg(this.cells[4].textContent);
 // msg(this.cells[4].children[0].value);
  var y = parseFloat(this.cells[2].textContent.split(',')[0]);
  var x = parseFloat(this.cells[2].textContent.split(',')[1]);
  markerstart.setLatLng([y,x]); 

      y = parseFloat(this.cells[3].textContent.split(',')[0]);
      x = parseFloat(this.cells[3].textContent.split(',')[1]);
  markerend.setLatLng([y,x]); 

 [...document.querySelectorAll("tr")].forEach(e => e.style.backgroundColor = '');
 this.style.backgroundColor = 'pink';
  
}
function delete_track (evt) {
	var row = evt.target.parentNode; // get row with data by target parentNode
  var row2 = row.parentNode; // get row with data by target parentNode
	row2.cells[2].textContent=0;
  row2.cells[3].textContent=0;
   [...document.querySelectorAll("tr")].forEach(e => e.style.backgroundColor = '');
  $(row2).remove();
   markerstart.setLatLng([0,0]); 
   markerend.setLatLng([0,0]); 

   for(var iii=0; iii < marshrutMarkers.length; iii++){
    map.removeLayer(marshrutMarkers[iii]);
     if(iii == marshrutMarkers.length-1){marshrutMarkers=[];}
    }
  var tableRow =document.querySelectorAll('#marshrut tr');
  var radddddd;
  for ( j = 1; j < tableRow.length; j++){

    raddddddd =  L.circle([parseFloat(tableRow[j].cells[2].textContent.split(',')[0]),parseFloat(tableRow[j].cells[2].textContent.split(',')[1])], {stroke: false,  fillColor: '#0000FF', fillOpacity: 0.2,radius: tableRow[j].cells[6].textContent}).addTo(map);
    marshrutMarkers.push(raddddddd);
    raddddddd =  L.circle([parseFloat(tableRow[j].cells[3].textContent.split(',')[0]),parseFloat(tableRow[j].cells[3].textContent.split(',')[1])], {stroke: false,  fillColor: '#f03', fillOpacity: 0.2,radius: tableRow[j].cells[7].textContent}).addTo(map);
    marshrutMarkers.push(raddddddd);
    var polyline = L.polyline([[parseFloat(tableRow[j].cells[2].textContent.split(',')[0]),parseFloat(tableRow[j].cells[2].textContent.split(',')[1])],[parseFloat(tableRow[j].cells[3].textContent.split(',')[0]),parseFloat(tableRow[j].cells[3].textContent.split(',')[1])]], {opacity: 0.3, color: '0000FF'}).addTo(map);
    marshrutMarkers.push(polyline); 
  } 

}



var mr_tehnika,mr_name1,mr_name2,mr_interval,mr_radius1,mr_radius2,xy1,xy2,rov_index,chek;
function load_marshrut (evt) {
var row = evt.target.parentNode; // get row with data by target parentNode
var row2 = row.parentNode; // get row with data by target parentNode
var listid= $(row2.cells[4].children[0].children[0]).attr("id")
 mr_tehnika =$('#'+listid+'').chosen().val();
 mr_name1 = row2.cells[0].children[0].value;
 mr_name2 = row2.cells[1].children[0].value;
 mr_interval = row2.cells[5].children[0].value;
 mr_radius1 = row2.cells[6].textContent;
 mr_radius2 = row2.cells[7].textContent;
 xy1 = row2.cells[2].textContent;
 xy2 = row2.cells[3].textContent;
 rov_index = row2.rowIndex;
 chek=row2.cells[8].children[0].checked;
 $('#zvit').empty();
Cikle3();
}


var icl3 =-1;
var idun3=0;
function Cikle3(){

 icl3+=1;
  if(icl3==0){msg('ЗАЧЕКАЙТЕ -завантаження');data_zup = [];}
 $('button').prop("disabled", true);
 
   if(icl3< unitslist.length){
  
     idun3 = unitslist[icl3];
     var name =idun3.getName();
   
     if(mr_tehnika=='000'){
     if(name.indexOf('Камаз')>=0|| name.indexOf('SCANIA')>=0){ 
          
      if(name.indexOf('Шкурат')<0 && name.indexOf('Білоус')<0 && name.indexOf('Штацький')<0 && name.indexOf('Дробниця')<0 && name.indexOf('Писаренко')<0 && name.indexOf('Колотуша')<0){

        executeReport3(idun3);
      } else{Cikle3();}
      

     }else{Cikle3();}
     
     }else{
      if(mr_tehnika=='111'){
       if(name.indexOf('Найм')>=0|| name.indexOf('найм')>=0|| name.indexOf('ТОВ')>=0|| name.indexOf('Фоп')>=0|| name.indexOf('ФОП')>=0){ 
        executeReport3(idun3);
       } else{Cikle3();}
      }else{
     if(name.indexOf(mr_tehnika)>=0){ 
          executeReport3(idun3);

     }else{Cikle3();}
     }
     }
    
    
    }else{
    icl3=-1;

    $('button').prop("disabled", false);
    msg('ЗАВЕРШЕНО');
     poezdki();
    
    }
    

}
function executeReport3(id){ // execute selected report
    // get data from corresponding fields
  var id_res=26227, id_templ=7, id_unit=id.getId(), time=$("#interval").val(),idddd=id;
	if(!id_res){ msg("Select resource"); return;} // exit if no resource selected
	if(!id_templ){ msg("Select report template"); return;} // exit if no report template selected
	if(!id_unit){ msg("Select unit"); return;} // exit if no unit selected

	var sess = wialon.core.Session.getInstance(); // get instance of current Session
	var res = sess.getItem(id_res); // get resource by id
	var to = Date.parse($('#fromtime2').val())/1000; // get current server time (end time of report time interval)
  var nam = sess.getItem(id_unit).getName();
	var from = Date.parse($('#fromtime1').val())/1000; // calculate start time of report
	// specify time interval object
	var interval = { "from": from, "to": to, "flags": wialon.item.MReport.intervalFlag.absolute };
	var template = res.getReport(id_templ); // get report template by id
	$("#exec_btn").prop("disabled", true); // disable button (to prevent multiclick while execute)

	res.execReport(template, id_unit, 0, interval, // execute selected report
		function(code, data) { // execReport template
			$("#exec_btn").prop("disabled", false); // enable button
			if(code){ msg(wialon.core.Errors.getErrorText(code)); Cikle3();return; } // exit if error code
			if(!data.getTables().length){ // exit if no tables obtained
			 Cikle3();return; }
			else showReportResult3(data,idddd); // show report result
	});
}
var data_zup = [];

function showReportResult3(result,name){ // show result after report execute
	var tables = result.getTables(); // get report tables
	if (!tables)  {Cikle3(); return;} // exit if no tables

   
	for(var i=0; i < tables.length; i++){ // cycle on tables
		// html contains information about one table
		var html = [];
    var start=0;
    var cord=0;
    var interval=0;
		
		 //data_unit = [[],[]];
		
		
		result.getTableRows(i, 0, tables[i].rows, // get Table rows
			qx.lang.Function.bind( function(html, code, rows) { // getTableRows callback
				if (code) {msg(wialon.core.Errors.getErrorText(code));  Cikle3(); return;} // exit if error code
				for(var j in rows) { // cycle on table rows
					if (typeof rows[j].c == "undefined") continue; // skip empty rows
					
          if(start==0 && getTableValue(rows[j].c[2])=='0 км/ч'){start=getTableValue(rows[j].c[1]), cord=getTableValue(rows[j].c[0]);}
          if(start!=0 && getTableValue(rows[j].c[2])!='0 км/ч'){
          interval = (Date.parse(getTableValue(rows[j].c[1]))/1000)-(Date.parse(start)/1000);
          //msg(cord+' '+start+' '+getTableValue(rows[j].c[1])+' '+interval+' '+name.getName()+' '+name.getId()); 
          if(cord==""){cord=getTableValue(rows[j].c[0]);}
          data_zup.push([cord,start,getTableValue(rows[j].c[1]),interval,name.getName(),name.getId(),getTableValue(rows[j].c[3])]);
          start=0;
          }
          if(start!=0 && j==rows.length-1){
          interval = (Date.parse(getTableValue(rows[j].c[1]))/1000)-(Date.parse(start)/1000);
          data_zup.push([cord,start,getTableValue(rows[j].c[1]),interval,name.getName(),name.getId()]);
          start=0;
          }
          
       // msg(name.getName());
         
				}
         Cikle3();      				
			}, this, html)
		);
	}
   
}

var mar_zupinki=[];
function poezdki(){
var tableRow =document.querySelectorAll('#marshrut tr');
var name=0;
var id=0;
var start=0;
var stop=0;
var intervall1=0;
var intervall2=0;
var pereyezd=0;


var intj=0;
var intervall3=0;
mar_zupinki=[];
var y,x,yy,xx,dis;
for(var i=1; i < data_zup.length; i++){ 
if(data_zup[i][5]!=data_zup[i-1][5]){
name=0;
id=0;
start=0;
stop=0;
intervall1=0;
intervall2=0;
intj=0;
intervall3=0;
pereyezd=0;


}
if( data_zup[i][3]>30){
     y = parseFloat(data_zup[i][0].split(',')[0]);
     x = parseFloat(data_zup[i][0].split(',')[1]);

       yy = parseFloat(xy2.split(',')[0]);
       xx = parseFloat(xy2.split(',')[1]);
       dis = wialon.util.Geometry.getDistance(y, x, yy, xx);
      if(start != 0 && dis<=mr_radius2){
      intervall2+= data_zup[i][3];
      if(intervall2>mr_interval*60){
      if(stop==0){stop = data_zup[i][1];} 
       if(pereyezd==0){mar_zupinki.push([mr_name1,mr_name2,id,name,start,stop,data_zup[i][6]]);}else{mar_zupinki.push([mr_name1+' переїзд '+pereyezd,mr_name2,id,name,start,stop,data_zup[i][6]]);}
       name = 0;
       id= 0;
       start = 0;
       stop=0;
       intervall2=0;
       intervall3=0;
       pereyezd=0;
       }
      }else{intervall2=0; stop=0;}


     yy = parseFloat(xy1.split(',')[0]);
     xx = parseFloat(xy1.split(',')[1]);
     dis = wialon.util.Geometry.getDistance(y, x, yy, xx);
      if(dis<=mr_radius1){
      intervall1+= data_zup[i][3];
       if(intervall1>mr_interval*60){
        name = data_zup[i][4];
        id= data_zup[i][5];
        start = data_zup[i][2];
        stop=0;
        pereyezd=0;
       }
      }else{ 
      intervall1=0;
      //===================================================================================     
             if(start!=0 && chek==true){
             for ( j = 1; j < tableRow.length; j++){
               yy = parseFloat(tableRow[j].cells[2].innerHTML.split(',')[0]);
               xx = parseFloat(tableRow[j].cells[2].innerHTML.split(',')[1]);
               dis = wialon.util.Geometry.getDistance(y, x, yy, xx);
               if(dis<=tableRow[j].cells[6].textContent &&  rov_index!=j){ 
                if(intj!=j){intj=j;intervall3=0;}
                intervall3+= data_zup[i][3];
                 if(intervall3>mr_interval*60){ intervall1=0; intervall2=0;intervall3=0;pereyezd=tableRow[j].cells[0].children[0].value;}
                 break;
                 }
               }
              }
  //=================================================================================  
      
      }
      
      


}


}

if(mar_zupinki.length>0){Cikle5();}
}

var icl5 =-1;
var idun5=0;
var data_zvit = [];
function Cikle5(){
 icl5+=1;
  if(icl5==0){msg('ЗАЧЕКАЙТЕ -завантаження'); data_zvit = [];}
 $('button').prop("disabled", true);
   
   if(icl5< mar_zupinki.length){
  
          executeReport5();

    }else{
    icl5=-1;

    $('button').prop("disabled", false);
    msg('ЗАВЕРШЕНО');
   
    
    }
    

}
function executeReport5(){ // execute selected report
    // get data from corresponding fields
  var id_res=26227, id_templ=12, id_unit=mar_zupinki[icl5][2];
	if(!id_res){ msg("Select resource"); return;} // exit if no resource selected
	if(!id_templ){ msg("Select report template"); return;} // exit if no report template selected
	if(!id_unit){ msg("Select unit"); return;} // exit if no unit selected

	var sess = wialon.core.Session.getInstance(); // get instance of current Session
	var res = sess.getItem(id_res); // get resource by id
	var to = Date.parse(mar_zupinki[icl5][5])/1000; // get current server time (end time of report time interval)
  var nam = sess.getItem(id_unit).getName();
	var from = Date.parse(mar_zupinki[icl5][4])/1000; // calculate start time of report
	// specify time interval object
	var interval = { "from": from, "to": to, "flags": wialon.item.MReport.intervalFlag.absolute };
	var template = res.getReport(id_templ); // get report template by id
	$("#exec_btn").prop("disabled", true); // disable button (to prevent multiclick while execute)

	res.execReport(template, id_unit, 0, interval, // execute selected report
		function(code, data) { // execReport template
			$("#exec_btn").prop("disabled", false); // enable button
			if(code){ msg(wialon.core.Errors.getErrorText(code)); Cikle5();return; } // exit if error code
			if(!data.getTables().length){ // exit if no tables obtained
			 Cikle5();return; }
			else showReportResult5(data,id_unit); // show report result
	});
}


function showReportResult5(result,id){ // show result after report execute
	var tables = result.getTables(); // get report tables
	if (!tables)  {Cikle5(); return;} // exit if no tables

   
	for(var i=0; i < tables.length; i++){ // cycle on tables
		// html contains information about one table
		var html =  "<tr class='mar_trak' id='" + id + "'>";
		result.getTableRows(i, 0, tables[i].rows, // get Table rows
			qx.lang.Function.bind( function(html, code, rows) { // getTableRows callback
				if (code) {msg(wialon.core.Errors.getErrorText(code));  Cikle5(); return;} // exit if error code
				for(var j in rows) { // cycle on table rows
					if (typeof rows[j].c == "undefined") continue; // skip empty rows
     
       //msg(mar_zupinki[icl5][0]+' '+mar_zupinki[icl5][2]+' '+mar_zupinki[icl5][3]+' '+mar_zupinki[icl5][4]+' '+getTableValue(rows[j].c[0])+' '+getTableValue(rows[j].c[1])+' '+getTableValue(rows[j].c[2])+' '+getTableValue(rows[j].c[3])+' '+getTableValue(rows[j].c[4])+' '+getTableValue(rows[j].c[5]));
         html += "<td nowrap>" + mar_zupinki[icl5][3] + "</td>";
         html += "<td nowrap>" + mar_zupinki[icl5][0] + "</td>";
         html += "<td nowrap>" + mar_zupinki[icl5][1] + "</td>";
         html += "<td nowrap>" + mar_zupinki[icl5][4].split(' ')[0] + "</td>";
         html += "<td nowrap>" + getTableValue(rows[j].c[1]) + "</td>";
         html += "<td nowrap>" + getTableValue(rows[j].c[0]) + "</td>";
         html += "<td nowrap>" + getTableValue(rows[j].c[2]) + "</td>";
         html += "<td nowrap>" + getTableValue(rows[j].c[3]) + "</td>";
         html += "<td nowrap>" + mar_zupinki[icl5][6] + "</td>";
         html += "<td nowrap>" + getTableValue(rows[j].c[4]) + "</td>";
         html += "<td nowrap>" + getTableValue(rows[j].c[5]) + "</td>";
         html += "<td nowrap>" + mar_zupinki[icl5][4] + "</td>";
         html += "<td nowrap>" + mar_zupinki[icl5][5] + "</td>";
         
        
				}
        data_zvit.push([mar_zupinki[icl5][3],mar_zupinki[icl5][0],mar_zupinki[icl5][1],mar_zupinki[icl5][4].split(' ')[0],getTableValue(rows[j].c[1]),getTableValue(rows[j].c[0]),getTableValue(rows[j].c[2]),getTableValue(rows[j].c[3]),mar_zupinki[icl5][6],getTableValue(rows[j].c[4]),getTableValue(rows[j].c[5]),mar_zupinki[icl5][4],mar_zupinki[icl5][5]]);
      
        $("#zvit").append(html);
         Cikle5();      				
			}, this, html)
		);
	}
   
}


function track_marshruta(evt){
 [...document.querySelectorAll("tr")].forEach(e => e.style.backgroundColor = '');
 this.style.backgroundColor = 'pink';
 //msg(this.rowIndex);
 // msg(data_zvit[this.rowIndex-1][2]);
 // msg(this.id);
 $("#lis0").chosen().val(this.id);     
 $("#lis0").trigger("chosen:updated");
 show_track(data_zvit[this.rowIndex-1][11],data_zvit[this.rowIndex-1][12]);
  markerByUnit[this.id].openPopup();
}





//=================Data===================================================================================
Global_DATA=[];
function UpdateGlobalData(t2=0,idrep=7,i=0){
    if(i==0){
     $('#eeew').prop("disabled", true);
     if($('#fromtime1').val()!=from111 || $('#fromtime2').val()!=from222){
       Global_DATA = [];
       from111=$('#fromtime1').val();
       from222=$('#fromtime2').val();
       t2=Date.parse($('#fromtime2').val())/1000;
      }else{
       cur_day111 = new Date();
       month = cur_day111.getMonth()+1;  
       from222 = cur_day111.getFullYear() + '-' + (month < 10 ? '0' : '') + month + '-' + cur_day111.getDate()+ ' ' + cur_day111.getHours()+ ':' + cur_day111.getMinutes();
       $('#fromtime2').val(from222);
       t2=Date.parse($('#fromtime2').val())/1000;
      }
    } 
    if(i < unitslist.length){
        msg(unitslist.length-i);
        CollectGlobalData(t2,idrep,i,unitslist[i]);
    } else {
      $('button').prop("disabled", false);
      $('#log').empty();
      msg('Завантажено');
    }   
}

let list_zavatajennya=[];
function CollectGlobalData(t2,idrep,i,unit){ // execute selected report
  let id_res=26227, id_unit = unit.getId(), ii=i;
  if(Global_DATA[ii]==undefined){Global_DATA.push([[id_unit,unit.getName(),Date.parse($('#fromtime1').val())/1000]])}
  let t1=Global_DATA[ii][0][2];
  //if($("#gif").is(":checked")) {for (let iii=0; iii<list_zavatajennya.length; iii++){if(list_zavatajennya[iii]==id_unit){break;}if(list_zavatajennya[iii].length-1==iii){ii++; UpdateGlobalData(t2,idrep,ii);return;}}}
	if(!id_res){ msg("Select resource"); return;} // exit if no resource selected
	if(!idrep){ msg("Select report template"); return;} // exit if no report template selected
	if(!id_unit){ msg("Select unit"); return;} // exit if no unit selected
	var sess = wialon.core.Session.getInstance(); // get instance of current Session
	var res = sess.getItem(id_res); // get resource by id
	// specify time interval object
	var interval = { "from": t1, "to": t2, "flags": wialon.item.MReport.intervalFlag.absolute };
	var template = res.getReport(idrep); // get report template by id
  
	 res.execReport(template, id_unit, 0, interval, // execute selected report
		function(code, data) { // execReport template
			if(code){ msg(wialon.core.Errors.getErrorText(code));ii++; UpdateGlobalData(t2,idrep,ii);return; } // exit if error code
			if(!data.getTables().length){ii++; UpdateGlobalData(t2,idrep,ii); return; }
			else{
        let tables = data.getTables();
        let headers = tables[0].header;
        let it=0;
        let litry=0;
        let datt=0;
        for (let j=4; j<headers.length; j++) {if (headers[j].indexOf('Топливо')>=0 || headers[j].indexOf('Паливо')>=0){it=j;}}
        data.getTableRows(0, 0, tables[0].rows,function( code, rows) { 
          if (code) {msg(wialon.core.Errors.getErrorText(code)); ii++; UpdateGlobalData(t2,idrep,ii);return;} 
          for(let j in rows) { 
            if (typeof rows[j].c == "undefined") continue;
            //if (j>0 && getTableValue(rows[j].c[0]) == getTableValue(rows[j-1].c[0]) ) continue;
            litry=0;
            if (it>0) litry=getTableValue(rows[j].c[it]); 
            datt= Date.parse(getTableValue(rows[j].c[1]));
            Global_DATA[ii].push([getTableValue(rows[j].c[0]),getTableValue(rows[j].c[1]),litry,getTableValue(rows[j].c[2]),datt,getTableValue(rows[j].c[4])]);
            Global_DATA[ii][0][2]=datt/1000+1;
          }
          ii++;
          UpdateGlobalData(t2,idrep,ii);
        });
      }  
	});       
}




function getTableValue(data) { // calculate ceil value
	if (typeof data == "object")
		if (typeof data.t == "string") return data.t; else return "";
	else return data;
}


var slider = document.getElementById("myRange");
var output = document.getElementById("f");
output.innerHTML = from222; // Display the default slider value

// Update the current slider value (each time you drag the slider handle)
slider.oninput = function() {
    var interval = Date.parse($('#fromtime1').val())+(Date.parse($('#fromtime2').val())-Date.parse($('#fromtime1').val()))/2000*this.value;
    position(interval);
}

function position(t)  {
  var interval = t;
  var cur_day1111 = new Date(interval);
  var month2 = cur_day1111.getMonth()+1;   
  var from2222 = cur_day1111.getFullYear() + '-' + (month2 < 10 ? '0' : '') + month2 + '-' + cur_day1111.getDate()+ ' ' + cur_day1111.getHours()+ ':' + cur_day1111.getMinutes()+ ':' + cur_day1111.getSeconds();
  output.innerHTML = from2222;
  var x,y,markerrr;
    for(let ii = 0; ii<Global_DATA.length; ii++){
     if(Global_DATA[ii].length<5) continue
     let ind=1;
     markerrr = markerByUnit[Global_DATA[ii][0][0]];
     if (markerrr){
      if(rux == 1){var opt = markerrr.options.opacity;if(opt>0.02)markerrr.setOpacity(opt*0.97);}
     for(let iii = Global_DATA[ii].length-1; iii>0; iii-=200){
      if(interval>Global_DATA[ii][iii][4]) {ind=iii;break;}
     }
     for(let i = ind; i<Global_DATA[ii].length; i++){
         if(interval<Global_DATA[ii][i][4]){
           if(Global_DATA[ii][i][0]=="")continue;
            y = parseFloat(Global_DATA[ii][i][0].split(',')[0]);
            x = parseFloat(Global_DATA[ii][i][0].split(',')[1]);
            markerrr.setLatLng([y, x]); 
            markerrr.bindPopup('<center><font size="1">'+Global_DATA[ii][0][1] +'<br />' +Global_DATA[ii][i][1]+ '<br />' +Global_DATA[ii][i][3]+ '<br />' +Global_DATA[ii][i][2]+'л'+ '<br />' +Global_DATA[ii][i][5]);
            if(rux == 1){if (Global_DATA[ii][i][3][0]!='0' ) {markerrr.setOpacity(1);}}
            if(rux == 21){ if (Global_DATA[ii][i][5][0]=='Д' ) {markerrr.setOpacity(1);}else{markerrr.setOpacity(0);}}
            if(rux == 22){ if (Global_DATA[ii][i][5][0]=='К' ) {markerrr.setOpacity(1);}else{markerrr.setOpacity(0);}}
            if(rux == 23){ if (Global_DATA[ii][i][5][0]=='Б' ) {markerrr.setOpacity(1);}else{markerrr.setOpacity(0);}}
            if(rux == 24){ if (Global_DATA[ii][i][5][0]=='Г' ) {markerrr.setOpacity(1);}else{markerrr.setOpacity(0);}}
            if(rux == 25){ if (Global_DATA[ii][i][5][0]=='П' ) {markerrr.setOpacity(1);}else{markerrr.setOpacity(0);}}
            if(rux == 26){ if (Global_DATA[ii][i][5][0]=='Р' ) {markerrr.setOpacity(1);}else{markerrr.setOpacity(0);}}
            //if(rux == 27){ if (Global_DATA[ii][i][5][0]=='О' ) {markerrr.setOpacity(1);}else{markerrr.setOpacity(0);}}
            if(rux == 28){ if (Global_DATA[ii][i][5][0]=='С' ) {markerrr.setOpacity(1);}else{markerrr.setOpacity(0);}}
            if(rux == 29){ if (Global_DATA[ii][i][5][0]=='Ж' ) {markerrr.setOpacity(1);}else{markerrr.setOpacity(0);}}
            if(rux == 30){ if (Global_DATA[ii][i][5][0]!=null ) {markerrr.setOpacity(0);}}
            break;
          }
     }
    }
  }
}
    
var tik =0;
var sec =600;
setInterval(function() {
if($("#gif").is(":checked")) {
  //msg(sec/10);
    tik=slider.value;
    sec++;
    tik++;
    slider.value=tik;
    if (tik >= 1999) {tik =1800;slider.value=tik;}
    if (sec > 3000) {
    sec =0;
    UpdateGlobalData(0,7,0);
    }
    if (sec == 1000 && $("#monitoring_gif").is(":checked")) {Monitoring();}
    var interval = Date.parse($('#fromtime1').val())+(Date.parse($('#fromtime2').val())-Date.parse($('#fromtime1').val()))/2000*tik;
    position(interval);
  }
  }, 120);
 

    
    
var icl2 =-1;
var idun2=0;
let maska_zup='All';
let min_zup=60;
let alone = false;

function Cikle2(){
 icl2+=1;
 if(icl2==0)data_zup=[];
    let str = maska_zup.split(',');
    let unit= false;
    if (maska_zup=='All')unit= true;
      if(icl2 < unitslist.length){
        str.forEach((element) => {if(unitslist[icl2].getName().indexOf(element)>=0){unit = true;}});
        if(unit){
          msg(unitslist.length-icl2);
          idun2 = unitslist[icl2];
          executeReport2(idun2);
        }else{ Cikle2(); }
      } else {
        icl2=-1;
        $('button').prop("disabled", false);
        $('#log').empty();
        msg('Завантажено');
        zupinki();
      }   
}
function executeReport2(id){ // execute selected report
    // get data from corresponding fields
  var id_res=26227, id_templ=8, id_unit=id.getId(), time=$("#interval").val(),idddd=id;
	if(!id_res){ msg("Select resource"); return;} // exit if no resource selected
	if(!id_templ){ msg("Select report template"); return;} // exit if no report template selected
	if(!id_unit){ msg("Select unit"); return;} // exit if no unit selected

	var sess = wialon.core.Session.getInstance(); // get instance of current Session
	var res = sess.getItem(id_res); // get resource by id
	var to = Date.parse($('#fromtime2').val())/1000; // get current server time (end time of report time interval)
  var nam = sess.getItem(id_unit).getName();
	var from = Date.parse($('#fromtime1').val())/1000; // calculate start time of report
	// specify time interval object
	var interval = { "from": from, "to": to, "flags": wialon.item.MReport.intervalFlag.absolute };
	var template = res.getReport(id_templ); // get report template by id
	$("#exec_btn").prop("disabled", true); // disable button (to prevent multiclick while execute)

	res.execReport(template, id_unit, 0, interval, // execute selected report
		function(code, data) { // execReport template
			$("#exec_btn").prop("disabled", false); // enable button
			if(code){ msg(wialon.core.Errors.getErrorText(code)); Cikle2();return; } // exit if error code
			if(!data.getTables().length){ // exit if no tables obtained
			 Cikle2();return; }
			else showReportResult2(data,idddd); // show report result
	});
}
var data_zup = [];

function showReportResult2(result,name){ // show result after report execute
	var tables = result.getTables(); // get report tables
	if (!tables)  {Cikle2(); return;} // exit if no tables
   
		var html = [];
		
		 //data_unit = [[],[]];
		
		if(tables.length>1){
		result.getTableRows(1, 0, tables[1].rows, // get Table rows
			qx.lang.Function.bind( function(html, code, rows) { // getTableRows callback
				if (code) {msg(wialon.core.Errors.getErrorText(code)); return;} // exit if error code
				for(var j in rows) { // cycle on table rows
					if (typeof rows[j].c == "undefined") continue; // skip empty rows
					data_zup.push([getTableValue(rows[j].c[0]),getTableValue(rows[j].c[1]),getTableValue(rows[j].c[2]),getTableValue(rows[j].c[3]),name.getName(),name.getId(),getTableValue(rows[j].c[5]),getTableValue(rows[j].c[6])]);
        //msg(name.getName());
       
				} 	
        result.getTableRows(0, 0, tables[0].rows, // get Table rows
			  qx.lang.Function.bind( function(html, code, rows) { // getTableRows callback
				if (code) {msg(wialon.core.Errors.getErrorText(code));  Cikle2(); return;} // exit if error code
				for(var j in rows) { // cycle on table rows
					if (typeof rows[j].c == "undefined") continue; // skip empty rows
					data_zup.push([getTableValue(rows[j].c[0]),getTableValue(rows[j].c[1]),getTableValue(rows[j].c[2]),getTableValue(rows[j].c[3]),name.getName(),name.getId(),getTableValue(rows[j].c[5]),getTableValue(rows[j].c[6])]);
        //msg(name.getName());
         
				}
         Cikle2();    				
			}, this, html)
		);			
			}, this, html)
		);
} else{
result.getTableRows(0, 0, tables[0].rows, // get Table rows
			qx.lang.Function.bind( function(html, code, rows) { // getTableRows callback
				if (code) {msg(wialon.core.Errors.getErrorText(code));  Cikle2(); return;} // exit if error code
				for(var j in rows) { // cycle on table rows
					if (typeof rows[j].c == "undefined") continue; // skip empty rows
					data_zup.push([getTableValue(rows[j].c[0]),getTableValue(rows[j].c[1]),getTableValue(rows[j].c[2]),getTableValue(rows[j].c[3]),name.getName(),name.getId(),getTableValue(rows[j].c[5]),getTableValue(rows[j].c[6])]);
        //msg(name.getName());
         
				}
         Cikle2();    				
			}, this, html)
		);
}

}

var zup_mark_data=[];
var zup_hist=[];
function zupinki(){
 //for(var iii=0; iii < zup_mark_data.length; iii++){
// map.removeLayer(zup_mark_data[iii]);
 // if(iii == zup_mark_data.length-1){zup_mark_data=[];}
 //}

 for(var i=0; i < data_zup.length; i++){
 
  
if(data_zup[i][3].split(':').reverse().reduce((acc, n, iy) => acc + n * (60 ** iy), 0)<min_zup) continue;
       

 if(data_zup[i][0]){
    var y = parseFloat(data_zup[i][0].split(',')[0]);
    var x = parseFloat(data_zup[i][0].split(',')[1]);
    var mark=0;
    var gren=0;

    
    for(var ii=0; ii < zup_hist.length; ii++){
      if((data_zup[i][1]+data_zup[i][3])==zup_hist[ii]){gren=1;}
    }
    
   
     if(gren==1){
                mark = L.marker([y, x], {
                                  zIndexOffset:-1000,
                                  draggable: true,
                                  icon: L.icon({
                                  iconUrl: '222.png',
                                  iconSize:   [24, 24],
                                  iconAnchor: [12, 24] // set icon center
                                  })
                                  }).addTo(map);
                mark.bindPopup(data_zup[i][4]+'<br />'+data_zup[i][1]+'<br />'+data_zup[i][3]+'<br />'+data_zup[i][6]);
                zup_mark_data.push(mark);
                 mark.on('click', function(e) {
                   var cpdataa='';
                 cpdataa += e.target._popup._content.split('<br />')[0] + '\t' +e.target._popup._content.split('<br />')[1] + '\t' +e.target._popup._content.split('<br />')[2] + ' \t' + e.target._popup._content.split('<br />')[3];
  navigator.clipboard.writeText(cpdataa);  
  $("#lis0").chosen().val(unitsID[e.target._popup._content.split('<br />')[0]]); 
  $("#lis0").trigger("chosen:updated");
  layers[0]=0;

  var loo = (e.target._popup._content.split('<br />')[2]).split(':')[0]*3600000;
  var t1=  new Date(Date.parse(e.target._popup._content.split('<br />')[1])-3600000);
  var t2=  new Date(Date.parse(e.target._popup._content.split('<br />')[1])+3600000+loo);
  
   show_track(t1,t2);
   slider.value=(Date.parse(e.target._popup._content.split('<br />')[1])-Date.parse($('#fromtime1').val()))/(Date.parse($('#fromtime2').val())-Date.parse($('#fromtime1').val()))*2000;
   position(Date.parse(e.target._popup._content.split('<br />')[1]));
  
                   });
              }
     if(gren==0){
                mark = L.marker([y, x], {
                                  
                                  draggable: true,
                                  icon: L.icon({
                                  iconUrl: '111.png',
                                  iconSize:   [24, 24],
                                  iconAnchor: [12, 24] // set icon center
                                  })
                                  }).addTo(map);
                if(alone){if(tehnika_poruch(data_zup[i][4],y,x,Date.parse(data_zup[i][1]))){mark.setIcon(L.icon({iconUrl: '333.png',iconSize:[24, 24],iconAnchor: [12, 24]}));}}
                mark.bindPopup(data_zup[i][4]+'<br />'+data_zup[i][1]+'<br />'+data_zup[i][3]+'<br />'+data_zup[i][6]);
                zup_mark_data.push(mark);
                 mark.on('click', function(e) {
                   var cpdataa='';
                 cpdataa += e.target._popup._content.split('<br />')[0] + '\t' +e.target._popup._content.split('<br />')[1] + '\t' +e.target._popup._content.split('<br />')[2] + ' \t' + e.target._popup._content.split('<br />')[3];
  navigator.clipboard.writeText(cpdataa);  
  zup_hist.push(e.target._popup._content.split('<br />')[1]+e.target._popup._content.split('<br />')[2]);
  if(zup_hist.length>700){zup_hist.shift();}
  $("#lis0").chosen().val(unitsID[e.target._popup._content.split('<br />')[0]]); 
  $("#lis0").trigger("chosen:updated");
  layers[0]=0;
  var loo = (e.target._popup._content.split('<br />')[2]).split(':')[0]*3600000;
  var t1=  new Date(Date.parse(e.target._popup._content.split('<br />')[1])-3600000);
  var t2=  new Date(Date.parse(e.target._popup._content.split('<br />')[1])+3600000+loo);
 
   show_track(t1,t2);
    slider.value=(Date.parse(e.target._popup._content.split('<br />')[1])-Date.parse($('#fromtime1').val()))/(Date.parse($('#fromtime2').val())-Date.parse($('#fromtime1').val()))*2000;
   position(Date.parse(e.target._popup._content.split('<br />')[1]));
   e.target.setIcon(L.icon({iconUrl: '333.png',iconSize:   [24, 24],iconAnchor: [12, 24]}));
   localStorage.setItem('arhivzup', JSON.stringify(zup_hist)); 
                 });
              }
     
    
     
     
    }
   }
 }



 var svdata = JSON.parse(localStorage.getItem('arhivzup'));
 if(svdata)zup_hist=svdata;
  
  

 function fn_load2() {
  var svdata = JSON.parse(localStorage.getItem('arhivzup'));
  zup_hist=svdata;
  
 }
 
function clear(){  
 
 if(tile_layer) {map.removeLayer(tile_layer); tile_layer=null; layers[0]=0; }
}

function clear2(){  
 
  for(var iii=0; iii < zup_mark_data.length; iii++){
  map.removeLayer(zup_mark_data[iii]);
   if(iii == zup_mark_data.length-1){zup_mark_data=[];}
  }
  for(var iii=0; iii <  nav_mark_data.length; iii++){
   map.removeLayer( nav_mark_data[iii]);
    if(iii ==  nav_mark_data.length-1){ nav_mark_data=[];}
   }
 }
 function clearGEO(){  
   for(var i=0; i < geo_layer.length; i++){
  map.removeLayer(geo_layer[i]);
   if(i == geo_layer.length-1){geo_layer=[];}
  }

 }

function chuse() {
  var nmm,mm,idd;
  
   $('#v1').css({'background':'#e9e9e9'});
   $('#v2').css({'background':'#e9e9e9'});
   $('#v3').css({'background':'#e9e9e9'});
   $('#v4').css({'background':'#e9e9e9'});
   $('#v5').css({'background':'#e9e9e9'});
   $('#v6').css({'background':'#e9e9e9'});
   $('#v9').css({'background':'#e9e9e9'});
   $('#v12').css({'background':'#e9e9e9'});
   $('#v13').css({'background':'#e9e9e9'});
   $('#v14').css({'background':'#e9e9e9'});

   $('#v21').css({'background':'#e9e9e9'});
   $('#v22').css({'background':'#e9e9e9'});
   $('#v23').css({'background':'#e9e9e9'});
   $('#v24').css({'background':'#e9e9e9'});
   $('#v25').css({'background':'#e9e9e9'});
   $('#v26').css({'background':'#e9e9e9'});
   $('#v27').css({'background':'#e9e9e9'});
   $('#v28').css({'background':'#e9e9e9'});
   $('#v29').css({'background':'#e9e9e9'});
   $('#v30').css({'background':'#e9e9e9'});
  
   rux = 0;

  if ($(this).attr("id")=='v9'){if(rux==0)rux = 1; this.style.background = '#b2f5b4';}
  if ($(this).attr("id")=='v21'){if(rux==0)rux = 21; this.style.background = '#b2f5b4';}
  if ($(this).attr("id")=='v22'){if(rux==0)rux = 22; this.style.background = '#b2f5b4';}
  if ($(this).attr("id")=='v23'){if(rux==0)rux = 23; this.style.background = '#b2f5b4';}
  if ($(this).attr("id")=='v24'){if(rux==0)rux = 24; this.style.background = '#b2f5b4';}
  if ($(this).attr("id")=='v25'){if(rux==0)rux = 25; this.style.background = '#b2f5b4';}
  if ($(this).attr("id")=='v26'){if(rux==0)rux = 26; this.style.background = '#b2f5b4';}
  //if ($(this).attr("id")=='v27'){if(rux==0)rux = 27; this.style.background = '#b2f5b4';}
  if ($(this).attr("id")=='v28'){if(rux==0)rux = 28; this.style.background = '#b2f5b4';}
  if ($(this).attr("id")=='v29'){if(rux==0)rux = 29; this.style.background = '#b2f5b4';}
  if ($(this).attr("id")=='v30'){if(rux==0)rux = 30; this.style.background = '#b2f5b4';}
  
for(var i=0; i < allunits.length; i++){
nmm =allunits[i].getName();
idd =allunits[i].getId();
mm = markerByUnit[idd];
 mm.setOpacity(0);
 if (Date.parse($('#fromtime1').val())/1000 > allunits[i].getPosition().t || rux == 1){ mm.setOpacity(0);}
   
     if ($(this).attr("id")=='v1'){
      mm.setOpacity(1);
      this.style.background = '#b2f5b4';
     }
     
     if ($(this).attr("id")=='v2'){
     if(nmm.indexOf('КАМАЗ')>=0|| nmm.indexOf('Камаз')>=0){ 
     mm.setOpacity(1);
       mm.setZIndexOffset(1000);
       this.style.background = '#b2f5b4';
     }
     }  
     if ($(this).attr("id")=='v3'){
     if(nmm.indexOf(' МАЗ')>=0){ 
      mm.setOpacity(1);
       mm.setZIndexOffset(1000);
       this.style.background = '#b2f5b4';
     }
     } 
     if ($(this).attr("id")=='v4'){
     if(nmm.indexOf('SCANIA')>=0){ 
       mm.setOpacity(1);
       mm.setZIndexOffset(1000);
       this.style.background = '#b2f5b4';
     }
     }
     if ($(this).attr("id")=='v5'){
     if(nmm.indexOf('JCB')>=0|| nmm.indexOf('Manitou')>=0 || nmm.indexOf('Scorpion')>=0){ 
      mm.setOpacity(1);
       mm.setZIndexOffset(1000);
       this.style.background = '#b2f5b4';
     }
     }
     if ($(this).attr("id")=='v6'){
     if(nmm.indexOf('ГАЗ')>=0){ 
      mm.setOpacity(1);
       mm.setZIndexOffset(1000);
       this.style.background = '#b2f5b4';
     }
     }
     if ($(this).attr("id")=='v12'){
      if(nmm.indexOf('John')>=0 || nmm.indexOf('JD')>=0 || nmm.indexOf(' CL ')>=0|| nmm.indexOf(' МТЗ ')>=0|| nmm.indexOf('CASE')>=0 || nmm.indexOf(' NH ')>=0){
       mm.setOpacity(1);
        mm.setZIndexOffset(1000);
        this.style.background = '#b2f5b4';
      }
      }
     
    if ($(this).attr("id")=='v13'){
      if(nmm.indexOf('Нива')>=0 || nmm.indexOf('Газель')>=0 || nmm.indexOf('Лада')>=0 || nmm.indexOf('Lanos')>=0 || nmm.indexOf('Дастер')>=0 || nmm.indexOf('Stepway')>=0 || nmm.indexOf('ВАЗ')>=0 || nmm.indexOf('ФОРД')>=0 || nmm.indexOf('Toyota')>=0 || nmm.indexOf('Рено')>=0 || nmm.indexOf('TOYOTA')>=0 || nmm.indexOf('Skoda')>=0|| nmm.indexOf('ЗАЗ ')>=0){ 
       mm.setOpacity(1);
        mm.setZIndexOffset(1000);
        this.style.background = '#b2f5b4';
      }
      }
      
        if ($(this).attr("id")=='v14'){
      if(nmm.indexOf('Найм')>=0 || nmm.indexOf('найм')>=0|| nmm.indexOf('Фоп')>=0|| nmm.indexOf('ФОП')>=0|| nmm.indexOf('ТОВ')>=0){ 
       mm.setOpacity(1);
        mm.setZIndexOffset(1000);
        this.style.background = '#b2f5b4';
      }
      }

     if ($(this).attr("id")=='v27'){
      if(nmm.indexOf('CASE 4430')>=0 || nmm.indexOf('R4045')>=0|| nmm.indexOf('612R')>=0){
       mm.setOpacity(1);
        mm.setZIndexOffset(1000);
        this.style.background = '#b2f5b4';
      }
      }

     if ($(this).attr("id")=='v30'){
      if(nmm.indexOf('John')>=0 || nmm.indexOf('JD')>=0 || nmm.indexOf(' CL ')>=0|| nmm.indexOf('CASE')>=0 || nmm.indexOf(' NH ')>=0 ){
       mm.setOpacity(1);
        mm.setZIndexOffset(1000);
        this.style.background = '#b2f5b4';
      }
      }
}
}

function Gozone_History() {
let now = new Date();
   let month = now.getMonth()+1;   
   let data = now.getDate()+ '.' +(month < 10 ? '0' : '') + month + '.' +now.getFullYear();
   let zone = Vibranaya_zona;
   let info = Vibranaya_zona.d+'||'+data+'|'+$('#robota').val();
   if(this.innerText=="додати"){
     let remotee= wialon.core.Remote.getInstance();  
  remotee.remoteCall('resource/update_zone',{"n":zone.n,"d":info,"t":zone.t,"w":zone.w,"f":zone.f,"c":zone.c,"tc":zone.tc,"ts":zone.ts,"min":zone.min,"max":zone.max,"oldItemId":zone.rid,"oldZoneId":zone.id,"libId":"","path":"","p":zone.p,"id":zone.id,"itemId":zone.rid,"callMode":"update"},function (error) { if (error) {msg(wialon.core.Errors.getErrorText(error));}else{
 $('#obrobka').append("<tr><td>"+data+"</td><td>"+$('#robota').val()+"</td><td>&#10060</td></tr>");
  }}); 
   }else{
   $('#robota').val(this.innerText);
 
   }


}




function fn_copy() {

  var cpdata='';
      for (var i = 0; i < data_zvit.length; i++) {
          cpdata += data_zvit[i][0] + '\t' +data_zvit[i][1] + '\t' +data_zvit[i][2] + ' \t' + data_zvit[i][3] + '\t' + data_zvit[i][4] + '\t' + data_zvit[i][5] +'\t' + data_zvit[i][6] + '\t' + data_zvit[i][7] +'\t' + data_zvit[i][8] +'\t' + data_zvit[i][9] +'\t' + data_zvit[i][10] +'\t' + data_zvit[i][11] +'\t' + data_zvit[i][12] +'\n'
         
      }
  
  navigator.clipboard.writeText(cpdata);
   
  
  msg("таблицю скопійовано в буфер обміну");
  }


  var data_marsh = [];
  function fn_copy1() {
    data_marsh = [];
    var tableRow =document.querySelectorAll('#marshrut tr');
    for ( j = 1; j < tableRow.length; j++){
        data_marsh.push([tableRow[j].cells[0].children[0].value,tableRow[j].cells[1].children[0].value,tableRow[j].cells[2].textContent,tableRow[j].cells[3].textContent,tableRow[j].cells[6].textContent,tableRow[j].cells[7].textContent]);
    } 
    localStorage.setItem('mars', JSON.stringify(data_marsh)); 
    }

    function fn_load1() {
      var svdata = JSON.parse(localStorage.getItem('mars'));
      if (svdata){
      $('#marshrut').empty();
      data_marsh=svdata;

      
        

        var row = "<thead>";   
        row += "<td>Місце завантаження</td>";
        row += "<td>Місце розвантаження</td>";
        row += "<td>Техніка</td>";
        row += "<td>мін зупинка</td>";
        row += " <td>враховувати <br> інші маршрути</td>";
        row += "<td>Розрахунок</td>";
        row += "<td>Видалення</td>";
        row += "</thead>"; 
        $("#marshrut").append(row);



      for (var i = 0; i < svdata.length; i++) {

        marshrutID+=1; 
        var idlist=marshrutID+99999;
       // create row-string with data
           row = "<tr class='marr' id='" + marshrutID + "'>";   
             // print message with information about selected unit and its position
             row += "<td> <input type='text' value='"+svdata[i][0]+"'></td>";
             row += "<td> <input type='text' value='"+svdata[i][1]+"'></td>";
             row += " <td style='display: none;'>"+ svdata[i][2] +"</td>";
             row += " <td style='display: none;'>"+ svdata[i][3] +"</td>";
             row += "<td><div><select class='livesearch' id='"+idlist+"'style='width:200px;'> <option value=' '>Вся техніка</option></select></div></td>";
             row += "<td><select><option value='1'>1хв</option><option value='5'>5хв</option><option value='10'>10хв</option><option value='15'>15хв</option></select></td>";
             row += " <td style='display: none;'>"+svdata[i][4]+"</td>";
             row += " <td style='display: none;'>"+svdata[i][5]+"</td>";
             row += "<td><input type='checkbox' checked></td>"; 
             row += "<td class='run_btn'><button>Порахувати</button></td>";
             row += "<td class='close_btn'><button>Видалити</button></td></tr>";
             //add info in table
             $("#marshrut").append(row);
         
     
         $('#'+idlist+'').append($('<option>').text('Камази + Сканії').val('000'));
         $('#'+idlist+'').append($('<option>').text('Найм').val('111'));
         $('#'+idlist+'').append($('<option>').text('ГАЗи').val('ГАЗ'));
         $('#'+idlist+'').append($('<option>').text('Камази').val('Камаз'));
         $('#'+idlist+'').append($('<option>').text('Сканії').val('SCANIA'));
          $('#'+idlist+'').append($('<option>').text('МАЗи').val(' МАЗ'));
     unitslist.forEach(function(unit) {          
         // Add option
      
         $('#'+idlist+'').append($('<option>').text(unit.getName()).val(unit.getName()));
       
     
       });
     
      $(".livesearch").chosen({search_contains : true});
     
          }
         }
         markerstart.setLatLng([0,0]); 
         markerend.setLatLng([0,0]);
         cklikkk=0;
         for(var iii=0; iii < marshrutMarkers.length; iii++){
          map.removeLayer(marshrutMarkers[iii]);
           if(iii == marshrutMarkers.length-1){marshrutMarkers=[];}
          }

 var tableRow =document.querySelectorAll('#marshrut tr');
var radddddd;
for ( j = 1; j < tableRow.length; j++){

  raddddddd =  L.circle([parseFloat(tableRow[j].cells[2].textContent.split(',')[0]),parseFloat(tableRow[j].cells[2].textContent.split(',')[1])], {stroke: false,  fillColor: '#0000FF', fillOpacity: 0.2,radius: tableRow[j].cells[6].textContent}).addTo(map);
  marshrutMarkers.push(raddddddd);
  raddddddd =  L.circle([parseFloat(tableRow[j].cells[3].textContent.split(',')[0]),parseFloat(tableRow[j].cells[3].textContent.split(',')[1])], {stroke: false,  fillColor: '#f03', fillOpacity: 0.2,radius: tableRow[j].cells[7].textContent}).addTo(map);
  marshrutMarkers.push(raddddddd);
  var polyline = L.polyline([[parseFloat(tableRow[j].cells[2].textContent.split(',')[0]),parseFloat(tableRow[j].cells[2].textContent.split(',')[1])],[parseFloat(tableRow[j].cells[3].textContent.split(',')[0]),parseFloat(tableRow[j].cells[3].textContent.split(',')[1])]], {opacity: 0.3, color: '#0000FF'}).addTo(map);
  marshrutMarkers.push(polyline); 
} 
      }


  $('#grafik').hide();
  $('#v11').click(menu10);
  function menu10() {
if ($('#grafik').is(':hidden')) {
  $('#grafik').show();
  $('#map').css('height', '470px');
  $('#marrr').css('height', '470px');
  $('#option').css('height', '470px');
  $('#unit_info').css('height', '470px');
  $('#zupinki').css('height', '470px');
  $('#palne').css('height', '470px');
  $('#monitoring').css('height', '470px');
  show_gr();
}else{
  $('#grafik').hide();
  $('#map').css('height', '750px');
  $('#marrr').css('height', '750px');
   $('#option').css('height', '750px');
  $('#unit_info').css('height', '750px');
  $('#zupinki').css('height', '750px');
  $('#palne').css('height', '750px');
  $('#monitoring').css('height', '750px');
}
    }
 
  
  function show_gr() {
    var unid =  $("#lis0").chosen().val();
    if ($('#grafik').is(':hidden')==false){
      data_graf = [];
      executeReport6(unid);
    }
  }

  
  
   
    
 
  
  function executeReport6(id){ // execute selected report
      // get data from corresponding fields
    var id_res=26227, id_templ=7, id_unit=id;
    var sess = wialon.core.Session.getInstance(); // get instance of current Session
    var res = sess.getItem(id_res); // get resource by id
    var to = Date.parse($('#fromtime2').val())/1000; // get current server time (end time of report time interval)
    var from = Date.parse($('#fromtime1').val())/1000;
  
    
    // calculate start time of report
    // specify time interval object
    var interval = { "from": from, "to": to, "flags": wialon.item.MReport.intervalFlag.absolute };  
    var template = res.getReport(id_templ); // get report template by id
  
  
   
   
    res.execReport(template, id_unit, 0, interval, // execute selected report
      function(code, data) { // execReport template
        
           
         
         if(code){ msg(wialon.core.Errors.getErrorText(code)); drawChart(); return; } // exit if error code
        if(!data.getTables().length){ // exit if no tables obtained
          drawChart(); return; }
        else showReportResult6(data); // show report result
        
    });
  
  
  }
  var data_graf = [];
  function showReportResult6(result){ // show result after report execute
    
    var tables = result.getTables(); // get report tables
    if (!tables) return; // exit if no tables
    for(var i=0; i < tables.length; i++){ // cycle on tables
      // html contains information about one table
      var html = [];
      var it = 0;
      var litry=0;
      var headers = tables[i].header; // get table headers
      for (var j=4; j<headers.length; j++) {if (headers[j].indexOf('Топливо')>=0 || headers[j].indexOf('Паливо')>=0){it=j;}}

      var iii = 0;
      data_graf = [];
      result.getTableRows(i, 0, tables[i].rows, // get Table rows
        qx.lang.Function.bind( function(html, code, rows) { // getTableRows callback
          if (code) {msg(wialon.core.Errors.getErrorText(code)); drawChart(); return;} // exit if error code
          for(var j in rows) { // cycle on table rows
            if (typeof rows[j].c == "undefined") continue; // skip empty rows
            litry=0;
            if (it>0) litry=getTableValue(rows[j].c[it]); 
  
            data_graf[iii]=[getTableValue(rows[j].c[0]),getTableValue(rows[j].c[1]),litry,getTableValue(rows[j].c[2])];
           
            iii+=1;
           
  
          }
          
        drawChart();
        }, this, html)
      );
    
    }
   
  }
  


  // Load the Visualization API and the corechart package.
  google.charts.load('current', {packages:['corechart', 'table', 'gauge', 'controls']});

  // Set a callback to run when the Google Visualization API is loaded.
  //google.charts.setOnLoadCallback(drawChart);

  // Callback that creates and populates a data table,
  // instantiates the pie chart, passes in the data and
  // draws it.
  var t1 = 0;
  var v1 = 0;
  
function drawChart() {

var dashboard = new google.visualization.Dashboard(
    document.getElementById('grafik'));

var control = new google.visualization.ControlWrapper({
  'controlType': 'ChartRangeFilter',
  'containerId': 'chart2',
  'options': {
    // Filter by the date axis.
    'filterColumnIndex': 0,
    'ui': {
      'chartType': 'LineChart',
      'chartOptions': {
        'chartArea': {'height': '100%','width': '95%'},
        'hAxis': {
        'baselineColor': 'none',
         gridlines: {
        count: -1,
        units: {
          hours: {format: ['HH:mm', 'ha']},
        }
      },
     

        
        }
      },
      // Display a single series that shows the closing value of the stock.
      // Thus, this view has two columns: the date (axis) and the stock value (line series).
      'chartView': {
        'columns': [0, 3]
      },
      // 1 day in milliseconds = 24 * 60 * 60 * 1000 = 86,400,000
      'minRangeSize': 100000
    }
  },
  // Initial range: 2012-02-09 to 2012-03-20.
  'state': {'range': {'start': new Date(Date.parse(output.innerHTML)-10800000), 'end': new Date(Date.parse(output.innerHTML)+10800000)}}
});
var chart = new google.visualization.ChartWrapper({
  'chartType': 'AreaChart',
  'containerId': 'chart1',
  'options': {
  colors: ['red', 'red', 'green'],
  'tooltip':{'textStyle':{'fontName': "Arial", 'fontSize': 13 }},

    // Use the same chart area width as the control for axis alignment.
    'chartArea': {'height': '100%', 'width': '95%'},
    'hAxis': {'slantedText': false, format: 'none'},
   
     


    pointSize: 1,
    dataOpacity: 0.5,
     series: {
            0: { areaOpacity: 0.1, },
            1: { areaOpacity: 0.1, },
            2: { areaOpacity: 0.1, }
        },

  lineWidth: 2,

    'legend': {'position': 'none'}
  },
  // Convert the first column from 'date' to 'string'.

});





var a=[];
var data = new google.visualization.DataTable();
    data.addColumn('datetime', 'date');
     data.addColumn('number', 'speed');
    data.addColumn('number', 'coordinate');
    data.addColumn('number', 'stop');
    data.addColumn({'type': 'string', 'role': 'style'}); 
    data.addColumn({'type': 'string', 'role': 'tooltip'});
   
for (var i = 2; i < data_graf.length-1; i++) {
a[1]=null;
if (data_graf[i][3]=='0 км/ч'){ a[1]=parseFloat(data_graf[i][2]);}
a[2]=null;
a[3]=parseFloat(data_graf[i][2]);  
a[5]='стоїть\n'+data_graf[i][0]+'\n'+data_graf[i][1]+'\n'+data_graf[i][2];
if (data_graf[i-1][0]!=data_graf[i][0]){ 
 
a[5]='рухається\n'+data_graf[i][0]+'\n'+data_graf[i][1]+'\n'+data_graf[i][2];
}


var date = new Date(data_graf[i][1]);
a[0]=date;
a[4]=null;



data.addRows([a]);
}






dashboard.bind(control, chart);
dashboard.draw(data);

google.visualization.events.addListener(chart, 'select', selectHandler);

// The selection handler.
// Loop through all items in the selection and concatenate
// a single message from all of them.
function selectHandler() {
var selection = dashboard.getSelection();


if (selection.length >0) {
var item = selection[0];
if(t1==0){
t1=data.getFormattedValue(item.row, 0);
v1=data.getFormattedValue(item.row, 3);

}else{

var time=new Date(Math.abs(new Date(t1)-new Date(data.getFormattedValue(item.row, 0)))).toISOString().substr(11, 8);
var val=Math.abs((parseFloat(v1.replace(",", ""))-parseFloat(data.getFormattedValue(item.row, 3).replace(",", ""))).toFixed(1));
var sred =(val*60*60/ Math.abs(new Date(t1)-new Date(data.getFormattedValue(item.row, 0)))*1000).toFixed(1);

alert("РІЗНИЦЯ МІЖ ДВОМА ТОЧКАМИ НА ГРАФІКУ"+"\n"+"Час:                                "+time+"\n"+"Літрів:                            "+val+"л"+"\n"+"Середня витрата:        "+sred+"л/год");
t1=0;
v1=0;
}

}

}

}



//=================zapros otchota===================================================================================

function SendDataReportInCallback(t1=0,t2=0,maska='All',idrep=7,data=[],i=0,calbek){
  $('button').prop("disabled", true);
  if (t1==0) t1=Date.parse($('#fromtime1').val())/1000;
  if (t2==0) t2=Date.parse($('#fromtime2').val())/1000;
  let str = maska.split(',');
  let unit= false;
  if (maska=='All')unit= true;
    if(i < unitslist.length){
      str.forEach((element) => {if(unitslist[i].getName().indexOf(element)>=0){unit = true;}});
      if(unit){
        msg(unitslist.length-i);
        CollectDataReport(t1,t2,maska,idrep,data,i,unitslist[i],calbek);
      }else{
        i++;
        SendDataReportInCallback(t1,t2,maska,idrep,data,i,calbek); 
      }
    } else {
      $('button').prop("disabled", false);
      $('#log').empty();
      msg('Завантажено');
      calbek(data);
    }   
}

function CollectDataReport(t1,t2,maska,idrep,olddata,i,unit,calbek){ // execute selected report
    // get data from corresponding fields
     //msg(unit.getName());
  let id_res=26227, id_unit = unit.getId(), ii=i;
	if(!id_res){ msg("Select resource"); return;} // exit if no resource selected
	if(!idrep){ msg("Select report template"); return;} // exit if no report template selected
	if(!id_unit){ msg("Select unit"); return;} // exit if no unit selected
	var sess = wialon.core.Session.getInstance(); // get instance of current Session
	var res = sess.getItem(id_res); // get resource by id
	// specify time interval object
	var interval = { "from": t1, "to": t2, "flags": wialon.item.MReport.intervalFlag.absolute };
	var template = res.getReport(idrep); // get report template by id
  
	 res.execReport(template, id_unit, 0, interval, // execute selected report
		function(code, data) { // execReport template
			if(code){ msg(wialon.core.Errors.getErrorText(code));ii++; SendDataReportInCallback(t1,t2,maska,idrep,olddata,ii,calbek);return; } // exit if error code
			if(!data.getTables().length){ii++; SendDataReportInCallback(t1,t2,maska,idrep,olddata,ii,calbek); return; }
			else{
        let tables = data.getTables();
        let dataa=[];
        let headers = tables[0].header;
        dataa.push([unit.getId(),unit.getName(),headers]);
        //msg(tables[0].header);
        data.getTableRows(0, 0, tables[0].rows,function( code, rows) { 
          if (code) {msg(wialon.core.Errors.getErrorText(code)); ii++; SendDataReportInCallback(t1,t2,maska,idrep,olddata,ii,calbek);return;} 
          for(let j in rows) { 
            if (typeof rows[j].c == "undefined") continue;
            let row=[];
            for (let iii = 0; iii < rows[j].c.length; iii++) {
               row.push(getTableValue(rows[j].c[iii]));
            }
            dataa.push(row);
          }
          olddata.push(dataa);
          ii++;
          SendDataReportInCallback(t1,t2,maska,idrep,olddata,ii,calbek);
        });
      }  
	});
 
       
}

//=================Geomodul===================================================================================
 function track_geomarshruta(evt){
   [...document.querySelectorAll("tr")].forEach(e => e.style.backgroundColor = '');
   this.style.backgroundColor = 'pink';
    $("#lis0").chosen().val(this.id);     
    $("#lis0").trigger("chosen:updated");
    layers[0]=0;
    show_track();
   // msg(this.classList);
     
 }
 let geo_layer =[];
 let geo_splines = [];
function Naryady(data=[],maska='JD'){
  if(data.length==0) return;
  let str = maska.split(',');
  geo_splines= [];
  $("#obrobkatehnika").empty();
  $('#obrobkatehnika').append("<th><td>&#128668</td><td>оброблено га</td><td>пересічення га</td><td>чистий обробіток га</td><td>-</td></th>");
  geo_splines.lenght = 0;
   let texnika=[];
   for (let i = 0; i < data.length; i++) {
   let unit =false;
   str.forEach((element) => {if(data[i][0][1].indexOf(element)>=0){unit = true;}});
   if(unit==false)continue;
   let splines =[];
   let spline=[];
   let newspline=false;
   splines.push([data[i][0][0],data[i][0][1]]);
    for (let ii = 1; ii < data[i].length; ii++) {
     //if(parseInt(data[i][ii][2].match(/\d+/))==0) continue;
     if(data[i][ii][0]=="") continue;
     let lat  = parseFloat(data[i][ii][0].split(',')[0]);
     let lon  = parseFloat(data[i][ii][0].split(',')[1]);

     if(spline.length>0) {
       if(spline[spline.length-1][0]!=lon && spline[spline.length-1][1]!=lat) {
        //if(wialon.util.Geometry.getDistance(lat, lon, spline[spline.length-1][1],spline[spline.length-1][0])>5){
          if(wialon.util.Geometry.pointInShape(geozonepoint, 0, lat, lon)){
            spline.push([lon,lat]); 
            newspline=false;
          }else newspline=true;
       //}
       }
      }else{
        if(wialon.util.Geometry.pointInShape(geozonepoint, 0, lat, lon)){
          spline.push([lon,lat]); 
          newspline=false;
        }else newspline=true;
      }

      if(newspline==true || data[i].length-1 ==ii){
        if(spline.length>0) {
          if(spline.length>1)splines.push(spline);
          //var linestring1 = turf.lineString(spline);
          //var polyline = L.geoJSON(linestring1).addTo(map);
          spline=[];
          newspline=false;
          if(texnika.indexOf(data[i][0][1])<0){
            texnika.push(data[i][0][1]);
            $('#obrobkatehnika').append("<tr class='geo_trak' id='" + data[i][0][0] + "'><td>&#128668</td><td>"+data[i][0][1]+"</td><td>0</td><td>0</td><td>0</td><td><input type='checkbox'></td></tr>");
           }
        }
      }
    }
    geo_splines.push(splines);
  } 
}


function ObrabotkaPolya(spisok=[],zaxvat=10){

  if(geo_splines.length==0) return;
  clearGEO();
  let tableRow =document.querySelectorAll('#obrobkatehnika tr');
    for ( j = 0; j < tableRow.length; j++){
    if(tableRow[j].cells[1].textContent=="ВСЬОГО"){tableRow[j].parentElement.removeChild(tableRow[j]);break;}
        tableRow[j].cells[0].style.backgroundColor = '#ffffff';
        tableRow[j].cells[2].textContent=0;
        tableRow[j].cells[3].textContent=0;
        tableRow[j].cells[4].textContent=0;
    } 
  let spline,p0,p1,p2,p3,p4,ang,ang1,ang2,traktor;
  let UnionPolis=[];
  
  for (let i = 0; i < geo_splines.length; i++) {
    if(spisok.indexOf(geo_splines[i][0][1])<0) continue;

    for (let ii = 1; ii < geo_splines[i].length; ii++) {
      if(geo_splines[i][ii].length<2){
        geo_splines[i].splice(ii,1);
        ii--;
        continue;
      }
    for (let iii = 1; iii < geo_splines[i][ii].length; iii++) {
      p1 = turf.point(geo_splines[i][ii][iii-1]);
      p2 = turf.point(geo_splines[i][ii][iii]);
      if(turf.distance(p1, p2, {units: 'meters'})<2){
        geo_splines[i][ii].splice(iii, 1);
        iii--;
        if(geo_splines[i][ii].length<2){
          geo_splines[i].splice(ii,1);
          ii--;
          break;
        }
      }
    } 
    }
  }

 for (let i = 0; i < geo_splines.length; i++) {
  let polis=[];
   if(spisok.indexOf(geo_splines[i][0][1])>=0){
   traktor = geo_splines[i][0][1]; 
   for (let ii = 1; ii < geo_splines[i].length; ii++) {
     spline = geo_splines[i][ii];
     p0 = turf.point(spline[0]);
     p2 = turf.point(spline[1]);
     ang =turf.bearing(p0, p2);
     ang1=ang-90;
     if(ang1<-180)ang1=360+ang1;
     ang2 = ang+90;
     if(ang2>180)ang2=ang2-360;
     p1 = turf.destination(p0, zaxvat*0.5,ang2, {units: 'meters'});
     p2 = turf.destination(p0, zaxvat*0.5,ang1, {units: 'meters'});
     

        for (let iii = 1; iii < spline.length; iii++) {
          //if(turf.distance(p0, turf.point(spline[ii]), {units: 'meters'})<zaxvat)continue;
          p0 = turf.point(spline[iii]);
            if(iii==spline.length-1){
                p3 = turf.destination(p0, zaxvat*0.5,ang1, {units: 'meters'});
                p4 = turf.destination(p0, zaxvat*0.5,ang2, {units: 'meters'});
            }else{ 
              let point1 = turf.point(spline[iii-1]);
              let point2 = p0;
              let point3 = turf.point(spline[iii+1]);
              ang =turf.bearing(point1, point3);
              ang1=ang-90;
              if(ang1<-180)ang1=360+ang1;
              ang2 = ang+90;
              if(ang2>180)ang2=ang2-360;

              p3 = turf.destination(p0, zaxvat*0.5,ang1, {units: 'meters'});
              p4 = turf.destination(p0, zaxvat*0.5,ang2, {units: 'meters'});

            }

          let p2p3=turf.distance(p2, p3, {units: 'meters'});
          let p1p4=turf.distance(p1, p4, {units: 'meters'});

          if(p2p3<1 || p1p4<1)continue;
          let linestring1 = turf.lineString([ turf.getCoord(p2), turf.getCoord(p3)]);
          let linestring2 = turf.lineString([ turf.getCoord(p1), turf.getCoord(p4)]);
          
          let poliXY = [[turf.getCoord(p1), turf.getCoord(p2), turf.getCoord(p3), turf.getCoord(p4),turf.getCoord(p1)]];
          if(turf.booleanIntersects(linestring1, linestring2)){poliXY = [[turf.getCoord(p1), turf.getCoord(p2), turf.getCoord(p4), turf.getCoord(p3),turf.getCoord(p1)]];}

          let polygon = turf.polygon(poliXY,{ name: traktor });
          let options = {precision: 6, coordinates: 2};
          let polygon2 = turf.truncate(polygon, options);
          //let result = turf.unkinkPolygon(polygon);
          //let polylinee = L.geoJSON(polygon).addTo(map);
          //geo_layer.push(polylinee); 
          p1=p4;
          p2=p3;
          polis.push(polygon2);
      }

  } 
      let area = GetPoligonsArea(polis);
      let union =GetPoligonsUnions(polis);
      let areaU = GetPoligonsArea(union);
      let color='#'+(Math.random() * 0x1000000 | 0x1000000).toString(16).slice(1);
      union.forEach(function(pl) { 
        UnionPolis.push(pl); 
        let polylinee = L.geoJSON(pl,{ style: function (feature) { return {color: color};}}).addTo(map);
        geo_layer.push(polylinee); 
      });

      for ( j = 0; j < tableRow.length; j++){
        if(tableRow[j].cells[1].textContent==traktor){
          tableRow[j].cells[0].style.backgroundColor = color;
          tableRow[j].cells[2].textContent=area;
          tableRow[j].cells[3].textContent=(area-areaU).toFixed(2);
          tableRow[j].cells[4].textContent=areaU;
        }
      } 
    }
      if(i == geo_splines.length-1){
          let Aarea = GetPoligonsArea(UnionPolis);
          let Aunion =GetPoligonsUnions(UnionPolis);
          let AareaU = GetPoligonsArea(Aunion);
          $('#obrobkatehnika').append("<tr><td></td><td>ВСЬОГО</td><td>"+ Aarea +"</td><td>"+ (Aarea-AareaU).toFixed(2) +"</td><td>"+ AareaU +"</td><td><input type='checkbox'></td></tr>");

      }
  }
 
}
function GetPoligonsArea(poligons=[]){
  let area=0;
  poligons.forEach(function(poligon) { area+=turf.area(poligon)/10000; });
  area= area.toFixed(2);
  return area;
}
function GetPoligonsUnions(poligons=[]){
  for (let i = 0; i < poligons.length-1; i++){
    let poly1=poligons[i];
    for (let ii = i+1; ii < poligons.length-1; ii++){
      let poly2=poligons[ii];
      let union = turf.union(poly1, poly2);
      if(turf.getType(union)=="Polygon"){
        poligons[i]=union;
        poligons.splice(ii, 1);
        i--;
        break;
      }
    }
  }
  return poligons;
}



//=================Proverka Navigacii i Datchikov ===================================================================================
function track_TestNavigation(evt){
  [...document.querySelectorAll("tr")].forEach(e => e.style.backgroundColor = '');
  this.style.backgroundColor = 'pink';
   $("#lis0").chosen().val(this.id);     
   $("#lis0").trigger("chosen:updated");
   map.setView([parseFloat(this.id.split(',')[1]), parseFloat(this.id.split(',')[2])+0.001],10); 
    markerByUnit[this.id.split(',')[0]].openPopup();
    $("#lis0").chosen().val(this.id.split(',')[0]);
   $("#lis0").trigger("chosen:updated");
}

var nav_mark_data=[];
function TestNavigation(data){
  if ($('#unit_info').is(':hidden')) {
      $('#unit_info').show();
      $('#map').css('width', '60%'); 
      $('#men4').css({'background':'#b2f5b4'});
    }
    $("#unit_table").empty();
    $('#marrr').hide();
    $('#option').hide();
    $('#zupinki').hide();
    $('#palne').hide();
    $('#men3').css({'background':'#e9e9e9'});
    $('#men1').css({'background':'#e9e9e9'});
    
  let no_aktiv = [];
  let mark;
  for(var ii=0; ii < unitslist.length; ii++){

    if (Date.parse($('#fromtime2').val())/1000-3600> unitslist[ii].getPosition().t && unitslist[ii].getPosition().s>0){
        $("#unit_table").append("<tr class='fail_trak' id='"+unitslist[ii].getId()+"," + unitslist[ii].getPosition().y+","+unitslist[ii].getPosition().x+ "'><td>"+unitslist[ii].getName()+"</td><td>"+wialon.util.DateTime.formatTime(unitslist[ii].getPosition().t)+"</td><td>завис у русі</td></tr>");
          mark = L.marker([unitslist[ii].getPosition().y, unitslist[ii].getPosition().x], {icon: L.icon({iconUrl: '777.png', draggable: true, iconSize:   [24, 24],iconAnchor: [12, 24] })}).addTo(map);
          mark.bindPopup(unitslist[ii].getName() +'<br />'+wialon.util.DateTime.formatTime(unitslist[ii].getPosition().t)+'<br />'+unitslist[ii].getPosition().s+' км/год');
          nav_mark_data.push(mark);
          }
    if (Date.parse($('#fromtime1').val())/1000 > unitslist[ii].getPosition().t){ no_aktiv.push(unitslist[ii]); }
   
    
    }
   
  
  for (let i = 0; i < data.length; i++) {
    let pos=0;
    let nav=0;
    let row=0;
    let zapcarta=0;
    let namee = data[i][0][1];
   
    if(data[i][0][2].indexOf('Топливо')>=0 || data[i][0][2].indexOf('Паливо')>=0 || data[i][0][2].indexOf('ДРТ')>=0){}else continue;
    for (let ii = 1; ii < data[i].length; ii++) {
      if(namee.indexOf('Шкурат')>=0 || namee.indexOf('Білоус')>=0|| namee.indexOf('Колотуша')>=0|| namee.indexOf('Дробниця')>=0|| namee.indexOf('Писаренко')>=0|| namee.indexOf('Штацький')>=0|| namee.indexOf('ВМ4156ВС')>=0|| namee.indexOf('аправка')>=0){
         if(data[i][ii][4]  && zapcarta != data[i][ii][4]){
          zapcarta = data[i][ii][4];
          no_aktiv.forEach((element) => {if(element.getName().indexOf(zapcarta)>=0){
            $("#unit_table").append("<tr class='fail_trak' id='"+element.getId()+","  + element.getPosition().y+","+element.getPosition().x+ "'><td>"+element.getName()+"</td><td>"+data[i][ii][1]+"</td><td>"+ namee +"</td><td>заправлявся - дані не передає</td></tr>");
            mark = L.marker([element.getPosition().y, element.getPosition().x], {icon: L.icon({iconUrl: '666.png',draggable: true,iconSize:   [24, 24],iconAnchor: [12, 24] })}).addTo(map);
            mark.bindPopup(element.getName() +'<br />'+wialon.util.DateTime.formatTime(element.getPosition().t));
            nav_mark_data.push(mark);
          }});
         }
        }
       if (data[i][ii-1][0])if (data[i][ii][0]!=data[i][ii-1][0])pos++;
       if (data[i][ii-1][5])if (data[i][ii][5]!=data[i][ii-1][5])pos-=5;
       if (pos<0)pos=0;
       if (pos>2500)continue;
       if (data[i][ii][0])nav++;
        row++;
      }
      if(pos>2500) if(namee.indexOf('JD')>=0 || namee.indexOf(' CL ')>=0|| namee.indexOf('МТЗ')>=0||namee.indexOf('JCB')>=0|| namee.indexOf('Manitou')>=0 || namee.indexOf('Scorpion')>=0|| namee.indexOf('Камаз')>=0|| namee.indexOf('МАЗ')>=0 || namee.indexOf('SCANIA')>=0)$("#unit_table").append("<tr><td>"+namee+"</td><td>перевірте ДРП</td></tr>");
      if(row-nav>row*0.5)$("#unit_table").append("<tr><td>"+namee+"</td><td>перевірте GPS</td></tr>");
    }
}

//===================================================================

function Monitoring(){
let rows = document.querySelectorAll('#monitoring_table tr');
 for(let i = 0; i<Global_DATA.length; i++){
  if(Global_DATA[i].length<200)continue;
 let points = 0; 
 let spd = 0; 
 let stoyanka = 0;
 let sttime=$('#min_zup_mon').val()*60;
 let robota=0;
 let pereizd=0;
 let stroka=[];
 let nametr = Global_DATA[i][0][1];
 let id = Global_DATA[i][0][0];
 let str =$('#unit_monitoring').val().split(',');
 str.forEach((element) => {if(nametr.indexOf(element)>=0){
 pereizd=0;
 robota=0;
 stroka=[];
 
   
   for (let ii = Global_DATA[i].length-2; ii>10; ii-=30){
   points = 0;
   spd=0;
   stoyanka=0;
   if(!Global_DATA[i][ii][0])continue;
   if(!Global_DATA[i][ii-1][0])continue;
   if(!Global_DATA[i][ii+1][0])continue;
   let y = parseFloat(Global_DATA[i][ii][0].split(',')[0]);
   let x = parseFloat(Global_DATA[i][ii][0].split(',')[1]);



   let p0 = turf.point([x,y]);
   let p1 = turf.point([parseFloat(Global_DATA[i][ii+1][0].split(',')[1]),parseFloat(Global_DATA[i][ii+1][0].split(',')[0])]);
   let p2 = turf.point([parseFloat(Global_DATA[i][ii-1][0].split(',')[1]),parseFloat(Global_DATA[i][ii-1][0].split(',')[0])]);
   let ang =turf.bearing(p1, p2);
   let ang1=ang-90;
   if(ang1<-180)ang1=360+ang1;
   let ang2 = ang+90;
   if(ang2>180)ang2=ang2-360;
   p1 = turf.destination(p0, 70,ang2, {units: 'meters'});
   p2 = turf.destination(p0, 70,ang1, {units: 'meters'});

   let coord1 = turf.getCoord(p1);
   let coord2 = turf.getCoord(p2);
   //let circle1 = L.circle([coord1[1], coord1[0]], { color: 'red', fillColor: '#f03', fillOpacity: 0.5, radius: 100}).addTo(map);
   //let circle2 = L.circle([coord2[1], coord2[0]], { color: 'red', fillColor: '#f03', fillOpacity: 0.5, radius: 100}).addTo(map);
  


       for (let iii = ii-1; iii>0; iii--){
        if(stoyanka>sttime && ii-iii<100){ stoyanka=-1; points=-1;spd=-1;pereizd=0;robota=0; break; }
       if(Global_DATA[i][iii][3][0]=='0'){ 
        stoyanka+=(Global_DATA[i][iii+1][4]-Global_DATA[i][iii][4])/1000;
        spd--;
        continue; 
      }
       if(ii<20|| ii<1 || ii-iii>500){break;}
       let yy = parseFloat(Global_DATA[i][iii][0].split(',')[0]);
       let xx = parseFloat(Global_DATA[i][iii][0].split(',')[1]);
       if(wialon.util.Geometry.getDistance(y,x,yy,xx)<3){spd--;continue;}
       stoyanka=0;
       spd++;
       if(wialon.util.Geometry.getDistance(coord1[1],coord1[0],yy,xx)<70){points++;}
       if(wialon.util.Geometry.getDistance(coord2[1],coord2[0],yy,xx)<70){points++;}
       }
       //let tooltipp = L.tooltip([y,x], {content: ""+points+"",permanent: true}).addTo(map);
      
    if(points==0 && spd>0){pereizd++;robota=0;}
    if(points>10){robota++;pereizd=0;}

      if(stoyanka==-1){
      if(stroka.length>0){
      if(stroka[stroka.length-1]!='сто'){
      stroka.push('сто');
      }
      }
      }

     if(pereizd==5){
     if(stroka.length>0){
     if(stroka[stroka.length-1]!='пер'){
     stroka.push('пер');
     }
     }else{
      stroka.push('пер');
     }
     }
     if(robota==2){
     if(stroka.length>0){
      let nn = 'роб <br>' + PointInField(y,x);
     if(stroka[stroka.length-1]!=nn){
     stroka.push(nn);
     if ($("#robviz_gif").is(":checked")) {
    let markerrr = L.marker([y,x]).addTo(map);
     markerrr.bindPopup(""+nametr+"");
     zup_mark_data.push(markerrr);
     }
     }
     }else{
      let nn = 'роб <br>' + PointInField(y,x);
      stroka.push(nn);
      if ($("#robviz_gif").is(":checked")) {
      let markerrr = L.marker([y,x]).addTo(map);
       markerrr.bindPopup(""+nametr+"");
       zup_mark_data.push(markerrr);
       }
     }
     }
    
 }
 
  if(stroka.length>0){
  
  
  let strr="";
 if(rows.length>0){
  for(let v = 0; v<rows.length; v++){
  if(rows[v].cells[0].textContent==nametr.split(' ')[0]+' '+nametr.split(' ')[1]+''+Global_DATA[i][Global_DATA[i].length-1][5].split(' ')[0]){
   let ind=stroka.length-(rows[v].cells.length-1);

   //if(ind<=0){
   //if(rows[v].cells[1].textContent!=stroka[0]){
   //rows[v].cells[1].textContent=stroka[0];
   //rows[v].cells[1].style.backgroundColor = "#f8b1c0";
  // }
   //}
   for(let vv = ind-1; vv>=0; vv--){
    if(rows[v].cells[1].innerHTML!=stroka[vv]){
    rows[v].insertCell(1);
    rows[v].cells[1].innerHTML=stroka[vv];
    rows[v].cells[1].style.backgroundColor = "#f8b1c0";
    }  
   }
   break;
  }else{
    if(v==rows.length-1){
   for(let v = 0; v<stroka.length; v++){strr+= "<td bgcolor = '#f8b1c0'>"+stroka[v]+"</td>";}
    $("#monitoring_table").append("<tr id="+id+"><td>"+nametr.split(' ')[0]+' '+nametr.split(' ')[1]+'<br>'+Global_DATA[i][Global_DATA[i].length-1][5].split(' ')[0]+"</td>"+strr+"</tr>");
       }
   }
  }
  }else{
  for(let v = 0; v<stroka.length; v++){strr+= "<td bgcolor = '#f8b1c0'>"+stroka[v]+"</td>";}
    $("#monitoring_table").append("<tr id="+id+"><td>"+nametr.split(' ')[0]+' '+nametr.split(' ')[1]+'<br>'+Global_DATA[i][Global_DATA[i].length-1][5].split(' ')[0]+"</td>"+strr+"</tr>");
  }
 }
}});
}
}
function PointInField(y,x){

  for (let i = 0; i < geozones.length; i++) {
    let zonee = geozones[i].zone;
    let name = zonee.n;
    let point = zonee.p;
    let ba=zonee.b;
    //console.log(point);
    if(name[0]=='2' || name[0]=='1' || name[0]=='5') continue;
    if(wialon.util.Geometry.pointInShape(point, 0, x, y,ba)){
      return name.split(' ')[0];
    }
 }
 return 'невідомо';

}


function track_Monitoring(evt){
  // [...document.querySelectorAll("tr")].forEach(e => e.style.backgroundColor = '');
   if(evt.target.cellIndex>0){
   if(evt.target.style.backgroundColor == 'transparent'){
   evt.target.style.backgroundColor = '#FFFF00';
   }else{
    evt.target.style.backgroundColor = 'transparent';
   }
   }else{
   $("#lis0").chosen().val(evt.target.parentNode.id);
   $("#lis0").trigger("chosen:updated");
   layers[0]=0;
   show_track();
   markerByUnit[evt.target.parentNode.id].openPopup();
   }
     
 }
//====================zalishki palnogo================================
let bufer=[];
let garbage =[];
let garbagepoly =[];
let buferpoly=[];

function RemainsFuel(e){
//let cir = L.circle(e.latlng, {radius: 2000}).addTo(map);
let str =$('#unit_palne').val().split(',');
 bufer.push(e.latlng);
 buferpoly.push({x:e.latlng.lat, y:e.latlng.lng}); 
 if(bufer.length>1){
 let line = L.polyline([bufer[bufer.length-2],bufer[bufer.length-1]], {opacity: 0.3, color: '#0000FF'}).addTo(map);
 garbage.push(line);

 if(wialon.util.Geometry.getDistance(bufer[0].lat, bufer[0].lng,bufer[bufer.length-1].lat, bufer[bufer.length-1].lng)<2000){
 if(bufer.length>2){
  let color='#'+(Math.random() * 0x1000000 | 0x1000000).toString(16).slice(1);
  let polygon = L.polygon(bufer, {color: color}).addTo(map);
  garbagepoly.push(polygon);
    for(let i = 0; i<unitslist.length; i++){
      let namet = unitslist[i].getName();
      str.forEach((element) => {if(namet.indexOf(element)>=0){
        let markerr= markerByUnit[unitslist[i].getId()];
        if(markerr){
         let lat = markerr.getLatLng().lat;
         let lon = markerr.getLatLng().lng;
          if(wialon.util.Geometry.pointInShape(buferpoly, 0, lat, lon)){
            let agregat = markerr._popup._content.split('<br />')[4];
            if(agregat)agregat=agregat.split(' ')[0];
            if(!agregat){
              agregat="-----";
              if(namet.indexOf('JCB')>0|| namet.indexOf('Manitou')>0 || namet.indexOf('Scorpion')>0)agregat="погрузчик";
              if(namet.indexOf('CASE 4430')>0 || namet.indexOf('R4045')>0|| namet.indexOf('612R')>0)agregat="обприскувач";
            }
            let drp = markerr._popup._content.split('<br />')[3]; 
            if(!drp)drp="-----";else drp=drp.split('.')[0];
            let mesto = "-----";
           
            for(let i = 0; i<geozonesgrup.length; i++){ 
              let cord= geozonesgrup[i].toGeoJSON().features[0];
              let buferpoly2 =[];
              if(cord){
                
                cord.geometry.coordinates[0].forEach(function(item, arr) {
                  buferpoly2.push({x:item[1], y:item[0]}); 
                });
                if(wialon.util.Geometry.pointInShape(buferpoly2, 0, lat, lon)){
                  mesto=geozonesgrup[i]._tooltip._content;
                  break;
                }
              }
            }
            
            $("#palne_table").append("<tr class='fail_trak' id='"+unitslist[i].getId()+"," + lat+","+lon+ "'><td bgcolor ="+color+">&nbsp&nbsp&nbsp&nbsp&nbsp</td><td>"+namet+"</td><td>"+agregat+"</td><td>"+drp+"</td><td>"+mesto+"</td></tr>");

          }
        } 
      }});
        
    }


 }

 clearGarbage(garbage);
 bufer=[];
 buferpoly=[];

 }else{ var tooltip = L.tooltip(bufer[0], {content: 'end'}).addTo(map);}
 }else{ 
  var tooltip = L.tooltip(e.latlng, {content: 'start'}).addTo(map);
  bufer=[];
  buferpoly=[];
  bufer.push(e.latlng);
  buferpoly.push({x:e.latlng.lat, y:e.latlng.lng}); 
}
}

//if(wialon.util.Geometry.pointInShape(geozonepoint, 0, lat, lon)){

function clearGarbage(garbage){
  for(var i=0; i < garbage.length; i++){
    map.removeLayer(garbage[i]);
     if(i == garbage.length-1){garbage.length=0;}
    }
}

function Motogod(){
$("#unit_table").empty();
  $("#unit_table").append("<tr><td>ТЗ</td><td>ЧАС</td><td>ЛІТРИ</td></tr>");
let str =$('#unit_prMot').val().split(',');
for(let i = 0; i<Global_DATA.length; i++){
let nametr = Global_DATA[i][0][1];
let litry=0;
let prostoy=0;
str.forEach((element) => {if(nametr.indexOf(element)>=0){
 litry=0;
 prostoy=0;
 for (let ii = 0; ii<Global_DATA[i].length-11; ii++){
 if(!Global_DATA[i][ii][3])continue;
 if(!Global_DATA[i][ii+10][3])continue;
 if(!Global_DATA[i][ii][4])continue;
 if(!Global_DATA[i][ii+10][4])continue;
 if(!Global_DATA[i][ii][2])continue;
 if(!Global_DATA[i][ii+10][2])continue;
 
 
  if(Global_DATA[i][ii][3][0]==0 && Global_DATA[i][ii+10][3][0]==0){
 let ras =(Global_DATA[i][ii][2]-Global_DATA[i][ii+10][2])/((Global_DATA[i][ii+10][4]-Global_DATA[i][ii][4])/3600000);
  if(ras<10 && ras>2){
  litry+=Global_DATA[i][ii][2]-Global_DATA[i][ii+10][2];
  prostoy+=(Global_DATA[i][ii+10][4]-Global_DATA[i][ii][4])/1000;
  ii+=9;
  
  }
  }
 }
 
  let m = Math.trunc(prostoy / 60) + '';
  let h = Math.trunc(m / 60) + '';
  m=(m % 60) + '';

  if(litry>0){$("#unit_table").append("<tr><td>"+nametr+"</td><td>"+h.padStart(2, 0) + ':' + m.padStart(2, 0) +"</td><td>"+ Math.round(litry) +"</td></tr>");
}
  
}});
}
}


function tehnika_poruch(name,y,x,time){ 
  for(let i = 0; i<Global_DATA.length; i++){
    if(name==Global_DATA[i][0][1]) continue;
    for (let ii = Global_DATA[i].length-1; ii>=0; ii--){
       if(time>Global_DATA[i][ii][4]){
        let yy = parseFloat(Global_DATA[i][ii][0].split(',')[0]);
        let xx = parseFloat(Global_DATA[i][ii][0].split(',')[1]);
        if(wialon.util.Geometry.getDistance(y,x,yy,xx)<100){ return true; }else {break};
      }
    }
  }
  return false;
}
