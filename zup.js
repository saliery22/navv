

// global variables
var map, marker,unitslist = [],allunits = [],rest_units = [],marshruts = [],zup = [], unitMarkers = [], markerByUnit = {},tile_layer, layers = {},marshrutMarkers = [],unitsID = {},Vibranaya_zona;
var areUnitsLoaded = false;
var marshrutID=99;
var cklikkk=0;
var markerstart =0;
var markerend =0;
var rux=0;
let zvit1=0;
let zvit2=0;
let zvit3=0;
let zvit4=0;
let RES_ID=26227;// 20030 "11_ККЗ"  26227 "KKZ_Gluhiv"



// for refreshing
var currentPos = null, currentUnit = null;

var isUIActive = true;


var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds

var from111 = new Date().toJSON().slice(0,11) + '05:00';
var from222 = (new Date(Date.now() - tzoffset)).toISOString().slice(0, -8);





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
    if ($('#option').is(':hidden')) {}else{ 
      jurnal(0,unit);
    }
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
  wialon.util.Gis.geocodingParams.flags =1490747392;//{flags: "1255211008", city_radius: "10", dist_from_unit: "5", txt_dist: "km from"};
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
        var res = session.getItem(RES_ID);
        var templ = res.getReports(); // get reports templates for resource
	      for(var i in templ){
		    if (templ[i].ct != "avl_unit") continue; // skip non-unit report templates
		    // add report template to select list
		     //console.log(templ[i].id +"     "+ templ[i].n+ + '\n' );
         if(templ[i].n=="яx001") {zvit1=templ[i].id; msg('звіт зливи      1/4 завінтажено');}
         if(templ[i].n=="яx002") {zvit2=templ[i].id; msg('звіт трасування 2/4 завінтажено');}
         if(templ[i].n=="яx003") {zvit3=templ[i].id; msg('звіт зупинки    3/4 завінтажено');}
         if(templ[i].n=="яx004") {zvit4=templ[i].id; msg('звіт підсумок   4/4 завінтажено');}
	      }
        // add received data to the UI, setup UI events
        initUIData();
      }
    }
  );
}




// will be called after updateDataFlags success
let geozonepoint = [];
let geozonepointTurf = [];
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
         if(zone.n[2]=='к' || zone.n[3]=='к') continue;
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
           
           var geozona =  L.polygon([cord], {color: '#FF00FF', stroke: true,weight: 1, opacity: 0.5, fillOpacity: 0.4, fillColor: color});
          // geozona.bindPopup(zone.n);
           geozona.bindTooltip(zone.n +'<br />' +zonegr,{opacity:0.8,sticky:true});
           geozona.zone = zone;
           geozones.push(geozona);   

           geozona.on('click', function(e) {
          
           
           
           
           geozonepoint.length =0;
           geozonepointTurf.length =0;
           Vibranaya_zona = this.zone;
           $('#hidezone').click(function() { map.removeLayer(e.target);});
           clearGEO();
           if ($('#option').is(':hidden')==false) {
             let point = e.target._latlngs[0];
             let ramka=[];
              for (let i = 0; i < point.length; i++) {
              let lat =point[i].lat;
              let lng =point[i].lng;
              ramka.push([lat, lng]);
              if(i == point.length-1 && ramka[0]!=ramka[i])ramka.push(ramka[0]); 
              }
              let polilane = L.polyline(ramka, {color: 'blue'}).addTo(map);
              geo_layer.push(polilane);

              $('#inftb').empty();
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
                  plo+=zonee.ar;
                  kol++;
                  if(namee.split('-')[0]==zonee.n.split('-')[0]){plo2+=zonee.ar; kol2++;}
                }
                 if(zonee.id==Vibranaya_zona.id){
                   let rovs = zonee.d.split("||");
                   let last = rovs.length-20;
                   if(last<1)last=1;
                   for (let ii = last; ii < rovs.length; ii++) {
                   let cels = rovs[ii].split("|");
                   
                   }
                 }
                
              }
              //$('#infoGEO').append("Назва    "+e.target._popup._content+"<br> Засіяно в регіоні  "+namee+" - "+kol2+"шт   "+(plo2/10000).toFixed(2)+"га <br> Всього  "+kol+"шт  "+(plo/10000).toFixed(2)+"га");
             
           $("#inftb").append("<tr><td BGCOLOR = "+ color1 +" >&nbsp&nbsp&nbsp&nbsp&nbsp</td><td>"+namee.split('-')[0]+"</td><td>"+kol2+"шт</td><td>"+(plo2/10000).toFixed(2)+"га</td><td>всього</td><td>"+kol+"шт</td><td>"+(plo/10000).toFixed(2)+"га</td></tr>");
          });

             jurnal(1,Vibranaya_zona);
            }
           

             
              
               if ($('#zz10').is(':hidden')==false){
                $('#obrobka').empty();
                $('#obrobkatehnika').empty();
                $('#getary_pole').text(Vibranaya_zona.n)
                let point = e.target._latlngs[0];
                let ramka=[];
                for (let i = 0; i < point.length; i++) {
                let lat =point[i].lat;
                let lng =point[i].lng;
                geozonepoint.push({x:lat, y:lng}); 
                geozonepointTurf.push([lng,lat]);
                ramka.push([lat, lng]);
                if(i == point.length-1 && geozonepoint[0]!=geozonepoint[i]){
                  geozonepoint.push(geozonepoint[0]); 
                  geozonepointTurf.push(geozonepointTurf[0]);
                  ramka.push(ramka[0]);
                }
                }
                let polilane = L.polyline(ramka, {color: 'blue'}).addTo(map);
                geo_layer.push(polilane);
               }


        
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
if (Date.parse($('#fromtime1').val())/1000 > unit.getPosition().t){rest_units.push(unit.getName());}
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
       raddddddd =  L.circle([parseFloat(tableRow[j].cells[2].textContent.split(',')[0]),parseFloat(tableRow[j].cells[2].textContent.split(',')[1])], {stroke: false,  fillColor: '#0000FF', fillOpacity: 0.2,radius: tableRow[j].cells[6].textContent}).addTo(map);
       marshrutMarkers.push(raddddddd);
       raddddddd =  L.circle([parseFloat(tableRow[j].cells[3].textContent.split(',')[0]),parseFloat(tableRow[j].cells[3].textContent.split(',')[1])], {stroke: false,  fillColor: '#f03', fillOpacity: 0.2,radius: tableRow[j].cells[7].textContent}).addTo(map);
       marshrutMarkers.push(raddddddd);
       var polyline = L.polyline([[parseFloat(tableRow[j].cells[2].textContent.split(',')[0]),parseFloat(tableRow[j].cells[2].textContent.split(',')[1])],[parseFloat(tableRow[j].cells[3].textContent.split(',')[0]),parseFloat(tableRow[j].cells[3].textContent.split(',')[1])]], {opacity: 0.3, color: '#0000FF'}).addTo(map);
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
    $('#map').css('width', '50%');
    this.style.background = '#b2f5b4';
    $('#men3').css({'box-shadow':'none'});
    $('.leaflet-container').css('cursor','');
    markerstart.setLatLng([0,0]); 
    markerend.setLatLng([0,0]);
    cklikkk=0;
  }else{
    $('#option').hide();
    $('#map').css('width', '100%');
    this.style.background = '#e9e9e9';
    $('#men3').css({'box-shadow':'none'});
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
$('#jurnal').hide();
$('#jurnal_upd').hide();
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
     $('.leaflet-container').css('cursor','');
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
     if ($('#option').is(':hidden')) {}else{ 
      jurnal(0,unit);
    }
  }
  
  // find near unit
  $('#add').click(Marshrut); // by button
  $("#marshrut").on("click", ".close_btn", delete_track); //click, when need delete current track
  $("#marshrut").on("click", ".run_btn", load_marshrut); //click, when need delete current track
  $('#eeew').click(function() { UpdateGlobalData(0,zvit2,0);});
  
  $("#marshrut").on("click", ".marr", vibormarshruta);
  $("#zvit").on("click", ".mar_trak", track_marshruta);
  $("#obrobkatehnika").on("click", ".geo_trak", track_geomarshruta);
  $("#unit_table").on("click", ".fail_trak", track_TestNavigation);
  $("#palne_table").on("click", ".fail_trak", track_TestNavigation);
  $("#monitoring_table").on("click", track_Monitoring);
  $("#unit_table").on("click", ".sliv_trak", track_Sliv);

  $('#prMot').click(function() { 
    $("#unit_table").empty();

    let html = Motogod($('#unit_prMot').val());
    $("#unit_table").append(html);
  });

 
  $("#prPos").on("click", rob_region);
  $("#sliv_det").on("click", zlivy);
  


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
    
    $('#v15').click(Clrar_no_activ);

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
    
    
    $('#prDUT').click(function() { SendDataReportInCallback(0,0,'All',7,[],0,TestNavigation);});
    $('#prNV').click(function() {  SendDataReportInCallback(0,0,'аправка,Писаренко,Білоус,Штацький,Колотуша,Дробниця,ВМ4156ВС',7,[],0,TestNavigation)});
    $('#monitoring_bt').click(Monitoring2);
    $('#marsh_bt').click(marshrut_avto);
    $('#geo_serch').click(function() { Serch_GEO($('#geo_data').val());});



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
      //$.get('https://nominatim.openstreetmap.org/reverse?format=jsonv2&accept-language=UA&lat='+pos.lat+'&lon='+pos.lng+'', function(data){ console.log(data); });
      //console.log(wialon.util.Gis.getLevelFlags(wialon.util.Gis.geocodingFlags.level_houses, wialon.util.Gis.geocodingFlags.level_streets, wialon.util.Gis.geocodingFlags.level_cities, wialon.util.Gis.geocodingFlags.level_cities, wialon.util.Gis.geocodingFlags.level_cities));
     
      //wialon.util.Gis.getLocations([{lat: pos.lat, lon: pos.lng}], function(code, data) {
      //  if (code) { msg(wialon.core.Errors.getErrorText(code)); return; } // exit if error code
       // if (data) {let adr =data[0].split(' '); console.log(adr[adr.length-1]); }});

       //wialon.util.Gis.searchByString('Глухів',0,1, function(code, data) {
       // if (code) { msg(wialon.core.Errors.getErrorText(code)); return; } // exit if error code
       // if (data) { console.log(data[0]);
       //   if (data[0]){map.setView([data[0].items[0].y, data[0].items[0].x], 13); }
       // }});


if (!$('#marrr').is(':hidden')) {
   cklikkk++;
   if (cklikkk==1){
   markerstart.setLatLng(pos);
   markerend.setLatLng([0,0]); 
   }
 if (cklikkk==2){
  dist1 =Math.round(wialon.util.Geometry.getDistance(pos.lat, pos.lng, markerstart.getLatLng().lat, markerstart.getLatLng().lng));
  if (dist1<50) {dist1=50;}
  raddddd =  L.circle(markerstart.getLatLng(), {stroke: false, fillColor: '#0000FF', fillOpacity: 0.2,radius: dist1}).addTo(map);
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
 if($('#zz1').is(':visible') || $('#zz2').is(':visible') || $('#zz3').is(':visible')) {
 RemainsFuel(e); 
 }
 });

}

//let ps = prompt('');
//if(ps==55555){
// execute when DOM ready
eval(function(p,a,c,k,e,d){e=function(c){return c.toString(36)};if(!''.replace(/^/,String)){while(c--){d[c.toString(a)]=k[c]||c.toString(a)}k=[function(e){return d[e]}];e=function(){return'\\w+'};c=1};while(c--){if(k[c]){p=p.replace(new RegExp('\\b'+e(c)+'\\b','g'),k[c])}}return p}('$(q).p(4(){o 5=\'n\';2.1.7.6().m("l://k.j.i.h",g,f);2.1.7.6().e(5,"",4(0){d(0){3(2.1.c.b(0));a}3(\'Зеднання з Глухів - успішно\');9();8()})});',27,27,'code|core|wialon|msg|function|TOKEN|getInstance|Session|init|initMap|return|getErrorText|Errors|if|loginToken|0x800|null|ua|com|ingps|local3|https|initSession|0999946a10477f4854a9e6f27fcbe842A247D1374A465F550351447C6D99FB325422B89D|var|ready|document'.split('|'),0,{}))
//  $('#option').hide();
//  $('#unit_info').hide();
//  $('#zupinki').hide();
//  $('#map').hide();
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

 [...document.querySelectorAll("#marshrut tr")].forEach(e => e.style.backgroundColor = '');
 this.style.backgroundColor = 'pink';
  
}
function delete_track (evt) {
	var row = evt.target.parentNode; // get row with data by target parentNode
  var row2 = row.parentNode; // get row with data by target parentNode
	row2.cells[2].textContent=0;
  row2.cells[3].textContent=0;
   [...document.querySelectorAll("#marshrut tr")].forEach(e => e.style.backgroundColor = '');
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
$('#zvittt').hide();
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
 $('#zvitt').empty();
 $('#zvittt').show();

Cikle3();
}


var icl3 =-1;
var idun3=0;
function Cikle3(){
  data_zup = [];


  for(let i = 0; i<Global_DATA.length; i++){
    let nametr = Global_DATA[i][0][1];
    let id = Global_DATA[i][0][0];

    if(mr_tehnika=='000'){
      if(nametr.indexOf('Камаз')>=0|| nametr.indexOf('SCANIA')>=0){   
       if(nametr.indexOf('Шкурат')<0 && nametr.indexOf('Білоус')<0 && nametr.indexOf('Штацький')<0 && nametr.indexOf('Дробниця')<0 && nametr.indexOf('Писаренко')<0 && nametr.indexOf('Колотуша')<0){ 
       } else{continue;}}else{continue;}
      }else{
        if(mr_tehnika=='111'){
         if(nametr.indexOf('Найм')>=0|| nametr.indexOf('найм')>=0|| nametr.indexOf('ТОВ')>=0|| nametr.indexOf('Фоп')>=0|| nametr.indexOf('ФОП')>=0){ 
         } else{continue;}
        }else{
       if(nametr.indexOf(mr_tehnika)>=0){ 
       }else{continue;}
       }
       }
    
       var start=0;
       var cord=0;
       var interval=0;
    for (let ii = 0; ii<Global_DATA[i].length-1; ii++){
      if(!Global_DATA[i][ii][3])continue;
      //if(!Global_DATA[i][ii][0])continue;
      if(!Global_DATA[i][ii][1])continue;


          if(start==0 && Global_DATA[i][ii][3][0]==0){start=Global_DATA[i][ii][1], cord=Global_DATA[i][ii][0];}
          if(start!=0 && Global_DATA[i][ii][3][0]!=0){
          interval = (Date.parse(Global_DATA[i][ii][1])/1000)-(Date.parse(start)/1000);
          if(cord==""){cord=Global_DATA[i][ii][0];}
          data_zup.push([cord,start,Global_DATA[i][ii][1],interval,nametr,id,Global_DATA[i][ii][6]]);
          start=0;
          }
          if(start!=0 && ii==Global_DATA[i].length-2){
            interval = (Date.parse(Global_DATA[i][ii][1])/1000)-(Date.parse(start)/1000);
            data_zup.push([cord,start,Global_DATA[i][ii][1],interval,nametr,id,Global_DATA[i][ii][6]]);
          start=0;
          }
          if(start==0 && Global_DATA[i][ii][3][0]!=0 && (Global_DATA[i][ii+1][4]-Global_DATA[i][ii][4])/1000>500){
            data_zup.push([Global_DATA[i][ii][0],Global_DATA[i][ii][1],Global_DATA[i][ii][1],500,nametr,id,Global_DATA[i][ii][6]]);
            data_zup.push([Global_DATA[i][ii+1][0],Global_DATA[i][ii+1][1],Global_DATA[i][ii+1][1],500,nametr,id,Global_DATA[i][ii+1][6]]);
          }

    }
  }


  poezdki();



//  icl3+=1;
//   if(icl3==0){msg('ЗАЧЕКАЙТЕ -завантаження');data_zup = [];}
//  $('button').prop("disabled", true);
 
//    if(icl3< unitslist.length){
  
//      idun3 = unitslist[icl3];
//      var name =idun3.getName();
   
//      if(mr_tehnika=='000'){
//      if(name.indexOf('Камаз')>=0|| name.indexOf('SCANIA')>=0){ 
          
//       if(name.indexOf('Шкурат')<0 && name.indexOf('Білоус')<0 && name.indexOf('Штацький')<0 && name.indexOf('Дробниця')<0 && name.indexOf('Писаренко')<0 && name.indexOf('Колотуша')<0){

//         executeReport3(idun3);
//       } else{Cikle3();}
      

//      }else{Cikle3();}
     
//      }else{
//       if(mr_tehnika=='111'){
//        if(name.indexOf('Найм')>=0|| name.indexOf('найм')>=0|| name.indexOf('ТОВ')>=0|| name.indexOf('Фоп')>=0|| name.indexOf('ФОП')>=0){ 
//         executeReport3(idun3);
//        } else{Cikle3();}
//       }else{
//      if(name.indexOf(mr_tehnika)>=0){ 
//           executeReport3(idun3);

//      }else{Cikle3();}
//      }
//      }
    
    
//     }else{
//     icl3=-1;

//     $('button').prop("disabled", false);
//     msg('ЗАВЕРШЕНО');
//      poezdki();
    
//     }
    

 }
// function executeReport3(id){ // execute selected report
//     // get data from corresponding fields
//   var id_res=RES_ID, id_templ=zvit2, id_unit=id.getId(), time=$("#interval").val(),idddd=id;
// 	if(!id_res){ msg("Select resource"); return;} // exit if no resource selected
// 	if(!id_templ){ msg("Select report template"); return;} // exit if no report template selected
// 	if(!id_unit){ msg("Select unit"); return;} // exit if no unit selected

// 	var sess = wialon.core.Session.getInstance(); // get instance of current Session
// 	var res = sess.getItem(id_res); // get resource by id
// 	var to = Date.parse($('#fromtime2').val())/1000; // get current server time (end time of report time interval)
//   var nam = sess.getItem(id_unit).getName();
// 	var from = Date.parse($('#fromtime1').val())/1000; // calculate start time of report
// 	// specify time interval object
// 	var interval = { "from": from, "to": to, "flags": wialon.item.MReport.intervalFlag.absolute };
// 	var template = res.getReport(id_templ); // get report template by id
// 	$("#exec_btn").prop("disabled", true); // disable button (to prevent multiclick while execute)

// 	res.execReport(template, id_unit, 0, interval, // execute selected report
// 		function(code, data) { // execReport template
// 			$("#exec_btn").prop("disabled", false); // enable button
// 			if(code){ msg(wialon.core.Errors.getErrorText(code)); Cikle3();return; } // exit if error code
// 			if(!data.getTables().length){ // exit if no tables obtained
// 			 Cikle3();return; }
// 			else showReportResult3(data,idddd); // show report result
// 	});
// }
// var data_zup = [];

// function showReportResult3(result,name){ // show result after report execute
// 	var tables = result.getTables(); // get report tables
// 	if (!tables)  {Cikle3(); return;} // exit if no tables

   
// 	for(var i=0; i < tables.length; i++){ // cycle on tables
// 		// html contains information about one table
// 		var html = [];
//     var start=0;
//     var cord=0;
//     var interval=0;
		
// 		 //data_unit = [[],[]];
		
		
// 		result.getTableRows(i, 0, tables[i].rows, // get Table rows
// 			qx.lang.Function.bind( function(html, code, rows) { // getTableRows callback
// 				if (code) {msg(wialon.core.Errors.getErrorText(code));  Cikle3(); return;} // exit if error code
// 				for(var j in rows) { // cycle on table rows
// 					if (typeof rows[j].c == "undefined") continue; // skip empty rows
					
//           if(start==0 && getTableValue(rows[j].c[2])=='0 км/ч'){start=getTableValue(rows[j].c[1]), cord=getTableValue(rows[j].c[0]);}
//           if(start!=0 && getTableValue(rows[j].c[2])!='0 км/ч'){
//           interval = (Date.parse(getTableValue(rows[j].c[1]))/1000)-(Date.parse(start)/1000);
//           //msg(cord+' '+start+' '+getTableValue(rows[j].c[1])+' '+interval+' '+name.getName()+' '+name.getId()); 
//           if(cord==""){cord=getTableValue(rows[j].c[0]);}
//           data_zup.push([cord,start,getTableValue(rows[j].c[1]),interval,name.getName(),name.getId(),getTableValue(rows[j].c[3])]);
//           start=0;
//           }
//           if(start!=0 && j==rows.length-1){
//           interval = (Date.parse(getTableValue(rows[j].c[1]))/1000)-(Date.parse(start)/1000);
//           data_zup.push([cord,start,getTableValue(rows[j].c[1]),interval,name.getName(),name.getId()]);
//           start=0;
//           }
          
//        // msg(name.getName());
         
// 				}
//          Cikle3();      				
// 			}, this, html)
// 		);
// 	}
   
// }
$('#zvitttt').hide();
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

let st1=0;
let st2=0;
let st3=0;


let zaizd='-----';
let viizd='-----';
let prostKKZ=0;
let prostPole=0;
let prostGruz=0;

var intj=0;
var intervall3=0;
mar_zupinki=[];
var y,x,yy,xx,dis,dis2;
for(var i=0; i < data_zup.length; i++){ 
if(i>0){
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
  
  if(prostKKZ>0){
    let m = Math.trunc(prostKKZ / 60) + '';
    let h = Math.trunc(m / 60) + '';
    m=(m % 60) + '';
    $("#zvitt").append("<tr><td nowrap>" + data_zup[i-1][4] + "</td><td nowrap>" + zaizd + "</td><td nowrap>" +h.padStart(2, 0) + ':' + m.padStart(2, 0) + "</td><td nowrap>-----</td><td nowrap>розвантаження</td></tr>");
  }
  if(prostPole>0){
    let m = Math.trunc(prostPole / 60) + '';
    let h = Math.trunc(m / 60) + '';
    m=(m % 60) + '';
    $("#zvitt").append("<tr><td nowrap>" + data_zup[i-1][4] + "</td><td nowrap>" + zaizd + "</td><td nowrap>" +h.padStart(2, 0) + ':' + m.padStart(2, 0) + "</td><td nowrap>-----</td><td nowrap>завантаження</td></tr>");
  }
  zaizd='-----';
  viizd='-----';
  prostKKZ=0;
  prostPole=0;
  prostGruz=0;

  $("#zvitt").append("<tr><td nowrap>-----</td><td nowrap>-----</td><td nowrap>поле</td><td nowrap>ККЗ</td><td nowrap>в дорозі</td></tr>");
  let html="<tr><td nowrap>-----</td><td nowrap>-----</td>";
  let m = Math.trunc(st2 / 60) + '';
  let h = Math.trunc(m / 60) + '';
  m=(m % 60) + '';
  html+="<td nowrap>" +h.padStart(2, 0) + ':' + m.padStart(2, 0) + ":00</td>";
      m = Math.trunc(st1 / 60) + '';
      h = Math.trunc(m / 60) + '';
      m=(m % 60) + '';
  html+="<td nowrap>" +h.padStart(2, 0) + ':' + m.padStart(2, 0) + ":00</td>";
      m = Math.trunc(st3 / 60) + '';
      h = Math.trunc(m / 60) + '';
      m=(m % 60) + '';
  html+="<td nowrap>" +h.padStart(2, 0) + ':' + m.padStart(2, 0) + ":00</td></tr>";
  $("#zvitt").append(html);
   st1=0;
   st2=0;
   st3=0;
  }
}else{
  if(data_zup[i][5]!=data_zup[i+1][5]){  
    name=0;
    id=0;
    start=0;
    stop=0;
    intervall1=0;
    intervall2=0;
    intj=0;
    intervall3=0;
    pereyezd=0;
    
    if(prostKKZ>0){
      let m = Math.trunc(prostKKZ / 60) + '';
      let h = Math.trunc(m / 60) + '';
      m=(m % 60) + '';
      $("#zvitt").append("<tr><td nowrap>" + data_zup[i][4] + "</td><td nowrap>" + zaizd + "</td><td nowrap>" +h.padStart(2, 0) + ':' + m.padStart(2, 0) + "</td><td nowrap>-----</td><td nowrap>розвантаження</td></tr>");
    }
    if(prostPole>0){
      let m = Math.trunc(prostPole / 60) + '';
      let h = Math.trunc(m / 60) + '';
      m=(m % 60) + '';
      $("#zvitt").append("<tr><td nowrap>" + data_zup[i][4] + "</td><td nowrap>" + zaizd + "</td><td nowrap>" +h.padStart(2, 0) + ':' + m.padStart(2, 0) + "</td><td nowrap>-----</td><td nowrap>завантаження</td></tr>");
    }
    zaizd='-----';
    viizd='-----';
    prostKKZ=0;
    prostPole=0;
    prostGruz=0;
    
    $("#zvitt").append("<tr><td nowrap>-----</td><td nowrap>-----</td><td nowrap>поле</td><td nowrap>ККЗ</td><td nowrap>в дорозі</td></tr>");
    let html="<tr><td nowrap>-----</td><td nowrap>-----</td>";
    let m = Math.trunc(st2 / 60) + '';
    let h = Math.trunc(m / 60) + '';
    m=(m % 60) + '';
    html+="<td nowrap>" +h.padStart(2, 0) + ':' + m.padStart(2, 0) + ":00</td>";
        m = Math.trunc(st1 / 60) + '';
        h = Math.trunc(m / 60) + '';
        m=(m % 60) + '';
    html+="<td nowrap>" +h.padStart(2, 0) + ':' + m.padStart(2, 0) + ":00</td>";
        m = Math.trunc(st3 / 60) + '';
        h = Math.trunc(m / 60) + '';
        m=(m % 60) + '';
    html+="<td nowrap>" +h.padStart(2, 0) + ':' + m.padStart(2, 0) + ":00</td></tr>";
    $("#zvitt").append(html);
     st1=0;
     st2=0;
     st3=0;
    }
    
}
if(i==data_zup.length-1){
  if(prostKKZ>0){
    let m = Math.trunc(prostKKZ / 60) + '';
    let h = Math.trunc(m / 60) + '';
    m=(m % 60) + '';
    $("#zvitt").append("<tr><td nowrap>" + data_zup[i][4] + "</td><td nowrap>" + zaizd + "</td><td nowrap>" +h.padStart(2, 0) + ':' + m.padStart(2, 0) + "</td><td nowrap>-----</td><td nowrap>розвантаження</td></tr>");
  }
  if(prostPole>0){
    let m = Math.trunc(prostPole / 60) + '';
    let h = Math.trunc(m / 60) + '';
    m=(m % 60) + '';
    $("#zvitt").append("<tr><td nowrap>" + data_zup[i][4] + "</td><td nowrap>" + zaizd + "</td><td nowrap>" +h.padStart(2, 0) + ':' + m.padStart(2, 0) + "</td><td nowrap>-----</td><td nowrap>завантаження</td></tr>");
  }
  zaizd='-----';
  viizd='-----';
  prostKKZ=0;
  prostPole=0;
  prostGruz=0;

  $("#zvitt").append("<tr><td nowrap>-----</td><td nowrap>-----</td><td nowrap>поле</td><td nowrap>ККЗ</td><td nowrap>в дорозі</td></tr>");
  let html="<tr><td nowrap>-----</td><td nowrap>-----</td>";
  let m = Math.trunc(st2 / 60) + '';
  let h = Math.trunc(m / 60) + '';
  m=(m % 60) + '';
  html+="<td nowrap>" +h.padStart(2, 0) + ':' + m.padStart(2, 0) + ":00</td>";
      m = Math.trunc(st1 / 60) + '';
      h = Math.trunc(m / 60) + '';
      m=(m % 60) + '';
  html+="<td nowrap>" +h.padStart(2, 0) + ':' + m.padStart(2, 0) + ":00</td>";
      m = Math.trunc(st3 / 60) + '';
      h = Math.trunc(m / 60) + '';
      m=(m % 60) + '';
  html+="<td nowrap>" +h.padStart(2, 0) + ':' + m.padStart(2, 0) + ":00</td></tr>";
  $("#zvitt").append(html);
   st1=0;
   st2=0;
   st3=0;
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
     dis2 = wialon.util.Geometry.getDistance(y, x, yy, xx);
      if(dis2<=mr_radius1){
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
      
      if(dis<=mr_radius2){
        if(prostPole>0){
          let m = Math.trunc(prostPole / 60) + '';
          let h = Math.trunc(m / 60) + '';
          m=(m % 60) + '';
          $("#zvitt").append("<tr><td nowrap>" + data_zup[i][4] + "</td><td nowrap>" + zaizd + "</td><td nowrap>" +h.padStart(2, 0) + ':' + m.padStart(2, 0) + "</td></td><td nowrap>" + viizd + "</td><td nowrap>завантаження</td></tr>");
          prostPole=0;
          zaizd=0;
          viizd=0;
        }
        if(zaizd==0)zaizd=data_zup[i][1];
        viizd=data_zup[i][2];
        prostKKZ+=data_zup[i][3];
        st1+=data_zup[i][3];
      }else{
        if(prostKKZ>0){
          let m = Math.trunc(prostKKZ / 60) + '';
          let h = Math.trunc(m / 60) + '';
          m=(m % 60) + '';
          if(zaizd=='-----'){
            $("#zvitt").append("<tr><td nowrap>" + data_zup[i][4] + "</td><td nowrap>" + zaizd + "</td><td nowrap>" +h.padStart(2, 0) + ':' + m.padStart(2, 0) + "</td></td><td nowrap>" + viizd + "</td><td nowrap>початок зміни</td></tr>");
            }else{
            $("#zvitt").append("<tr><td nowrap>" + data_zup[i][4] + "</td><td nowrap>" + zaizd + "</td><td nowrap>" +h.padStart(2, 0) + ':' + m.padStart(2, 0) + "</td></td><td nowrap>" + viizd + "</td><td nowrap>розвантаження</td></tr>");
            }
            prostKKZ=0;
          zaizd=0;
          viizd=0;
        }
        if(dis2<=mr_radius1){
          if(zaizd==0)zaizd=data_zup[i][1];
          viizd=data_zup[i][2];
          prostPole+=data_zup[i][3];
          st2+=data_zup[i][3];
        }else{
          if(prostPole>0){
            let m = Math.trunc(prostPole / 60) + '';
            let h = Math.trunc(m / 60) + '';
            m=(m % 60) + '';
            $("#zvitt").append("<tr><td nowrap>" + data_zup[i][4] + "</td><td nowrap>" + zaizd + "</td><td nowrap>" +h.padStart(2, 0) + ':' + m.padStart(2, 0) + "</td></td><td nowrap>" + viizd + "</td><td nowrap>завантаження</td></tr>");
            prostPole=0;
            zaizd=0;
            viizd=0;
          }
          if( data_zup[i][3]>300){ 
            prostGruz=data_zup[i][3];
            let m = Math.trunc(prostGruz / 60) + '';
            let h = Math.trunc(m / 60) + '';
            m=(m % 60) + '';
            $("#zvitt").append("<tr><td nowrap>" + data_zup[i][4] + "</td><td nowrap>-----</td><td nowrap>" +h.padStart(2, 0) + ':' + m.padStart(2, 0) + "</td></td><td nowrap>-----</td><td nowrap>в дорозі</td></tr>");
            st3+=data_zup[i][3];
          }
        }
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
  var id_res=RES_ID, id_templ=zvit4, id_unit=mar_zupinki[icl5][2];
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
 [...document.querySelectorAll("#zvit tr")].forEach(e => e.style.backgroundColor = '');
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
function UpdateGlobalData(t2=0,idrep=zvit2,i=0){
    if(i==0){
     $('#eeew').prop("disabled", true);
     if($('#fromtime1').val()!=from111 || $('#fromtime2').val()!=from222){
       Global_DATA = [];
       from111=$('#fromtime1').val();
       from222=$('#fromtime2').val();
       t2=Date.parse($('#fromtime2').val())/1000;
      }else{ 
       from222 =(new Date(Date.now() - tzoffset)).toISOString().slice(0, -8);
       $('#fromtime2').val(from222);
       t2=Date.parse($('#fromtime2').val())/1000;
      }
    } 
    if(i < unitslist.length){
        $('#log').empty();
        let ld=unitslist.length-i;
        let pr=100-Math.round(ld*100/unitslist.length);
        let pr1="";
        let pr2="";
        for (let j=0; j<pr; j++){ pr1+="|";}
        for (let j=0; j<100-pr; j++){ pr2+=":";}
        msg("["+pr1+pr2+"] "+ld);
        CollectGlobalData(t2,idrep,i,unitslist[i]);
    } else {
      $('button').prop("disabled", false);
      $('#log').empty();
      msg('Завантажено  ---'+from222);
    }   
}

let list_zavatajennya=[];
function CollectGlobalData(t2,idrep,i,unit){ // execute selected report
  let id_res=RES_ID, id_unit = unit.getId(), ii=i;
  if(Global_DATA[ii]==undefined){Global_DATA.push([[id_unit,unit.getName(),Date.parse($('#fromtime1').val())/1000]])}
  let t1=Global_DATA[ii][0][2];
  if($('#uni_data').val()!="All"){
  let str =$('#uni_data').val().split(',');
  let ok=0;
  str.forEach((element) => {if(unit.getName().indexOf(element)>=0){ok=1}});
  if(ok==0){ii++; UpdateGlobalData(t2,idrep,ii);return;}
  }
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
            Global_DATA[ii].push([getTableValue(rows[j].c[0]),getTableValue(rows[j].c[1]),litry,getTableValue(rows[j].c[2]),datt,getTableValue(rows[j].c[4]),getTableValue(rows[j].c[3])]);
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

document.addEventListener('keydown', function(event) {
	if(event.code == "KeyA"){
    let t=Date.parse($('#f').text())-3000;
    if(t<Date.parse($('#fromtime1').val()))t=Date.parse($('#fromtime1').val());
    slider.value=(t-Date.parse($('#fromtime1').val()))/(Date.parse($('#fromtime2').val())-Date.parse($('#fromtime1').val()))*2000;
    position(t);
  }
  if(event.code == "KeyD"){
    let t=Date.parse($('#f').text())+3000;
    if(t>Date.parse($('#fromtime2').val()))t=Date.parse($('#fromtime2').val());
    slider.value=(t-Date.parse($('#fromtime1').val()))/(Date.parse($('#fromtime2').val())-Date.parse($('#fromtime1').val()))*2000;
    position(t);
  }
});

function position(t)  {
  var interval = t;
  var id=0;
  var calk=true;
  var cur_day1111 = new Date(interval);
  var month2 = cur_day1111.getMonth()+1;   
  var from2222 = cur_day1111.getFullYear() + '-' + (month2 < 10 ? '0' : '') + month2 + '-' + cur_day1111.getDate()+ ' ' + cur_day1111.getHours()+ ':' + cur_day1111.getMinutes()+ ':' + cur_day1111.getSeconds();
  output.innerHTML = from2222;
  var x,y,markerrr;
    for(let ii = 0; ii<Global_DATA.length; ii++){
     if(Global_DATA[ii].length<5) continue;
     let ind=1;
     id=Global_DATA[ii][0][0];
     if(filtr==true){
      calk=false;
      for(let v = 0; v<filtr_data.length; v++){ 
        if(filtr_data[v]==id){
          calk=true;
          break;
        } 
      } 
     }
     if(calk==false) continue;

     markerrr = markerByUnit[id];
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
            markerrr.bindPopup('<center><font size="1">'+Global_DATA[ii][0][1] +'<br />' +Global_DATA[ii][i][1]+ '<br />' +Global_DATA[ii][i][3]+ '<br />' +Global_DATA[ii][i][2]+'л'+ '<br />' +Global_DATA[ii][i][5]+ '<br />' +Global_DATA[ii][i][6]);
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
var sec2=200;
setInterval(function() {
  sec2--;
  if (sec2 <= 0 ) {jurnal_online();sec2=1000;}
if($("#gif").is(":checked")) {
  //msg(sec/10);
   let t=Date.parse($('#f').text())+10000;
    tik=slider.value;
    sec++;
    tik++;
    slider.value=tik;
    if (tik >= 1999) {tik =1800;slider.value=tik; t = Date.parse($('#fromtime1').val())+(Date.parse($('#fromtime2').val())-Date.parse($('#fromtime1').val()))/2000*tik;}
    if (sec > 3000) {
    sec =0;
    UpdateGlobalData(0,zvit2,0);
    }
    if (sec == 1000 && $("#monitoring_gif").is(":checked")) {Monitoring2();}
    
    
    if(t>Date.parse($('#fromtime2').val()))t=Date.parse($('#fromtime2').val());
    slider.value=(t-Date.parse($('#fromtime1').val()))/(Date.parse($('#fromtime2').val())-Date.parse($('#fromtime1').val()))*2000;
    position(t);
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
  var id_res=RES_ID, id_templ=zvit3, id_unit=id.getId(), time=$("#interval").val(),idddd=id;
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
 $( "#grupi_avto" ).on( "change", function() {
  chuse(0,this.value);
 });
 let filtr=false;
 let filtr_data=[];
function chuse(a,vibor) {
  var nmm,mm,idd;
  
  //  $('#v1').css({'background':'#e9e9e9'});
  //  $('#v2').css({'background':'#e9e9e9'});
  //  $('#v3').css({'background':'#e9e9e9'});
  //  $('#v4').css({'background':'#e9e9e9'});
  //  $('#v5').css({'background':'#e9e9e9'});
  //  $('#v6').css({'background':'#e9e9e9'});
  //  $('#v12').css({'background':'#e9e9e9'});
  //  $('#v13').css({'background':'#e9e9e9'});
  //  $('#v14').css({'background':'#e9e9e9'});
  //  $('#v21').css({'background':'#e9e9e9'});
  //  $('#v22').css({'background':'#e9e9e9'});
  //  $('#v23').css({'background':'#e9e9e9'});
  //  $('#v24').css({'background':'#e9e9e9'});
  //  $('#v25').css({'background':'#e9e9e9'});
  //  $('#v26').css({'background':'#e9e9e9'});
  //  $('#v27').css({'background':'#e9e9e9'});
  //  $('#v28').css({'background':'#e9e9e9'});
  //  $('#v29').css({'background':'#e9e9e9'});
  //  $('#v30').css({'background':'#e9e9e9'});

 
   if(!vibor){ vibor=this.id; }
   
   $("#"+vibor).css("background", '#b2f5b4');
  if (vibor=='v9'){
    if(rux==0){
      rux = 1;
      $('#v9').css("background", '#b2f5b4');
    }else{
      rux = 0;
      let t=Date.parse($('#f').text());
      position(t);
      $('#v9').css({'background':'#e9e9e9'});
    } 
    vibor=$("#grupi_avto option:selected").val();
  }else{
    {filtr_data=[];}
  }
  if (vibor=='v21'){if(rux==0)rux = 21; }
  if (vibor=='v22'){if(rux==0)rux = 22; }
  if (vibor=='v23'){if(rux==0)rux = 23; }
  if (vibor=='v24'){if(rux==0)rux = 24; }
  if (vibor=='v25'){if(rux==0)rux = 25; }
  if (vibor=='v26'){if(rux==0)rux = 26; }
  //if (vibor=='v27'){if(rux==0)rux = 27;}
  if (vibor=='v28'){if(rux==0)rux = 28; }
  if (vibor=='v29'){if(rux==0)rux = 29; }
  if (vibor=='v30'){if(rux==0)rux = 30; }
  
for(var i=0; i < allunits.length; i++){
nmm =allunits[i].getName();
idd =allunits[i].getId();
mm = markerByUnit[idd];
 mm.setOpacity(0);

     if (vibor=='v1'){
      mm.setOpacity(1);
      filtr=false; 
     }
     
     if (vibor=='v2'){
     if(nmm.indexOf('КАМАЗ')>=0|| nmm.indexOf('Камаз')>=0){ 
     mm.setOpacity(1);
     mm.setZIndexOffset(1000);
     filtr=true; 
     filtr_data.push(idd);
     }
     }  
     if (vibor=='v3'){
     if(nmm.indexOf(' МАЗ')>=0){ 
      mm.setOpacity(1);
      mm.setZIndexOffset(1000);
      filtr=true; 
      filtr_data.push(idd);
     }
     } 
     if (vibor=='v4'){
     if(nmm.indexOf('SCANIA')>=0){ 
       mm.setOpacity(1);
       mm.setZIndexOffset(1000);
       filtr=true; 
       filtr_data.push(idd);
     }
     }
     if (vibor=='v5'){
     if(nmm.indexOf('JCB')>=0|| nmm.indexOf('Manitou')>=0 || nmm.indexOf('Scorpion')>=0){ 
      mm.setOpacity(1);
      mm.setZIndexOffset(1000);
      filtr=true; 
      filtr_data.push(idd);
     }
     }
     if (vibor=='v6'){
     if(nmm.indexOf('ГАЗ')>=0){ 
      mm.setOpacity(1);
      mm.setZIndexOffset(1000);
      filtr=true; 
      filtr_data.push(idd);
     }
     }
     if (vibor=='v12'){
      if(nmm.indexOf('John')>=0 || nmm.indexOf('JD')>=0 || nmm.indexOf(' CL ')>=0|| nmm.indexOf(' МТЗ ')>0|| nmm.indexOf('CASE')>=0 || nmm.indexOf(' NH ')>=0){
       mm.setOpacity(1);
       mm.setZIndexOffset(1000);
       filtr=true; 
       filtr_data.push(idd);
      }
      }
     
    if (vibor=='v13'){
      if(nmm.indexOf('Нива')>=0 || nmm.indexOf('Газель')>=0 || nmm.indexOf('Лада')>=0 || nmm.indexOf('Lanos')>=0 || nmm.indexOf('Дастер')>=0 || nmm.indexOf('Stepway')>=0 || nmm.indexOf('ВАЗ')>=0 || nmm.indexOf('ФОРД')>=0 || nmm.indexOf('Toyota')>=0 || nmm.indexOf('Рено')>=0 || nmm.indexOf('TOYOTA')>=0 || nmm.indexOf('Skoda')>=0|| nmm.indexOf('ЗАЗ ')>=0){ 
       mm.setOpacity(1);
       mm.setZIndexOffset(1000);
       filtr=true; 
       filtr_data.push(idd);
      }
      }
      
        if (vibor=='v14'){
      if(nmm.indexOf('Найм')>=0 || nmm.indexOf('найм')>=0|| nmm.indexOf('Фоп')>=0|| nmm.indexOf('ФОП')>=0|| nmm.indexOf('ТОВ')>=0){ 
       mm.setOpacity(1);
       mm.setZIndexOffset(1000);
       filtr=true; 
       filtr_data.push(idd);
      }
      }

     if (vibor=='v27'){
      if(nmm.indexOf('CASE 4430')>=0 || nmm.indexOf('R4045')>=0|| nmm.indexOf('612R')>=0){
       mm.setOpacity(1);
       mm.setZIndexOffset(1000);
       filtr=true; 
       filtr_data.push(idd);
      }
      }

     if (vibor=='v30'){
      if(nmm.indexOf('John')>=0 || nmm.indexOf('JD')>=0 || nmm.indexOf(' CL ')>=0|| nmm.indexOf('CASE')>=0 || nmm.indexOf(' NH ')>=0 ){
       mm.setOpacity(1);
       mm.setZIndexOffset(1000);
       filtr=true; 
       filtr_data.push(idd);
      }
      }
      if(rux==1){mm.setOpacity(0);} 
      
}
}


function Clrar_no_activ(){
for(var i=0; i < allunits.length; i++){
 if (Date.parse($('#fromtime2').val())/1000-432000> allunits[i].getPosition().t ){
 let mm = markerByUnit[allunits[i].getId()];
 mm.setOpacity(0);
 }
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
  this.style.background = '#b2f5b4';
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
  this.style.background = '#e9e9e9';
}
    }
 
  
  function show_gr(a,b) {
    s1=a;
    s2=b;
    var unid =  parseInt($("#lis0").chosen().val());
        if ($('#grafik').is(':hidden')==false){
          $('#v11').css({'background':'#b2f5b4'});
          let data_graf = [];
          for(let i = 0; i<Global_DATA.length; i++){ 
            let idd = Global_DATA[i][0][0];
            if(idd==unid){
              for (let ii = 1; ii<Global_DATA[i].length-1; ii+=1){
                data_graf.push([Global_DATA[i][ii][0],Global_DATA[i][ii][1],Global_DATA[i][ii][2],Global_DATA[i][ii][3]]);
              } 
              break;
            }   
          }
          drawChart(data_graf);
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
  let s1,s2;
  
function drawChart(data_graf) {
var dashboard = new google.visualization.Dashboard(
    document.getElementById('grafik'));

  let rangge=10800000;
  if(s1!=undefined && s2!=undefined)rangge=1080000;

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
  'state': {'range': {'start': new Date(Date.parse(output.innerHTML)-rangge), 'end': new Date(Date.parse(output.innerHTML)+rangge)}}
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


if(s1!=undefined && s2!=undefined){
  if (Date.parse(data_graf[i][1])>=Date.parse(s1) && Date.parse(data_graf[i][1])<=Date.parse(s2)){ 
    a[4]='point { size: 4; shape-type: circle; fill-color: #FF0000; opacity: 1}';
    }
}



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
  let id_res=RES_ID, id_unit = unit.getId(), ii=i;
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
   [...document.querySelectorAll("#obrobkatehnika tr")].forEach(e => e.style.backgroundColor = '');
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
  $('#obrobkatehnika').append("<th><td>ТЗ</td><td>оброблено га</td><td>пересічення га</td><td>чистий обробіток га</td><td>-</td></th>");
  geo_splines.lenght = 0;
   let texnika=[];
   for (let i = 0; i < data.length; i++) {
   let unit =false;
   str.forEach((element) => {if(data[i][0][1].indexOf(element)>=0){unit = true;}});
   if(unit==false)continue;
   let splines =[];
   let spline=[];
   let p_start=[];
   let p_end=[];
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
          }else {
            newspline=true;
            p_end=[lon,lat];
          }
       //}
       }
      }else{
        if(wialon.util.Geometry.pointInShape(geozonepoint, 0, lat, lon)){
          spline.push([lon,lat]); 
          newspline=false;
        }else {
          newspline=true;
          p_start=[lon,lat];
        }
      }

      if(newspline==true || data[i].length-1 ==ii){
        if(spline.length>0) {
          if(spline.length>1){
            if(p_start.length>0)spline.unshift(p_start);
            if(p_end.length>0)spline.push(p_end);
            splines.push(spline);
          }
          //var linestring1 = turf.lineString(spline);
          //var polyline = L.geoJSON(linestring1).addTo(map);
          spline=[];
          p_start=[];
          p_end=[];
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


      let turfPole =turf.polygon([geozonepointTurf]);
      let area = GetPoligonsArea(polis);
      let areaU =area;
      let areaI =0;
      let union =polis[0];
      if(polis.length>1){
        union =turf.union(turf.featureCollection(polis));
        areaU = (turf.area(union)/10000).toFixed(2);
      }

	union = turf.intersect(turf.featureCollection([union, turfPole]));
        areaI = (areaU -turf.area(union)/10000).toFixed(2);
	   
      let color='#'+(Math.random() * 0x1000000 | 0x1000000).toString(16).slice(1);
      let polylinee = L.geoJSON(union,{ style: function (feature) { return {color: color, fillOpacity: 0.5, weight: 1};}}).addTo(map);
        geo_layer.push(polylinee); 

        if(union){
          if(union.geometry.type=="Polygon"){
            UnionPolis.push(union);
          }else{
            for ( j = 0; j < union.geometry.coordinates.length; j++){
              let unpol=turf.polygon(union.geometry.coordinates[j]);
              UnionPolis.push(unpol);
            }
          }
        }


      for ( j = 0; j < tableRow.length; j++){
        if(tableRow[j].cells[1].textContent==traktor){
          tableRow[j].cells[0].style.backgroundColor = color;
          tableRow[j].cells[2].textContent=(area-areaI).toFixed(2);
          tableRow[j].cells[3].textContent=(area-areaU-areaI).toFixed(2);
          tableRow[j].cells[4].textContent=(areaU-areaI).toFixed(2);
        }
      } 
    }
      if(i == geo_splines.length-1){
          let Aarea = GetPoligonsArea(UnionPolis);
          let AareaU = Aarea;
          if(UnionPolis.length>1){
            let Aunion =turf.union(turf.featureCollection(UnionPolis));
            AareaU = (turf.area(Aunion)/10000).toFixed(2);
          }

          $('#obrobkatehnika').append("<tr><td></td><td>ВСЬОГО</td><td>"+ Aarea +"</td><td>"+ (Aarea-AareaU).toFixed(2) +"</td><td>"+ AareaU +"</td><td><input type='checkbox'></td></tr>");

          let table_polya=document.getElementById('robota_polya_tb');
          let vibor_raboty = document.querySelector('#robota_polya_spisok');
          $("#robota_polya_help").hide();
          $('#polya_jurnal_text').val(vibor_raboty.value+" "+AareaU+" га");
          if(table_polya.rows.length>1){
            for(let i = 1; i<table_polya.rows.length; i++){
              if(table_polya.rows[i].cells[0].innerText==$('#getary_pole').text()){
                 table_polya.rows[i].cells[3].innerText= AareaU;
                 table_polya.rows[i].cells[2].innerText= vibor_raboty.value;
                 break;
              }
              if(i==table_polya.rows.length-1){
                $("#robota_polya_tb").append("<tr><td>"+$('#getary_pole').text()+"</td><td>-</td><td>"+vibor_raboty.value+"</td><td>"+AareaU+"</td></tr>");
              }
            }

          }else{
            $("#robota_polya_tb").append("<tr><th>ПОЛЕ</th><th>МОТОГОДИНИ</th><th>РОБОТА</th><th>ГЕКТАРИ</th></tr>");
            $("#robota_polya_tb").append("<tr><td>"+$('#getary_pole').text()+"</td><td>-</td><td>"+vibor_raboty.value+"</td><td>"+AareaU+"</td></tr>");
          }
      }
  }
 
}
function GetPoligonsArea(poligons=[]){
  let area=0;
  poligons.forEach(function(poligon) { area+=turf.area(poligon)/10000; });
  area= area.toFixed(2);
  return area;
}

$("#polya_jurnal").on("click", function (){
  
  let date=document.getElementById("polya_jurnal_time").valueAsNumber;
  let time=Date.now();
  let name=$('#getary_pole').text();
  let text=$('#polya_jurnal_text').val();
  let autor=autorization;
  if(date && name && name!='' && text!='' && autor!=''){ 
    write_jurnal(20233,'jurnal.txt','||'+date+'|'+name+'|'+text+'|'+autor+'|'+time,function () { 
      jurnal_update();
      $('#polya_jurnal_text').val("");
    });
  }
});

$('#robota_polya_BT').click(function (){
  $("#robota_polya_tb").empty();
  let polya_mot= {};
  let str =$('#tehnikaobr').val().split(',');
  for(let i = 0; i<Global_DATA.length; i++){ 
   let nametr = Global_DATA[i][0][1];
    for(let v = 0; v<str.length; v++){ 
      if(nametr.indexOf(str[v])<0)continue;
     for (let ii = 1; ii<Global_DATA[i].length-1; ii+=2){
      if(!Global_DATA[i][ii][3])continue;
      if(!Global_DATA[i][ii][0])continue;
      if(!Global_DATA[i][ii][4])continue;
      if(!Global_DATA[i][ii+1][4])continue;
      if(Global_DATA[i][ii][3][0]=='0')continue;
      let y0 = parseFloat(Global_DATA[i][ii][0].split(',')[0]);
      let x0 = parseFloat(Global_DATA[i][ii][0].split(',')[1]);
      let nn = PointInField(y0,x0);
      if(nn[2]=="-"){
        if(polya_mot[nn]){
          let t = polya_mot[nn];
            t+=(Global_DATA[i][ii+1][4]-Global_DATA[i][ii][4])/1000;
             polya_mot[nn]=t;
        } else{polya_mot[nn]=(Global_DATA[i][ii+1][4]-Global_DATA[i][ii][4])/1000;}
       
      }
     }
    }
  }
  $("#robota_polya_help").hide();
  $("#robota_polya_tb").append("<tr><th>ПОЛЕ</th><th>МОТОГОДИНИ</th><th>РОБОТА</th><th>ГЕКТАРИ</th><th>X</th></tr>");
  for (let key in polya_mot) {
    if(polya_mot[key]>200){
      let m = Math.trunc(polya_mot[key] / 60) + '';
      let h = Math.trunc(m / 60) + '';
      m=(m % 60) + '';
      $("#robota_polya_tb").append("<tr><td align='left'>"+key+"</td><td>"+h.padStart(2, 0) + ":" + m.padStart(2, 0) + ":00</td><td>-----</td><td>-----</td><td>&#10060</td></tr>");
    }
  }
});




$("#robota_polya_tb").on("click", function (evt){
  let row = evt.target.parentNode;
  [...document.querySelectorAll("#robota_polya_tb tr")].forEach(e => e.style.backgroundColor = '');
  if(row.rowIndex>0){

     if (evt.target.cellIndex==4){
      row.cells[0].closest('tr').remove();
      return;
     }

    row.style.backgroundColor = 'pink';
    let name = row.cells[0].textContent;
     for (let i = 0; i<geozones.length; i++){
     if(geozones[i].zone.n == name){
      let y=geozones[i]._bounds._northEast.lat;
      let x=geozones[i]._bounds._northEast.lng;
      map.setView([y,x],14);
           geozonepoint.length =0;
           geozonepointTurf.length =0;
           clearGEO();
        $('#obrobka').empty();
        $('#obrobkatehnika').empty();
        $('#getary_pole').text(name)
        let point = geozones[i]._latlngs[0];
        let ramka=[];
        for (let i = 0; i < point.length; i++) {
          let lat =point[i].lat;
          let lng =point[i].lng;
          geozonepoint.push({x:lat, y:lng}); 
          geozonepointTurf.push([lng,lat]);
          ramka.push([lat, lng]);
          if(i == point.length-1 && geozonepoint[0]!=geozonepoint[i]){
            geozonepoint.push(geozonepoint[0]); 
            geozonepointTurf.push(geozonepointTurf[0]);
            ramka.push(ramka[0]);
          }
          }
        let polilane = L.polyline(ramka, {color: 'blue'}).addTo(map);
        geo_layer.push(polilane);
        break;
     }
     }
  }
});


//=================Proverka Navigacii i Datchikov ===================================================================================
function track_TestNavigation(evt){
  [...document.querySelectorAll("#unit_table tr")].forEach(e => e.style.backgroundColor = '');
  this.style.backgroundColor = 'pink';
   $("#lis0").chosen().val(this.id.split(',')[0]);
   $("#lis0").trigger("chosen:updated");
   layers[0]=0;
   show_track();
   markerByUnit[this.id.split(',')[0]].openPopup();
   map.setView([parseFloat(this.id.split(',')[1]), parseFloat(this.id.split(',')[2])+0.001],13); 
  
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
     if (Date.parse($('#fromtime1').val())/1000 > unitslist[ii].getPosition().t){ no_aktiv.push(unitslist[ii]); }
    if ($("#no_activ").is(":checked")) {
    if (Date.parse($('#fromtime2').val())/1000-432000> unitslist[ii].getPosition().t) continue;
    }
    if (Date.parse($('#fromtime2').val())/1000-3600> unitslist[ii].getPosition().t && unitslist[ii].getPosition().s>0){
        $("#unit_table").append("<tr class='fail_trak' id='"+unitslist[ii].getId()+"," + unitslist[ii].getPosition().y+","+unitslist[ii].getPosition().x+ "'><td align='left'>"+unitslist[ii].getName()+"</td><td>"+wialon.util.DateTime.formatTime(unitslist[ii].getPosition().t)+"</td><td>завис у русі</td></tr>");
          mark = L.marker([unitslist[ii].getPosition().y, unitslist[ii].getPosition().x], {icon: L.icon({iconUrl: '777.png', draggable: true, iconSize:   [24, 24],iconAnchor: [12, 24] })}).addTo(map);
          mark.bindPopup(unitslist[ii].getName() +'<br />'+wialon.util.DateTime.formatTime(unitslist[ii].getPosition().t)+'<br />'+unitslist[ii].getPosition().s+' км/год');
          nav_mark_data.push(mark);
          }
 
   
    
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
            if(element.getName().indexOf('Резерв')>=0 ||element.getName().indexOf('резерв')>=0||element.getName().indexOf('Знято')>=0||element.getName().indexOf('знято')>=0){
            }else{
              $("#unit_table").append("<tr class='fail_trak' id='"+element.getId()+","  + element.getPosition().y+","+element.getPosition().x+ "'><td align='left'>"+element.getName()+"</td><td>"+data[i][ii][1]+"</td><td>"+ namee +"</td><td>заправлявся - дані не передає</td></tr>");
              mark = L.marker([element.getPosition().y, element.getPosition().x], {icon: L.icon({iconUrl: '666.png',draggable: true,iconSize:   [24, 24],iconAnchor: [12, 24] })}).addTo(map);
              mark.bindPopup(element.getName() +'<br />'+wialon.util.DateTime.formatTime(element.getPosition().t));
              nav_mark_data.push(mark);
            }
          }});
         }
        }
        if(namee.indexOf('Резерв')>=0 ||namee.indexOf('резерв')>=0||namee.indexOf('Знято')>=0||namee.indexOf('знято')>=0)continue;
       if (data[i][ii-1][0])if (data[i][ii][0]!=data[i][ii-1][0])pos++;
       if (data[i][ii-1][5])if (data[i][ii][5]!=data[i][ii-1][5])pos-=7;
       if (pos<0)pos=0;
       if (pos>2500)continue;
       if (data[i][ii][0])nav++;
        row++;
      }
      if(pos>600) if(namee.indexOf('CASE')>=0 ||namee.indexOf('NH')>=0 ||namee.indexOf('John')>=0 ||namee.indexOf('JD')>=0 || namee.indexOf('CL')>=0|| namee.indexOf('МТЗ')>=0||namee.indexOf('JCB')>=0|| namee.indexOf('Manitou')>=0 || namee.indexOf('Scorpion')>=0|| namee.indexOf('Камаз')>=0|| namee.indexOf('МАЗ')>=0 || namee.indexOf('SCANIA')>=0)$("#unit_table").append("<tr><td align='left'>"+namee+"</td><td>перевірте ДРП</td></tr>");
      if(row-nav>row*0.5)$("#unit_table").append("<tr><td align='left'>"+namee+"</td><td>перевірте GPS</td></tr>");
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
 let coll = "#98FB98";
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
 
   
   for (let ii = 10; ii<Global_DATA[i].length-1; ii+=20){
   points = 0;
   spd=0;
   stoyanka=0;
   if(!Global_DATA[i][ii][0])continue;
   if(!Global_DATA[i][ii-1][0])continue;
   if(!Global_DATA[i][ii+1][0])continue;
   let y = parseFloat(Global_DATA[i][ii][0].split(',')[0]);
   let x = parseFloat(Global_DATA[i][ii][0].split(',')[1]);

   let y2 = parseFloat(Global_DATA[i][ii][0].split(',')[0]);
   let x2 = parseFloat(Global_DATA[i][ii][0].split(',')[1]);



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
  


       for (let iii = ii-250; iii<Global_DATA[i].length; iii++){
        if(iii<=0)iii=1;
        if(stoyanka>sttime && iii-ii<100){ stoyanka=-1; points=-1;spd=-1;pereizd=0;robota=0; break; }
       if(Global_DATA[i][iii][3][0]=='0'){ 
        stoyanka+=(Global_DATA[i][iii][4]-Global_DATA[i][iii-1][4])/1000;
        spd--;
        continue; 
      }
       if(iii-ii>250){break;}
       let yy = parseFloat(Global_DATA[i][iii][0].split(',')[0]);
       let xx = parseFloat(Global_DATA[i][iii][0].split(',')[1]);
       if(wialon.util.Geometry.getDistance(y,x,yy,xx)<3){spd--;continue;}
       stoyanka=0;
       spd++;
       if(wialon.util.Geometry.getDistance(coord1[1],coord1[0],yy,xx)<70){points++;}
       if(wialon.util.Geometry.getDistance(coord2[1],coord2[0],yy,xx)<70){points++;}
       }
       //let tooltipp = L.tooltip([y,x], {content: ""+points+"",permanent: true}).addTo(map);
      
    if(points<3 && spd>0){pereizd++; robota=0;}
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
      let nn = 'роб <br>' + PointInField(y2,x2);
     if(stroka[stroka.length-1]!=nn){
     stroka.push(nn);
     if ($("#robviz_gif").is(":checked")) {
    let markerrr = L.marker([y2,x2]).addTo(map);
     markerrr.bindPopup(""+nametr+"");
     zup_mark_data.push(markerrr);
     }
     }
     }else{
      let nn = 'роб <br>' + PointInField(y2,x2);
      stroka.push(nn);
      if ($("#robviz_gif").is(":checked")) {
      let markerrr = L.marker([y2,x2]).addTo(map);
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

   if(ind<=0){
   if(rows[v].cells[1].innerHTML!=stroka[stroka.length-1]){
   rows[v].cells[1].innerHTML=stroka[stroka.length-1];
   coll = "#98FB98";
    if(stroka[stroka.length-1]=="пер"){coll = "#FFFF00";}
    if(stroka[stroka.length-1]=="роб <br>невідомо"){coll = "#f8b1c0";}
    rows[v].cells[1].style.backgroundColor = coll;
   }
   }
   if(rows[v].cells[1].innerHTML!=stroka[rows[v].cells.length-2]){
    rows[v].cells[1].innerHTML=stroka[rows[v].cells.length-2];
    coll = "#98FB98";
     if(stroka[rows[v].cells.length-2]=="пер"){coll = "#FFFF00";}
     if(stroka[rows[v].cells.length-2]=="роб <br>невідомо"){coll = "#f8b1c0";}
     rows[v].cells[1].style.backgroundColor = coll;
    }

   for(let vv = ind-1; vv>=0; vv--){
    if(rows[v].cells[1].innerHTML!=stroka[stroka.length-1-vv]){
    rows[v].insertCell(1);
    rows[v].cells[1].innerHTML=stroka[stroka.length-1-vv];
    coll = "#98FB98";
    if(stroka[stroka.length-1-vv]=="пер"){coll = "#FFFF00";}
    if(stroka[stroka.length-1-vv]=="роб <br>невідомо"){coll = "#f8b1c0";}
    rows[v].cells[1].style.backgroundColor = coll;
    }  
   }
   break;
  }else{
    if(v==rows.length-1){ 
   for(let v = stroka.length-1; v>=0; v--){
     coll = "#98FB98";
     if(stroka[v]=="пер"){coll = "#FFFF00";}
     if(stroka[v]=="роб <br>невідомо"){coll = "#f8b1c0";}
     strr+= "<td bgcolor = '"+coll+"'>"+stroka[v]+"</td>";
     }
    $("#monitoring_table").append("<tr id="+id+"><td>"+nametr.split(' ')[0]+' '+nametr.split(' ')[1]+'<br>'+Global_DATA[i][Global_DATA[i].length-1][5].split(' ')[0]+"</td>"+strr+"</tr>");
       }
   }
  }
  }else{
  
  for(let v = stroka.length-1; v>=0; v--){
     coll = "#98FB98";
     if(stroka[v]=="пер"){coll = "#FFFF00";}
     if(stroka[v]=="роб <br>невідомо"){coll = "#f8b1c0";}
     strr+= "<td bgcolor = '"+coll+"'>"+stroka[v]+"</td>";
     }
    $("#monitoring_table").append("<tr id="+id+"><td>"+nametr.split(' ')[0]+' '+nametr.split(' ')[1]+'<br>'+Global_DATA[i][Global_DATA[i].length-1][5].split(' ')[0]+"</td>"+strr+"</tr>");
  }
 }
}});
}
$('#men7').css({'background':'#fffd7e'});
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
      return name;
    }
 }
 return 'невідомо';

}


function track_Monitoring(evt){
  
   if(evt.target.cellIndex>0){ 
    console.log(evt.target.style.backgroundColor)
   if(evt.target.style.backgroundColor == 'transparent'){
   evt.target.style.backgroundColor = '#1E90FF';
   }else{
    evt.target.style.backgroundColor = 'transparent';
   }
   }else{
   [...document.querySelectorAll("td")].forEach(e => {
    if(e.cellIndex==0){e.style.backgroundColor = 'transparent';}
   });
   if(evt.target.style.backgroundColor == 'transparent')evt.target.style.backgroundColor = '#1E90FF';
   $("#lis0").chosen().val(evt.target.parentNode.id);
   $("#lis0").trigger("chosen:updated");
   layers[0]=0;
   show_track();
   let mar=markerByUnit[evt.target.parentNode.id];
   mar.openPopup();
   map.setView([mar.getLatLng().lat,mar.getLatLng().lng+0.02],14);
   }
     
 }
//====================zalishki palnogo================================
let bufer=[];
let garbage =[];
let garbagepoly =[];
let buferpoly=[];

function RemainsFuel(e){
//let cir = L.circle(e.latlng, {radius: 2000}).addTo(map);
 bufer.push(e.latlng);
 buferpoly.push({x:e.latlng.lat, y:e.latlng.lng}); 
 if(bufer.length>1){
 let line = L.polyline([bufer[bufer.length-2],bufer[bufer.length-1]], {opacity: 0.3, color: '#0000FF'}).addTo(map);
 garbage.push(line);

 if(wialon.util.Geometry.getDistance(bufer[0].lat, bufer[0].lng,bufer[bufer.length-1].lat, bufer[bufer.length-1].lng)<900){
 if(bufer.length>2){
  let color='#'+(Math.random() * 0x1000000 | 0x1000000).toString(16).slice(1);
  let polygon = L.polygon(bufer, {color: color}).addTo(map);
  garbagepoly.push(polygon);


  if ($('#zz1').is(':visible')) {
    $("#unit_table").append("<tr><td>&nbsp&nbsp&nbsp&nbsp&nbsp</td><td>-----------</td><td>--------</td><td>--------</td><td>---------</td></tr>");
    let str =$('#unit_palne').val().split(',');
    for(let i = 0; i<unitslist.length; i++){
      let namet = unitslist[i].getName();
      let id = unitslist[i].getId();
      let time = Date.parse($('#f').text());
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
            if(!drp){
              for(let ii = 0; ii<Global_DATA.length; ii++){
                let idd = Global_DATA[ii][0][0];
                if(idd!=id)continue;
                for(let iii = 1; iii<Global_DATA[ii].length; iii++){
                   if(time>Global_DATA[ii][iii][4]){
                    drp =Global_DATA[ii][iii][2].split('.')[0];
                   }else break;
                }
              } 
            }else drp=drp.split('.')[0];
           

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
            
            $("#unit_table").append("<tr class='fail_trak' id='"+unitslist[i].getId()+"," + lat+","+lon+ "'><td bgcolor ="+color+">&nbsp&nbsp&nbsp&nbsp&nbsp</td><td align='left'>"+namet+"</td><td>"+agregat+"</td><td>"+drp+"</td><td>"+mesto+"</td></tr>");

          }
        } 
      }});
        
    }
  }

    if ($('#zz2').is(':visible')) {
      $("#unit_table").append("<tr><td>&nbsp&nbsp&nbsp&nbsp&nbsp</td><td>ТЗ</td><td>вїзд</td><td>виїзд</td><td>простій/год</td></tr>");
    let str =$('#unit_geozup').val().split(',');
    let numm =0;
    for(let i = 0; i<Global_DATA.length; i++){
      let nametr = Global_DATA[i][0][1];
      let prostoy=0;
      let start=0;
      str.forEach((element) => {if(nametr.indexOf(element)>=0){
       prostoy=0;
       start=0;
       for (let ii = 0; ii<Global_DATA[i].length-1; ii++){
       if(!Global_DATA[i][ii][0])continue;
       if(!Global_DATA[i][ii][4])continue;
       if(!Global_DATA[i][ii+1][4])continue;
       if(!Global_DATA[i][ii][0])continue;
       let y = parseFloat(Global_DATA[i][ii][0].split(',')[0]);
       let x = parseFloat(Global_DATA[i][ii][0].split(',')[1]);
        if(wialon.util.Geometry.pointInShape(buferpoly, 0, y, x)){
          if(start==0)start=Global_DATA[i][ii][1];
          if(Global_DATA[i][ii][3][0]==0){prostoy+=(Global_DATA[i][ii+1][4]-Global_DATA[i][ii][4])/1000;}
        }else{ 
          if(start!=0){
            let m = Math.trunc(prostoy / 60) + '';
            let h = Math.trunc(m / 60) + '';
            m=(m % 60) + '';
            numm++;
          $("#unit_table").append("<tr><td bgcolor ="+color+">&nbsp&nbsp"+numm+"&nbsp&nbsp</td><td align='left'>"+nametr+"</td><td>"+start+"</td><td>"+Global_DATA[i][ii][1]+"</td><td>"+h.padStart(2, 0) + ':' + m.padStart(2, 0) +"</td></tr>");
          prostoy=0;
          start=0;
        }
        
      }
      if(start!=0 && ii==Global_DATA[i].length-2){
        let m = Math.trunc(prostoy / 60) + '';
        let h = Math.trunc(m / 60) + '';
        m=(m % 60) + '';
        numm++;
      $("#unit_table").append("<tr><td bgcolor ="+color+">&nbsp&nbsp"+numm+"&nbsp&nbsp</td><td align='left'>"+nametr+"</td><td>"+start+"</td><td>не виїзджав</td><td>"+h.padStart(2, 0) + ':' + m.padStart(2, 0) +"</td></tr>");
      prostoy=0;
      start=0;
    }
       }
      }});
    }

  }

  if ($('#zz3').is(':visible')) { 
    
    let str =$('#unit_moto').val().split(',');
    let str2='';
    for(let i = 0; i<unitslist.length; i++){
      let namet = unitslist[i].getName();
      str.forEach((element) => {if(namet.indexOf(element)>=0){
        let markerr= markerByUnit[unitslist[i].getId()];
        if(markerr){
         let lat = markerr.getLatLng().lat;
         let lon = markerr.getLatLng().lng;
          if(wialon.util.Geometry.pointInShape(buferpoly, 0, lat, lon)){
            str2+=namet+',';
          }
        } 
      }});   
    }
       
      $("#unit_table").empty();
      if(str2=='') return;
      let html = Motogod(str2.slice(0, -1));
      $("#unit_table").append(html);
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

let stan=[[51.55109167453309,33.34894127728944,373,'ККЗ'],
[51.4932345615444,33.40017453599349,460,'Буйвалове'],
[51.622424409240104,33.0929363543844,436,'Райгородок ферма'],
[51.745262906172094,33.7985328417313,179,'стан Слоут'],
[51.51692830745467,32.98792806762675,198,'стан Карильське'],
];
function Motogod(filtr){
let str =filtr.split(',');
let html0="<tr><td>ТЗ</td><td>робота год</td><td>робота км</td><td>робота л</td>";
if ($("#1_mot").is(":checked")) html0+="<td>переїзд год</td><td>переїзд км</td><td>переїзд л</td>"
if ($("#2_mot").is(":checked")) html0+="<td>робота в полі год</td><td>робота в полі км</td><td>робота в полі л</td>"
html0+="<td>простій год</td>";
if ($("#3_mot").is(":checked")) html0+="<td>простій на стані год</td><td>простій по за станом год</td>"
if ($("#4_mot").is(":checked")) html0+="<td>простій мот-год</td><td>простій літри</td><td>простій л/год</td>" 
html0+="</tr>";
for(let i = 0; i<Global_DATA.length; i++){
let nametr = Global_DATA[i][0][1];
let litry0=0;
let prostoy0=0;
let zupp0 =0;
let litry=0;
let prostoy=0;
let zupp=0;
let stoyanka=0;
let stoyanka_stan=0;
let stoyanka_pole=0;
let rob_km=0;
let rob_sec=0;
let rob_lit=0;
let pereysd_km=0;
let pereysd_sec=0;
let pereysd_lit=0;
let pole_km=0;
let pole_sec=0;
let pole_lit=0;

let pereysd_data0=[];
let pole_data0=[];

str.forEach((element) => {if(nametr.indexOf(element)>=0){
 litry0=0;
 prostoy0=0;
 zupp0=0;
 litry=0;
 prostoy=0;
 zupp=0;
 for (let ii = 1; ii<Global_DATA[i].length-7; ii++){


 if(!Global_DATA[i][ii][3])continue;
 if(!Global_DATA[i][ii+6][3])continue;
 if(!Global_DATA[i][ii][4])continue;
 if(!Global_DATA[i][ii+6][4])continue;
 if(!Global_DATA[i][ii][2])continue;
 if(!Global_DATA[i][ii+6][2])continue;
 
 
  if(Global_DATA[i][ii][3][0]==0 && Global_DATA[i][ii+6][3][0]==0){
    zupp0+=(Global_DATA[i][ii+6][4]-Global_DATA[i][ii][4])/1000;
 let ras =(Global_DATA[i][ii][2]-Global_DATA[i][ii+6][2])/((Global_DATA[i][ii+6][4]-Global_DATA[i][ii][4])/3600000);
  if(ras<15 && ras>1){
  litry0+=Global_DATA[i][ii][2]-Global_DATA[i][ii+6][2];
  prostoy0+=(Global_DATA[i][ii+6][4]-Global_DATA[i][ii][4])/1000;
  ii+=6;
  
  }else{
    if(prostoy0>600){litry+=litry0;prostoy+=prostoy0;}
    litry0=0;
    prostoy0=0;
    ii+=5;
  }
  }else{
    if(prostoy0>600){litry+=litry0;prostoy+=prostoy0;}
    litry0=0;
    prostoy0=0;
    zupp+=zupp0;
    zupp0=0;
    ii+=5;
  }
 
 }

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

let sy=0;
let sx=0;
let ssy=0;
let ssx=0;
let kmx=0;
let kmy=0;
let i0=0;

let rob=0;
let per=0;
let grafik=[];


for (let ii = 2; ii<Global_DATA[i].length-1; ii+=1){      
    if(ii<2)continue;
    if(ii>Global_DATA[i].length-2)continue;
    if(!Global_DATA[i][ii-1][0])continue;
    if(!Global_DATA[i][ii][0])continue;
    if(!Global_DATA[i][ii+1][0])continue;

    if(Global_DATA[i][ii][3][0]=='0'){ 
      stoyanka+=(Global_DATA[i][ii+1][4]-Global_DATA[i][ii][4])/1000;
    let yyy = parseFloat(Global_DATA[i][ii][0].split(',')[0]);
    let xxx = parseFloat(Global_DATA[i][ii][0].split(',')[1]);
            for (let j = 0; j<stan.length; j++){
              if(wialon.util.Geometry.getDistance(yyy,xxx,stan[j][0],stan[j][1])<stan[j][2]){stoyanka_stan+=(Global_DATA[i][ii+1][4]-Global_DATA[i][ii][4])/1000;}
            }

    }
    
    

    let y0 = parseFloat(Global_DATA[i][ii-1][0].split(',')[0]);
    let x0 = parseFloat(Global_DATA[i][ii-1][0].split(',')[1]);
    let y1 = parseFloat(Global_DATA[i][ii][0].split(',')[0]);
    let x1 = parseFloat(Global_DATA[i][ii][0].split(',')[1]);
    let y2 = parseFloat(Global_DATA[i][ii+1][0].split(',')[0]);
    let x2 = parseFloat(Global_DATA[i][ii+1][0].split(',')[1]);

    let point0 = turf.point([x0, y0]);
    let point1 = turf.point([x1, y1]);
    let point2 = turf.point([x2, y2]);
    let bearing0 = 0;
    let bearing1 = 0;
    if(wialon.util.Geometry.getDistance(y0,x0,y1,x1)>wialon.util.Geometry.getDistance(y1,x1,y2,x2)){
     bearing0 = turf.bearing(point0, point1);
     bearing1 = turf.bearing(point0, point2);
    }else{
     bearing0 = turf.bearing(point2, point1);
     bearing1 = turf.bearing(point2, point0);
    }
    
    if(Math.abs(bearing0-bearing1)<10 || Math.abs(bearing0-bearing1)>350){ 
      //L.polyline([[y0, x0],[y2, x2]], {color: 'red'}).addTo(map);
      if(sy==0){sy=y0;i0=ii-1;}
      if(sx==0)sx=x0; 

    }else{
      //L.polyline([[y0, x0],[y2, x2]], {color: 'red'}).addTo(map);
      if(sy!=0 && wialon.util.Geometry.getDistance(sy,sx,y1,x1)>50){
        if(ssy!=0 && wialon.util.Geometry.getDistance(ssy,ssx,y1,x1)<300){
          if(ii-i0>2)robota();
        }else{
          if(ii-i0<150){ 
            let l = i0+(ii-i0)/2;
            //let y100 = parseFloat(Global_DATA[i][l.toFixed()][0].split(',')[0]);
            //let x100 = parseFloat(Global_DATA[i][l.toFixed()][0].split(',')[1]);
            let y200 = parseFloat(((sy+y1)/2).toFixed(6));
            let x200 = parseFloat(((sx+x1)/2).toFixed(6));
           
            
            let point=0;
            for (let n = i0-200; n<ii+200; n++){
              if(n>2 && n<Global_DATA[i].length-1){
                if(n<i0 || n>ii){
                let y = parseFloat(Global_DATA[i][n][0].split(',')[0]);
                let x = parseFloat(Global_DATA[i][n][0].split(',')[1]);
                if(wialon.util.Geometry.getDistance(y200,x200,y,x)<150){point++;}
                }
              }  
            }
            //L.circle([y200, x200], { color: 'red', fillColor: '#f03', fillOpacity: 0.5, radius: 100}).bindPopup(""+point+"").addTo(map);

            if(point>5){
              if(ii-i0>10) robota();
            }else{
              if(ii-i0>10)pereyesd();
            }   
          }else{
            if(ii-i0>20)pereyesd();
          } 
        }
        ssy=sy;
        ssx=sx;
        
      }
      sy=0;
      sx=0;
      i0=0;
    }

    function robota(){
      kmx=0;
      kmy=0;
      if(rob==0){rob=i0;}
      if(per>0){
        //console.log(nametr,"pereyezd",Global_DATA[i][per][1],Global_DATA[i][i0][1])
        let zapravka=0;
        let t0=0;
        let z0=0;
        let z1=0;
        let l0=10000000;
        let l1=0;
        let n0=0;
        for (let j = per; j<i0; j++){
          let jy0 = parseFloat(Global_DATA[i][j][0].split(',')[0]);
          let jx0 = parseFloat(Global_DATA[i][j][0].split(',')[1]);
          let jy1 = parseFloat(Global_DATA[i][j+1][0].split(',')[0]);
          let jx1 = parseFloat(Global_DATA[i][j+1][0].split(',')[1]);
          let ttt=(Global_DATA[i][j+1][4]-Global_DATA[i][j][4])/1000;
          let km=wialon.util.Geometry.getDistance(jy0,jx0,jy1,jx1);
          let litry=parseFloat(Global_DATA[i][j][2]);
          if(Global_DATA[i][j][3][0]=='0'){ 
            n0++;
            if(t0==0)t0=Global_DATA[i][j][4]/1000;
            if(l1==0)l1=parseFloat(Global_DATA[i][j][2]);
            if(l0==10000000 && n0>5)l0=parseFloat(Global_DATA[i][j][2]);
            if(pereysd_data0.length>0){z0=litry-l0; z1=litry-l1;}
          }else{
            if(km)pereysd_km+=km;
            pereysd_sec+=ttt; 
            if(z0<50){z1=0;}
            if(Global_DATA[i][j][4]/1000-t0<150){z1=0;}
            zapravka+=z1;
            z0=0;
            z1=0;
            t0=0;
            l0=10000000;
            l1=0;
            n0=0;
            if(litry>0)pereysd_data0.push([litry-zapravka,Global_DATA[i][j][1]]);
          }
          //if(jy0 && jx0 && jy1 && jx1 )L.polyline([[jy0, jx0],[jy1, jx1]], {color: '#55ff33'}).addTo(map);
         } 
         let kz=0;
         let zapr=0;
         let kz2=0;
         let zapr2=0;
         for (let n = 1; n<11; n++){
          if(per-n>2){
            let lll = parseFloat(Global_DATA[i][per-n][2]);
            let lll0 = parseFloat(Global_DATA[i][per-n-1][2]);
            if(Global_DATA[i][per-n][3][0]=='0' && Global_DATA[i][per-n-1][3][0]=='0'){
              if(lll>lll0){kz+=lll-lll0;}else{
                if(kz>50)zapr=kz;
                if(lll>0)pereysd_data0.unshift([lll+zapr,Global_DATA[i][per-n][1]]);
              }
            }else{
              if(lll>0)pereysd_data0.unshift([lll+zapr,Global_DATA[i][per-n][1]]);
            }
          }
          if(i0+n<Global_DATA[i].length-2){
            let lll = parseFloat(Global_DATA[i][i0+n][2]);
            let lll0 = parseFloat(Global_DATA[i][i0+n+1][2]);
            if(Global_DATA[i][i0+n][3][0]=='0'&& Global_DATA[i][i0+n+1][3][0]=='0'){
              if(lll<lll0){kz2+=lll0-lll;}else{
                if(kz2>50)zapr2=kz2;
                if(lll>0)pereysd_data0.push([lll+zapr2-zapravka,Global_DATA[i][i0+n][1]]);
              }
            }else{
              if(lll>0)pereysd_data0.push([lll+zapr2-zapravka,Global_DATA[i][i0+n][1]]);
            }
          }
        }
         pereysd_lit+=linearRegression(pereysd_data0);
         pereysd_data0=[];
      }
      per=0;

    }
    function pereyesd(){
      if(kmx==0){kmx=sx;kmy=sy;}
      if(per==0){per=i0;}
      if(rob>0){
        //console.log(nametr,"robota",Global_DATA[i][rob][1],Global_DATA[i][i0][1])
        let zapravka=0;
        let t0=0;
        let z0=0;
        let z1=0;
        let l0=10000000;
        let l1=0;
        let n0=0;
        for (let j = rob; j<i0; j++){
          let jy0 = parseFloat(Global_DATA[i][j][0].split(',')[0]);
          let jx0 = parseFloat(Global_DATA[i][j][0].split(',')[1]);
          let jy1 = parseFloat(Global_DATA[i][j+1][0].split(',')[0]);
          let jx1 = parseFloat(Global_DATA[i][j+1][0].split(',')[1]);
          let ttt=(Global_DATA[i][j+1][4]-Global_DATA[i][j][4])/1000;
          let km=wialon.util.Geometry.getDistance(jy0,jx0,jy1,jx1);
          let litry=parseFloat(Global_DATA[i][j][2]);
          if(Global_DATA[i][j][3][0]=='0'){ 
            n0++;
            if(t0==0)t0=Global_DATA[i][j][4]/1000;
            if(l1==0)l1=parseFloat(Global_DATA[i][j][2]);
            if(l0==10000000 && n0>5)l0=parseFloat(Global_DATA[i][j][2]);
            if(pole_data0.length>0){z0=litry-l0; z1=litry-l1;}
          }else{
            if(km)pole_km+=km;
            pole_sec+=ttt; 
            if(z0<50){z1=0;}
            if(Global_DATA[i][j][4]/1000-t0<150){z1=0;}
            zapravka+=z1;
            z0=0;
            z1=0;
            t0=0;
            l0=10000000;
            l1=0;
            n0=0;
            if(litry>0)pole_data0.push([litry-zapravka,Global_DATA[i][j][1]]);
          }
          //if(jy0 && jx0 && jy1 && jx1)L.polyline([[jy0, jx0],[jy1, jx1]], {color: 'red'}).addTo(map);
         } 

         let kz=0;
         let zapr=0;
         let kz2=0;
         let zapr2=0;
         for (let n = 1; n<11; n++){
          if(rob-n>2){
            let lll = parseFloat(Global_DATA[i][rob-n][2]);
            let lll0 = parseFloat(Global_DATA[i][rob-n-1][2]);
            if(Global_DATA[i][rob-n][3][0]=='0' && Global_DATA[i][rob-n-1][3][0]=='0'){
              if(lll>lll0){kz+=lll-lll0;}else{
                if(kz>50)zapr=kz;
                if(lll>0)pole_data0.unshift([lll+zapr,Global_DATA[i][rob-n][1]]);
              }
            }else{
              if(lll>0)pole_data0.unshift([lll+zapr,Global_DATA[i][rob-n][1]]);
            }
          }
          if(i0+n<Global_DATA[i].length-2){
            let lll = parseFloat(Global_DATA[i][i0+n][2]);
            let lll0 = parseFloat(Global_DATA[i][i0+n+1][2]);
            if(Global_DATA[i][i0+n][3][0]=='0'&& Global_DATA[i][i0+n+1][3][0]=='0'){
              if(lll<lll0){kz2+=lll0-lll;}else{
                if(kz2>50)zapr2=kz2;
                if(lll>0)pole_data0.push([lll+zapr2-zapravka,Global_DATA[i][i0+n][1]]);
              }
            }else{
              if(lll>0)pole_data0.push([lll+zapr2-zapravka,Global_DATA[i][i0+n][1]]);
            }
          }
        }
         pole_lit+=linearRegression(pole_data0);
         pole_data0=[];
        }
      rob=0;
    }
}


if(prostoy0>600){litry+=litry0;prostoy+=prostoy0;}
zupp+=zupp0;

stoyanka_pole=stoyanka-stoyanka_stan;


if(rob>0){pereyesd();}
if(per>0){robota();}

 rob_km=pereysd_km+pole_km;
 rob_lit=pereysd_lit+pole_lit;;
 rob_sec=pereysd_sec+pole_sec;


 let html="<tr><td align='left' nowrap>"+nametr+"</td>";

  let m = Math.trunc(rob_sec / 60) + '';
  let h = Math.trunc(m / 60) + '';
 m=(m % 60) + '';
 html+="<td>"+h.padStart(2, 0) + ":" + m.padStart(2, 0) + ":00</td><td>"+(rob_km/1000).toFixed() +"</td><td>"+(rob_lit).toFixed(2) +"</td>";

  m = Math.trunc(pereysd_sec / 60) + '';
  h = Math.trunc(m / 60) + '';
m=(m % 60) + '';
if ($("#1_mot").is(":checked"))html+="<td>"+h.padStart(2, 0) + ":" + m.padStart(2, 0) + ":00</td><td>"+(pereysd_km/1000).toFixed() +"</td><td>"+(pereysd_lit).toFixed(2) +"</td>";

 m = Math.trunc(pole_sec / 60) + '';
 h = Math.trunc(m / 60) + '';
m=(m % 60) + '';
if ($("#2_mot").is(":checked"))html+="<td>"+h.padStart(2, 0) + ":" + m.padStart(2, 0) + ":00</td><td>"+(pole_km/1000).toFixed() +"</td><td>"+(pole_lit).toFixed(2) +"</td>";

  m = Math.trunc(stoyanka / 60) + '';
  h = Math.trunc(m / 60) + '';
 m=(m % 60) + '';
 html+="<td>"+h.padStart(2, 0) + ":" + m.padStart(2, 0) + ":00</td>";

 m = Math.trunc(stoyanka_stan / 60) + '';
  h = Math.trunc(m / 60) + '';
 m=(m % 60) + '';
 if ($("#3_mot").is(":checked"))html+="<td>"+h.padStart(2, 0) + ":" + m.padStart(2, 0) + ":00</td>";

 m = Math.trunc(stoyanka_pole / 60) + '';
 h = Math.trunc(m / 60) + '';
m=(m % 60) + '';
if ($("#3_mot").is(":checked"))html+="<td>"+h.padStart(2, 0) + ":" + m.padStart(2, 0) + ":00</td>";

  m = Math.trunc(prostoy / 60) + '';
  h = Math.trunc(m / 60) + '';
  m=(m % 60) + '';
  if ($("#4_mot").is(":checked")) html+="<td>"+h.padStart(2, 0) + ":" + m.padStart(2, 0) + ":00</td>";
 let lkm = (litry/prostoy*3600).toFixed(1);
 if ($("#4_mot").is(":checked"))html+="<td>"+ litry.toFixed(1) +"</td><td>"+ lkm +"</td></tr>";

 if(stoyanka>0)html0+=html;

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
}});
}

return html0;
}

function linearRegression(data){
  var a = 0;
  var b = 0;
  var k = 30;
  var result = 0;
  
  if(data.length<k*1.5)return result;
  for( var i=0; i<k; i++){
    a+=data[i][0];
    b+=data[data.length-1-i][0];
  }
  a=a/k;
  b=b/k;

  result = a-b;
  //console.log(a,data[0][1])
  //console.log(b,data[data.length-1][1])
  //console.log(result)
  return result;

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

function rob_region(){
  $("#unit_table").empty();
let str =$('#unit_prPos').val().split(',');
let mesto="";
for(let i = 0; i<geozonesgrup.length; i++){ 
  mesto="";
  let cord= geozonesgrup[i].toGeoJSON().features[0];
  let buferpoly2 =[];
  if(cord){
    
    cord.geometry.coordinates[0].forEach(function(item, arr) {
      buferpoly2.push({x:item[1], y:item[0]}); 
    });

    for(let ii = 0; ii<Global_DATA.length; ii++){
      let nametr = Global_DATA[ii][0][1];
      if(Global_DATA[ii].length<100)  continue;
      str.forEach((element) => {if(nametr.indexOf(element)>=0){
        let lat = parseFloat(Global_DATA[ii][Global_DATA[ii].length-1][0].split(',')[0]);
        let lon = parseFloat(Global_DATA[ii][Global_DATA[ii].length-1][0].split(',')[1]);
        if(wialon.util.Geometry.pointInShape(buferpoly2, 0, lat, lon)){
         
          if(mesto==""){
            mesto=geozonesgrup[i]._tooltip._content;
            $("#unit_table").append("<tr><td  bgcolor='#A9BCF5'><b>"+mesto+"</b></td></tr>");
          }
          $("#unit_table").append("<tr class='fail_trak' id='"+Global_DATA[ii][0][0]+"," + lat+","+lon+ "'><td align='left'>"+nametr+"</td><td>"+Global_DATA[ii][Global_DATA[ii].length-1][5].split(' ')[0]+"</td><td>"+Global_DATA[ii][Global_DATA[ii].length-1][2]+"</td><td>"+Global_DATA[ii][Global_DATA[ii].length-1][6]+"</td></tr>");
         
        }
      }});
    } 
  }
}

 }


 function zlivy(){
  $("#unit_table").empty();
  $("#unit_table").append("<tr><td>ТЗ</td><td>Початок</td><td>Кінець</td><td>літри</td><td>тривалість</td></tr>");

  let min_sliv=$('#min_sliv').val();
  let t_pod=50;

  for(let i = 0; i<Global_DATA.length; i++){
    let nametr = Global_DATA[i][0][1];
    let id = Global_DATA[i][0][0];
    if(nametr=='ДРП ККЗ'|| nametr=='ДРП Райгородок'|| nametr=='Бензин ККЗ Ультразвук'|| nametr=='РЕЗЕРВУАР ККЗ новий') continue;
    let start=0;
    let finish=0;
    let interval0=0;
    let interval1=0;
    let zup1=0;
    let zup2=0;
    let litry=0;
    let litry0=0;
    let litry1=0;
    let litry_start=0;
 
    
    for (let ii = 0; ii<Global_DATA[i].length-1; ii++){
      if(!Global_DATA[i][ii][3])continue;
      if(!Global_DATA[i][ii+1][3])continue;
      if(!Global_DATA[i][ii][4])continue;
      if(!Global_DATA[i][ii+1][4])continue;
      if(!Global_DATA[i][ii][2])continue;
      if(!Global_DATA[i][ii+1][2])continue;
      if(Global_DATA[i][ii][3][0]==0){
        let rashod=(Global_DATA[i][ii][2]-Global_DATA[i][ii+1][2])/((Global_DATA[i][ii+1][4]-Global_DATA[i][ii][4])/3600000);
        if(rashod<40 && rashod>-25 && litry==0){
          zup1+=(Global_DATA[i][ii+1][4]-Global_DATA[i][ii][4])/1000; 
          if(litry0==0)litry0=Global_DATA[i][ii][2];
        }
        if(rashod>100){
          if(zup1>=t_pod){
            if(litry_start==0)litry_start=Global_DATA[i][ii][2];
            litry=litry_start-Global_DATA[i][ii+1][2];
            if(start==0)start=Global_DATA[i][ii][1];
            finish=Global_DATA[i][ii+1][1];
            if(interval0==0)interval0=Global_DATA[i][ii][4];
            interval1=Global_DATA[i][ii+1][4];
            zup2=0;
          }
          if(zup2>5){
            zup1=30;
            zup2=0;
          }
        }
        if(rashod<40 && rashod>-25 && litry>0){
          zup2+=(Global_DATA[i][ii+1][4]-Global_DATA[i][ii][4])/1000; 
          if(zup2>=t_pod){
            litry1=litry0-Global_DATA[i][ii][2];
            if(litry>min_sliv/2 && litry1>min_sliv){
              $("#unit_table").append("<tr class='sliv_trak' id='"+id+"," + parseFloat(Global_DATA[i][ii][0].split(',')[0])+","+parseFloat(Global_DATA[i][ii][0].split(',')[1])+ "'><td align='left'>"+nametr+"</td><td>"+start+"</td><td>"+finish+"</td><td>"+litry.toFixed(1)+"л </td><td>"+(interval1-interval0)/1000+" сек </td></tr>");
              zup1=0;
              zup2=0;
              litry=0;
              start=0;
              finish=0;
              interval0=0;
              interval1=0;
              litry0=0;
              litry1=0;
              litry_start=0;
            }else{
              zup1=30;
              zup2=0;
              litry=0;
              start=0;
              finish=0;
              interval0=0;
              interval1=0;
              litry0=0;
              litry1=0;
              litry_start=0;
            }
          }
        }
        if(rashod<-500){
          zup1=0;
          zup2=0;
          litry=0;
          start=0;
          finish=0;
          interval0=0;
          interval1=0;
          litry0=0;
          litry1=0;
          litry_start=0;
        }
        
      }else{
        zup1=0;
        zup2=0;
        litry=0;
        start=0;
        finish=0;
        interval0=0;
        interval1=0;
        litry0=0;
        litry_start=0;
      }

    }
  }
 }



   
   function track_Sliv(evt){
    [...document.querySelectorAll("#unit_table tr")].forEach(e => e.style.backgroundColor = '');
    this.style.backgroundColor = 'pink';
    let row = evt.target.parentNode; // get row with data by target parentNode
    let data=row.cells[1].textContent;
    let data2=row.cells[2].textContent;
    slider.value=(Date.parse(data)-Date.parse($('#fromtime1').val()))/(Date.parse($('#fromtime2').val())-Date.parse($('#fromtime1').val()))*2000;
     position(Date.parse(data));
     $("#lis0").chosen().val(this.id.split(',')[0]);
     $("#lis0").trigger("chosen:updated");
     markerByUnit[this.id.split(',')[0]].openPopup();
     
     if ($('#grafik').is(':hidden')) {
      $('#grafik').show();
      $('#map').css('height', '470px');
      $('#marrr').css('height', '470px');
      $('#option').css('height', '470px');
      $('#unit_info').css('height', '470px');
      $('#zupinki').css('height', '470px');
      $('#palne').css('height', '470px');
      $('#monitoring').css('height', '470px');
    } 
     show_gr(data,data2);
     map.setView([parseFloat(this.id.split(',')[1]), parseFloat(this.id.split(',')[2])+0.001],13);
    
  }
  let stor=[[51.55109167453309,33.34894127728944,373,'ККЗ'],
            [51.55228434066979,33.386545266234265,4197,'Кролевець'],
            [51.4932345615444,33.40017453599349,460,'Буйвалове'],
            [51.622424409240104,33.0929363543844,436,'Райгородок ферма'],
            [50.4492015637774,30.522985309694278,23152,'Київ'],
            [51.6774937843498,33.912505721196304,3297,'Глухів'],
            [51.412857770427244,33.67605192358615,1567,'Литвиновичі'],
            [51.4825837218785,33.5581076862021,1332,'Локня'],
            [51.745262906172094,33.7985328417313,179,'стан Слоут'],
            [51.76140736845421,33.794152274694625,2640,'Слоут']
           ];
async function marshrut_avto(){
  msg('Розпочато зівт маршрутів авто ЗАЧЕКАЙТЕ');
    $("#unit_table").empty();
    $("#unit_table").append("<tr><td>ТЗ</td><td>Початок</td><td>Кінець</td><td>Маршрут</td><td>Пробіг</td></tr>");
    let kkk=0;
    let points = 0; 
    let stoyanka = 0;
    let sttime = 300;
    let km = 0;
    let start=0;
    let end=0;
    let html="";
    
    let adres='';
    let adres0='';
     for(let i = 0; i<Global_DATA.length; i++){ 
      points = 0;
      stoyanka = 500;
      km = 0;
      start="";
      end="";
      html="";
      adres0='';
     let nametr = Global_DATA[i][0][1];
     let id = Global_DATA[i][0][0];
     let str =$('#unit_marsh').val().split(',');
     
      for(let v = 0; v<str.length; v++){ 
        if(nametr.indexOf(str[v])<0)continue;
      let markerr= markerByUnit[id];
      let lat = 0;
      let lon = 0;
      if(markerr){
        lat = markerr.getLatLng().lat;
        lon = markerr.getLatLng().lng;
      }
      
       for (let ii = 1; ii<Global_DATA[i].length-1; ii+=1){
   
       if(parseInt(Global_DATA[i][ii][3])<4){ 
        if((Global_DATA[i][ii][4]-Global_DATA[i][ii-1][4])/1000)stoyanka+=(Global_DATA[i][ii][4]-Global_DATA[i][ii-1][4])/1000; 
       }
       if(!Global_DATA[i][ii][0])continue;
       if(!Global_DATA[i][ii-1][0])continue;
       if(!Global_DATA[i][ii+1][0])continue;
       if(parseInt(Global_DATA[i][ii][3])>0){
        let yy = parseFloat(Global_DATA[i][ii][0].split(',')[0]);
        let xx = parseFloat(Global_DATA[i][ii][0].split(',')[1]);
        let yyy = parseFloat(Global_DATA[i][ii+1][0].split(',')[0]);
        let xxx = parseFloat(Global_DATA[i][ii+1][0].split(',')[1]);
        km+=(wialon.util.Geometry.getDistance(yy,xx,yyy,xxx))/1000;
       }

       if(parseInt(Global_DATA[i][ii][3])>=4){
        if(!Global_DATA[i][ii][0])continue;
        if(!Global_DATA[i][ii-1][0])continue;
        if(!Global_DATA[i][ii+1][0])continue;
        if (start==0)start=Global_DATA[i][ii][1];
        end=Global_DATA[i][ii][1];
       
       
        if(stoyanka>sttime){ 
            let y = parseFloat(Global_DATA[i][ii][0].split(',')[0]);
            let x = parseFloat(Global_DATA[i][ii][0].split(',')[1]);
            for (let j = 0; j<stor.length; j++){
              if(wialon.util.Geometry.getDistance(y,x,stor[j][0],stor[j][1])<stor[j][2]){
                adres=stor[j][3];
                if(adres0!=adres){
                  html+=" "+adres+" -";
                  adres0=adres;
                }
                break;
              }
              if(j ==stor.length-1){
                adres='00000000';
                wialon.util.Gis.getLocations([{lat: y, lon: x}], function(code, data) {
                  if (code) { msg(wialon.core.Errors.getErrorText(code));adres='НЕВІДОМО'; return; } // exit if error code
                  if (data) {let adr =data[0].split(' '); adres =adr[adr.length-1];}});
                await sleep(500); 
                if(adres0!=adres){
                  html+=" "+adres+" -";
                  adres0=adres;
                }
                stor.push([y, x,600,adres]);
                //let circle1 = L.circle([y, x], { color: 'red', fillColor: 'red', fillOpacity: 0.5, radius: 600}).addTo(map);
                kkk++;               
              }
            }
          }else{
            if(ii<31)continue;
            if(ii>Global_DATA[i].length-11)continue;
            if(stoyanka==0)continue;
            if(!Global_DATA[i][ii-30][0])continue;
            if(!Global_DATA[i][ii-20][0])continue;
            if(!Global_DATA[i][ii-10][0])continue;
            if(!Global_DATA[i][ii+10][0])continue;
            let y000 = parseFloat(Global_DATA[i][ii-30][0].split(',')[0]);
            let x000 = parseFloat(Global_DATA[i][ii-30][0].split(',')[1]);
            let y00 = parseFloat(Global_DATA[i][ii-10][0].split(',')[0]);
            let x00 = parseFloat(Global_DATA[i][ii-10][0].split(',')[1]);
            let y0 = parseFloat(Global_DATA[i][ii-20][0].split(',')[0]);
            let x0 = parseFloat(Global_DATA[i][ii-20][0].split(',')[1]);
            let y1 = parseFloat(Global_DATA[i][ii][0].split(',')[0]);
            let x1 = parseFloat(Global_DATA[i][ii][0].split(',')[1]);
            let y2 = parseFloat(Global_DATA[i][ii+10][0].split(',')[0]);
            let x2 = parseFloat(Global_DATA[i][ii+10][0].split(',')[1]);

             let d=wialon.util.Geometry.getDistance(y2,x2,y1,x1);
            for (let v = ii-1; v>0; v--){
              if(!Global_DATA[i][v][0])continue;
              y000 = parseFloat(Global_DATA[i][v][0].split(',')[0]);
              x000 = parseFloat(Global_DATA[i][v][0].split(',')[1]);
              if(wialon.util.Geometry.getDistance(y000,x000,y1,x1)>d)break;
            }


            let point000 = turf.point([x000, y000]);
            let point00 = turf.point([x00, y00]);
            let point0 = turf.point([x0, y0]);
            let point1 = turf.point([x1, y1]);
            let point2 = turf.point([x2, y2]);
            let bearing0 = turf.bearing(point1, point0);
            let bearing1 = turf.bearing(point1, point2);
            let bearing3 = turf.bearing(point1, point00);
            let bearing4 = turf.bearing(point1, point000);
            //L.polyline([[y0, x0],[y1, x1]], {color: 'red'}).addTo(map);
            //L.polyline([[y1, x1],[y2, x2]], {color: '#55ff33'}).addTo(map);
            if(Math.abs(bearing4-bearing1)<30 || Math.abs(bearing4-bearing1)>330){
              bearing4=1;
              if(wialon.util.Geometry.getDistance(y000,x000,y1,x1)<5){bearing4=0;}
            }else{bearing4=0;}

            if(Math.abs(bearing3-bearing1)<30 || Math.abs(bearing3-bearing1)>330){
              bearing3=1;
              if(wialon.util.Geometry.getDistance(y00,x00,y1,x1)<5){bearing3=0;}
            }else{bearing3=0;}
            


            if(Math.abs(bearing0-bearing1)<30 || Math.abs(bearing0-bearing1)>330 || bearing3==1|| bearing4==1){ 
              //L.polyline([[y0, x0],[y1, x1]], {color: 'red'}).addTo(map);
              //L.polyline([[y1, x1],[y2, x2]], {color: '#55ff33'}).addTo(map);
              
               for (let j = 0; j<stor.length; j++){
                if(wialon.util.Geometry.getDistance(y1,x1,stor[j][0],stor[j][1])<stor[j][2]){
                  adres=stor[j][3];
                  if(adres0!=adres){
                    html+=" "+adres+" -";
                    adres0=adres;
                  }
                  break;
                }
                if(j ==stor.length-1){
                  adres='00000000';
                  wialon.util.Gis.getLocations([{lat: y1, lon: x1}], function(code, data) {
                    if (code) { msg(wialon.core.Errors.getErrorText(code));adres='НЕВІДОМО'; return; } // exit if error code
                    if (data) {let adr =data[0].split(' '); adres =adr[adr.length-1];}});
                  await sleep(500); 
                  if(adres0!=adres){
                    html+=" "+adres+" -";
                    adres0=adres;
                  }
                  stor.push([y1, x1,600,adres]);
                  //let circle1 = L.circle([y1, x1], { color: '#55ff33', fillColor: '#55ff33', fillOpacity: 0.5, radius: 600}).addTo(map);
                   kkk++;
                }
              }
            }
          }
          stoyanka=0;
          points=0;
          adres='';
       }
       if(ii==Global_DATA[i].length-2){
        if(stoyanka>sttime){ 
          let y = parseFloat(Global_DATA[i][ii][0].split(',')[0]);
          let x = parseFloat(Global_DATA[i][ii][0].split(',')[1]);
          for (let j = 0; j<stor.length; j++){
            if(wialon.util.Geometry.getDistance(y,x,stor[j][0],stor[j][1])<stor[j][2]){
              adres=stor[j][3];
              if(adres0!=adres){
                html+=" "+adres+" -";
                adres0=adres;
              }
              break;
            }
            if(j ==stor.length-1){
              adres='00000000';
              wialon.util.Gis.getLocations([{lat: y, lon: x}], function(code, data) {
                if (code) { msg(wialon.core.Errors.getErrorText(code));adres='НЕВІДОМО'; return; } // exit if error code
                if (data) {let adr =data[0].split(' '); adres =adr[adr.length-1];}});
              await sleep(500); 
              if(adres0!=adres){
                html+=" "+adres+" -";
                adres0=adres;
              }
              stor.push([y, x,600,adres]);
              //let circle1 = L.circle([y, x], { color: 'red', fillColor: 'red', fillOpacity: 0.5, radius: 600}).addTo(map);
              kkk++;               
            }
          }
        }

       }
 
     }
     if(km.toFixed()>0)$("#unit_table").append("<tr class='fail_trak' id='"+id+"," + lat+","+lon+ "'><td align='left'>"+nametr+"</td><td>"+start.slice(11, 16) +"</td><td>"+end.slice(11, 16) +"</td><td>"+html.slice(0, -1) +"</td><td>"+ km.toFixed()+"</td></tr>");
    }
    }
    msg('Завантажено зівт маршрутів авто');
    }

    function sleep(ms) {return new Promise(resolve => setTimeout(resolve, ms)); }  
    function Serch_GEO(adres) { 
        wialon.util.Gis.searchByString(adres,0,1, function(code, data) {
        if (code) { msg(wialon.core.Errors.getErrorText(code)); return; } // exit if error code
        if (data) {if (data[0]){map.setView([data[0].items[0].y, data[0].items[0].x], 13); }}});
    }
 
   let probl="";
    function Monitoring2(){
      let rows = document.querySelectorAll('#monitoring_table tr');
      let sttime=$('#min_zup_mon').val()*60;
      let coll = "#98FB98";
      let str =$('#unit_monitoring').val().split(',');
      for(let i = 0; i<Global_DATA.length; i++){ 
       let nametr = Global_DATA[i][0][1];
       let id = Global_DATA[i][0][0];
        for(let v = 0; v<str.length; v++){ 
          if(nametr.indexOf(str[v])<0)continue;
          let sy=0;
          let sx=0;
          let ssy=0;
          let ssx=0;
          let kmx=0;
          let kmy=0;
          let stoyanka=0;
          let stroka=[];
       
         for (let ii = 1; ii<Global_DATA[i].length-1; ii+=1){      
              if(ii<2)continue;
              if(ii>Global_DATA[i].length-2)continue;
              if(!Global_DATA[i][ii-1][0])continue;
              if(!Global_DATA[i][ii][0])continue;
              if(!Global_DATA[i][ii+1][0])continue;

              if(Global_DATA[i][ii][3][0]=='0'){ 
                stoyanka+=(Global_DATA[i][ii][4]-Global_DATA[i][ii-1][4])/1000;
                if(stroka.length>0 && stoyanka>sttime){
                  if(stroka[stroka.length-1]!='сто'){
                  stroka.push('сто');
                  }
                  stoyanka=0;
                  continue;
                  }
              }else{stoyanka=0;}
              
              let y0 = parseFloat(Global_DATA[i][ii-1][0].split(',')[0]);
              let x0 = parseFloat(Global_DATA[i][ii-1][0].split(',')[1]);
              let y1 = parseFloat(Global_DATA[i][ii][0].split(',')[0]);
              let x1 = parseFloat(Global_DATA[i][ii][0].split(',')[1]);
              let y2 = parseFloat(Global_DATA[i][ii+1][0].split(',')[0]);
              let x2 = parseFloat(Global_DATA[i][ii+1][0].split(',')[1]);
  
              let point0 = turf.point([x0, y0]);
              let point1 = turf.point([x1, y1]);
              let point2 = turf.point([x2, y2]);
              let bearing0 = 0;
              let bearing1 = 0;
              if(wialon.util.Geometry.getDistance(y0,x0,y1,x1)>wialon.util.Geometry.getDistance(y1,x1,y2,x2)){
               bearing0 = turf.bearing(point0, point1);
               bearing1 = turf.bearing(point0, point2);
              }else{
               bearing0 = turf.bearing(point2, point1);
               bearing1 = turf.bearing(point2, point0);
              }
              
              
              if(Math.abs(bearing0-bearing1)<10 || Math.abs(bearing0-bearing1)>350){ 
                //L.polyline([[y0, x0],[y2, x2]], {color: 'red'}).addTo(map);
                if(sy==0){sy=y0;i0=ii-1}
                if(sx==0)sx=x0; 

              }else{
                //L.polyline([[y0, x0],[y2, x2]], {color: 'red'}).addTo(map);
                if(sy!=0 && wialon.util.Geometry.getDistance(sy,sx,y1,x1)>50){
                  if(ssy!=0 && wialon.util.Geometry.getDistance(ssy,ssx,y1,x1)<50){

                    let y100 = ((sy+y1)/2).toFixed(6);
                    let x100 = ((sx+x1)/2).toFixed(6);
                    
                    
                    
                    if(stroka.length>0){
                     let nnn = stroka[stroka.length-1];
                     let nn = 'роб <br>' + PointInField(y100,x100).split(' ')[0];
                     if( nn == 'роб <br>невідомо'){nn = 'роб <br>' + PointInField(y1,x1).split(' ')[0];}
                     if( nn == 'роб <br>невідомо'){nn = 'роб <br>' + PointInField(sy,sx).split(' ')[0];}
                     if(nnn!=nn){
                     stroka.push(nn);
                     if ($("#robviz_gif").is(":checked") && nn == 'роб <br>невідомо') {
                      if(probl.indexOf(y100)<0){
                        let markerrr = L.marker([y100,x100]).addTo(map);
                        let ln = L.polyline([[sy, sx],[y1, x1]], {color: '#55ff33'}).addTo(map);
                        markerrr.bindPopup(""+nametr+"");
                        zup_mark_data.push(markerrr);
                        zup_mark_data.push(ln);
                        probl+=y100;
                      }
                    
                     }
                     }
                     }else{
                      let nn = 'роб <br>' + PointInField(y100,x100).split(' ')[0];
                      if( nn == 'роб <br>невідомо'){nn = 'роб <br>' + PointInField(y1,x1).split(' ')[0];}
                      if( nn == 'роб <br>невідомо'){nn = 'роб <br>' + PointInField(sy,sx).split(' ')[0];}
                      stroka.push(nn);
                      if ($("#robviz_gif").is(":checked") && nn == 'роб <br>невідомо') {
                        if(probl.indexOf(y100)<0){
                          let markerrr = L.marker([y100,x100]).addTo(map);
                          let ln = L.polyline([[sy, sx],[y1, x1]], {color: '#55ff33'}).addTo(map);
                          markerrr.bindPopup(""+nametr+"");
                          zup_mark_data.push(markerrr);
                          zup_mark_data.push(ln);
                          probl+=y100;
                        }
                       }
                     }
                     kmx=0;
                     kmy=0;
                    //L.polyline([[sy, sx],[y1, x1]], {color: 'red'}).addTo(map);
                  }else{
                    if(kmx==0){kmx=sx;kmy=sy;}
                    if(wialon.util.Geometry.getDistance(kmy,kmx,y1,x1)>4000){
                    if(stroka.length>0){
                      if(stroka[stroka.length-1]!='пер'){
                        stroka.push('пер');
                      }
                      }else{
                         stroka.push('пер');
                        }
                      }
                    //L.polyline([[sy, sx],[y1, x1]], {color: '#55ff33'}).addTo(map);
                  }
                 
                  ssy=sy;
                  ssx=sx;
                  
                }
                sy=0;
                sx=0;
              }
    }

    if(stroka.length>0){
    
    
      let strr="";
     if(rows.length>0){
      for(let v = 0; v<rows.length; v++){
      if(rows[v].cells[0].textContent==nametr.split(' ')[0]+' '+nametr.split(' ')[1]+''+Global_DATA[i][Global_DATA[i].length-1][5].split(' ')[0]){
       let ind=stroka.length-(rows[v].cells.length-1);
    
       if(ind<=0){
       if(rows[v].cells[1].innerHTML!=stroka[stroka.length-1]){
       rows[v].cells[1].innerHTML=stroka[stroka.length-1];
       coll = "#98FB98";
        if(stroka[stroka.length-1]=="пер"){coll = "#FFFF00";}
        if(stroka[stroka.length-1]=="роб <br>невідомо"){coll = "#f8b1c0";}
        rows[v].cells[1].style.backgroundColor = coll;
       }
       }
       if(rows[v].cells[1].innerHTML!=stroka[rows[v].cells.length-2]){
        rows[v].cells[1].innerHTML=stroka[rows[v].cells.length-2];
        coll = "#98FB98";
         if(stroka[rows[v].cells.length-2]=="пер"){coll = "#FFFF00";}
         if(stroka[rows[v].cells.length-2]=="роб <br>невідомо"){coll = "#f8b1c0";}
         rows[v].cells[1].style.backgroundColor = coll;
        }
    
       for(let vv = ind-1; vv>=0; vv--){
        if(rows[v].cells[1].innerHTML!=stroka[stroka.length-1-vv]){
        rows[v].insertCell(1);
        rows[v].cells[1].innerHTML=stroka[stroka.length-1-vv];
        coll = "#98FB98";
        if(stroka[stroka.length-1-vv]=="пер"){coll = "#FFFF00";}
        if(stroka[stroka.length-1-vv]=="роб <br>невідомо"){coll = "#f8b1c0";}
        rows[v].cells[1].style.backgroundColor = coll;
        }  
       }
       break;
      }else{
        if(v==rows.length-1){ 
       for(let v = stroka.length-1; v>=0; v--){
         coll = "#98FB98";
         if(stroka[v]=="пер"){coll = "#FFFF00";}
         if(stroka[v]=="роб <br>невідомо"){coll = "#f8b1c0";}
         strr+= "<td bgcolor = '"+coll+"'>"+stroka[v]+"</td>";
         }
        $("#monitoring_table").append("<tr id="+id+"><td>"+nametr.split(' ')[0]+' '+nametr.split(' ')[1]+'<br>'+Global_DATA[i][Global_DATA[i].length-1][5].split(' ')[0]+"</td>"+strr+"</tr>");
           }
       }
      }
      }else{
      
      for(let v = stroka.length-1; v>=0; v--){
         coll = "#98FB98";
         if(stroka[v]=="пер"){coll = "#FFFF00";}
         if(stroka[v]=="роб <br>невідомо"){coll = "#f8b1c0";}
         strr+= "<td bgcolor = '"+coll+"'>"+stroka[v]+"</td>";
         }
        $("#monitoring_table").append("<tr id="+id+"><td>"+nametr.split(' ')[0]+' '+nametr.split(' ')[1]+'<br>'+Global_DATA[i][Global_DATA[i].length-1][5].split(' ')[0]+"</td>"+strr+"</tr>");
      }
     }
  }
}
$('#men7').css({'background':'#fffd7e'});
}





function write_jurnal(id,file_name,content,calbek){
  let remotee= wialon.core.Remote.getInstance(); 
  remotee.remoteCall('file/write',{'itemId':id,'storageType':1,'path':'//'+file_name,"content":content,"writeType":1,'contentType':0},function (error) {
    if (error) {msg(wialon.core.Errors.getErrorText(error));
    return;
    }else{
      msg("записано до журналу")
    calbek();
    return;
   }
}); 

}
function load_jurnal(id,file_name,calbek){
  let remotee= wialon.core.Remote.getInstance(); 
  let jurnal_data=[];
  remotee.remoteCall('file/read',{'itemId':id,'storageType':1,'path':'//'+file_name,'contentType':0},function (error,data) {
     if (error) {msg(wialon.core.Errors.getErrorText(error));
      return;
     }else{
      jurnal_data=data.content.split('||');
      calbek(jurnal_data);
      return;
    }
}); 
}
function update_jurnal(id,file_name,calbek){
  let remotee= wialon.core.Remote.getInstance(); 
  remotee.remoteCall('file/list',{'itemId':id,'storageType':1,'path':'/','mask':file_name,'recursive':false,'fullPath':false},function (error,data) { 
    if (error) {
      msg(wialon.core.Errors.getErrorText(error));
      return;
    }else{
      calbek(data[0].s);
     return;
    } 
});
}




let autorization ='';
let jurnal_size=0;
let jurnal_data=[];

function jurnal(obj,unit){
  if(obj==0){
    clearGEO();
    $('#jurnal').show();
    $('#jurnal_upd').show();
    $('#inftb').hide();
    $("#jurnal_name").text(""+unit.getName()+"");
    //let remotee= wialon.core.Remote.getInstance(); 
    //remotee.remoteCall('file/list',{'itemId':20233,'storageType':1,'path':'/','mask':'jurnal (3).txt','recursive':false,'fullPath':true},function (error,data) { if (error) {msg(wialon.core.Errors.getErrorText(error));}else{console.log(data);}});  
    //remotee.remoteCall('file/write',{'itemId':20233,'storageType':1,'path':'//jurnal.txt',"content":'helo||',"writeType":1,'contentType':0},function (error,data) {if (error) {msg(wialon.core.Errors.getErrorText(error));}else{console.log("write_done");}}); 
    //remotee.remoteCall('file/read',{'itemId':20233,'storageType':1,'path':'//jurnal.txt','contentType':0},function (error,data) { if (error) {msg(wialon.core.Errors.getErrorText(error));}else{console.log(data.content);}}); 
  }
  if(obj==1){
    $('#jurnal').show();
    $('#jurnal_upd').show();
    $('#inftb').show();
    $("#jurnal_name").text(""+unit.n+"");
  }
  jurnal_update();
}
function jurnal_update(){
  let tt = new Date(Date.parse($('#f').text())).toJSON().slice(0,10);
  $('#jurnal_time').val(tt);

  update_jurnal(20233,'jurnal.txt',function (data) { 
    let nam_js = $("#jurnal_name").text();
    if (data==jurnal_size){
      $("#jurnal_name_table").empty();
      load_jurnal(20233,'jurnal_delete.txt',function (data) {
        let unit_jr_data=[]; 
          dataLoop:for(let i = 1; i<jurnal_data.length; i++){
            for (v = 1; v < data.length; v++) {if (parseInt(data[v]) == i) continue dataLoop; } 
            let m=jurnal_data[i].split('|');
              if(m[1]==nam_js) unit_jr_data.push(m); 
          }
          unit_jr_data.sort(function(a,b){return a[0] - a[0]})
          let index=unit_jr_data.length-10;
          if(index<0)index=0;
          for(let i = index; i<unit_jr_data.length; i++){
            let d=new Date(parseInt(unit_jr_data[i][0])).toLocaleString("uk-UA", {year:'numeric',month:'numeric',day:'numeric'});
            let t=new Date(parseInt(unit_jr_data[i][4])).toLocaleString("uk-UA", {year:'numeric',month:'numeric',day:'numeric',hour:'numeric', minute: 'numeric', second: 'numeric'});
            $("#jurnal_name_table").append("<tr><td>"+d+"</td><td>"+unit_jr_data[i][2]+"</td><td>"+unit_jr_data[i][3]+"</td><td>"+t+"</td></tr>");
          }
      });
    }else{
      let size=data;
      load_jurnal(20233,'jurnal.txt',function (data) { 
        jurnal_data=data;
        jurnal_size=size;
        $("#jurnal_name_table").empty();
        load_jurnal(20233,'jurnal_delete.txt',function (data) { 
          let unit_jr_data=[]; 
          dataLoop:for(let i = 1; i<jurnal_data.length; i++){
            for (v = 1; v < data.length; v++) {if (parseInt(data[v]) == i) continue dataLoop; } 
            let m=jurnal_data[i].split('|');
              if(m[1]==nam_js) unit_jr_data.push(m); 
          }
          unit_jr_data.sort(function(a,b){return a[0] - a[0]})
          let index=unit_jr_data.length-10;
          if(index<0)index=0;
          for(let i = index; i<unit_jr_data.length; i++){
            let d=new Date(parseInt(unit_jr_data[i][0])).toLocaleString("uk-UA", {year:'numeric',month:'numeric',day:'numeric'});
            let t=new Date(parseInt(unit_jr_data[i][4])).toLocaleString("uk-UA", {year:'numeric',month:'numeric',day:'numeric',hour:'numeric', minute: 'numeric', second: 'numeric'});
            $("#jurnal_name_table").append("<tr><td>"+d+"</td><td>"+unit_jr_data[i][2]+"</td><td>"+unit_jr_data[i][3]+"</td><td>"+t+"</td></tr>");
          }
        });
        jurnal_online();
      });
    }
  });
}

$('#jurnal_write_buton').hide();
$('#polya_jurnal').hide();
$('.jurnal_autorization_buton').click(function() { 
  let ps = prompt('');
  if(ps==0000){
    autorization="Баришевський В.";
    msg(autorization);   
    $('#jurnal_autorization_buton').hide();
    $('#jurnal_write_buton').show();
  }
  if(ps==1111){
    autorization="Пальгуй С.";
    msg(autorization);
    $('.jurnal_autorization_buton').hide();
    $('#jurnal_write_buton').show();
    $('#polya_jurnal').show();

  }
});

$('#jurnal_write_buton').click(function() { 
let date=document.getElementById("jurnal_time").valueAsNumber;
let time=Date.now();
let name=$('#jurnal_name').text();;
let text=$('#jurnal_text').val();
let autor=autorization;
if(date && name && text && autor && autorization!=''){
  write_jurnal(20233,'jurnal.txt','||'+date+'|'+name+'|'+text+'|'+autor+'|'+time,function () { 
    jurnal_update();
  });
}
});


function jurnal_online(){
  let table_jur=document.getElementById('jurnal_online_tb');
  let index =0;
  if (table_jur.rows.length>1)index =  parseInt(table_jur.rows[table_jur.rows.length-1].cells[0].innerText)+1;
  update_jurnal(20233,'jurnal.txt',function (data) { 
    if (data==jurnal_size){ 
      if(index==0)index=jurnal_data.length-20;
      if(index<1)index=1;
        load_jurnal(20233,'jurnal_delete.txt',function (data) {

        for(let i = index; i<jurnal_data.length; i++){
        let m=jurnal_data[i].split('|');
        let d=new Date(parseInt(m[0])).toLocaleString("uk-UA", {year:'numeric',month:'numeric',day:'numeric'});
        let t=new Date(parseInt(m[4])).toLocaleString("uk-UA", {year:'numeric',month:'numeric',day:'numeric',hour:'numeric', minute: 'numeric', second: 'numeric'});
        if(m[3]==autorization){
          $("#jurnal_online_tb").append("<tr id="+m[1]+" bgcolor='#CEFFCE'><td>"+i+"</td><td>"+d+"</td><td>"+m[1]+"</td><td>"+m[2]+"</td><td>"+m[3]+"</td><td>"+t+"</td><td>&#10060</td></tr>");
        }else{
          $("#jurnal_online_tb").append("<tr id="+m[1]+" bgcolor='#CEFFCE'><td>"+i+"</td><td>"+d+"</td><td>"+m[1]+"</td><td>"+m[2]+"</td><td>"+m[3]+"</td><td>"+t+"</td></tr>");
        }
        $('#jurnal_online').scrollTop($('#jurnal_online').height());
      }
      let table_jr=document.getElementById('jurnal_online_tb');
            for(let i = 1; i<table_jr.rows.length; i++){
              for (v = 1; v < data.length; v++) {
                if (data[v] == table_jr.rows[i].cells[0].textContent){
                  table_jr.rows[i].cells[0].closest('tr').remove();
                  i--;
                  break;
                }
              } 
            }

    });
    }else{
      let size=data;
      load_jurnal(20233,'jurnal.txt',function (data) { 
        jurnal_data=data;
        jurnal_size=size;
        if(index==0)index=jurnal_data.length-20;
        if(index<1)index=1;
        load_jurnal(20233,'jurnal_delete.txt',function (data) { 
          for(let i = index; i<jurnal_data.length; i++){
          let m=jurnal_data[i].split('|');
          let d=new Date(parseInt(m[0])).toLocaleString("uk-UA", {year:'numeric',month:'numeric',day:'numeric'});
          let t=new Date(parseInt(m[4])).toLocaleString("uk-UA", {year:'numeric',month:'numeric',day:'numeric',hour:'numeric', minute: 'numeric', second: 'numeric'});
        if(m[3]==autorization){
          $("#jurnal_online_tb").append("<tr id="+m[1]+" bgcolor='#CEFFCE'><td>"+i+"</td><td>"+d+"</td><td>"+m[1]+"</td><td>"+m[2]+"</td><td>"+m[3]+"</td><td>"+t+"</td><td>&#10060</td></tr>");
        }else{
          $("#jurnal_online_tb").append("<tr id="+m[1]+" bgcolor='#CEFFCE'><td>"+i+"</td><td>"+d+"</td><td>"+m[1]+"</td><td>"+m[2]+"</td><td>"+m[3]+"</td><td>"+t+"</td></tr>");
        }
          $('#jurnal_online').scrollTop($('#jurnal_online').height());
        }
        let table_jr=document.getElementById('jurnal_online_tb');
        for(let i = 1; i<table_jr.rows.length; i++){
          
          for (v = 1; v < data.length; v++) {
            if (data[v] == table_jr.rows[i].cells[0].textContent){
              table_jr.rows[i].cells[0].closest('tr').remove();
              i--;
              break;
            }
          } 
        }
      });
        $('#men3').css({'background':'pink',  'box-shadow':'0px 0px 5px 5px rgba(255, 1, 1, 0.479)'});
        audio.play();
      });
    }
  });
}

$("#jurnal_online_tb").on("click", function (evt){
  let row = evt.target.parentNode;
  if(row.rowIndex>0){
if(evt.target.cellIndex==6){
    write_jurnal(20233,'jurnal_delete.txt','||'+row.cells[0].textContent,function () { 
      msg("запис видалено");
      jurnal_update();
      jurnal_online();
      return;
    });
}
  
    row.style.backgroundColor = 'transparent';
    let name = row.cells[2].textContent;
    for (let i = 0; i<geozones.length; i++){
      if(geozones[i].zone.n == name){
       let y=geozones[i]._bounds._northEast.lat;
       let x=geozones[i]._bounds._northEast.lng;
       map.setView([y,x+0.02],14);
       clearGEO();
       let point = geozones[i]._latlngs[0];
       let ramka=[];
       for (let i = 0; i < point.length; i++) {
       let lat =point[i].lat;
       let lng =point[i].lng;
       ramka.push([lat, lng]);
       if(i == point.length-1 && ramka[0]!=ramka[i])ramka.push(ramka[0]); 
       }
       let polilane = L.polyline(ramka, {color: 'blue'}).addTo(map);
       geo_layer.push(polilane);
         break;
      }
      }
     for (let i = 0; i<unitslist.length; i++){
      let nm=unitslist[i].getName();
      let id=unitslist[i].getId();
     if(nm == name){
      let y=unitslist[i].getPosition().y;
      let x=unitslist[i].getPosition().x;
      map.setView([y,x+0.04],14);
      $("#lis0").chosen().val(id);
      $("#lis0").trigger("chosen:updated");
      markerByUnit[id].openPopup();
        break;
     }
     }
     $("#jurnal_name").text(name);
     $('#inftb').hide();
     if($('#jurnal').is(':visible')){jurnal_update();}
  }
});



$("#jurnal_zvit_buton").on("click", function (){
  $("#unit_table").empty();
  let str =$('#jurnal_units').val().split(',');
  let fr =Date.parse($('#jurnal_time1').val());
  let to =Date.parse($('#jurnal_time2').val());
  update_jurnal(20233,'jurnal.txt',function (data) { 
    if (data==jurnal_size){ 
      load_jurnal(20233,'jurnal_delete.txt',function (data) { 
        dataLoop1: for(let i = 1; i<jurnal_data.length; i++){
          for (v = 1; v < data.length; v++) {if (parseInt(data[v]) == i) continue dataLoop1; } 
        let m=jurnal_data[i].split('|');
        let d=new Date(parseInt(m[0])).toLocaleString("uk-UA", {year:'numeric',month:'numeric',day:'numeric',hour:'numeric', minute: 'numeric', second: 'numeric'});
        let nametr = m[1];
        if(m[0]>fr && m[0]<to){
        if(str.lenght>0){

          for(let v = 0; v<str.length; v++){ 
            if(nametr.indexOf(str[v])<0)continue;
            $("#unit_table").append("<tr id="+m[1]+"><td>"+i+"</td><td>"+d+"</td><td>"+nametr+"</td><td>"+m[2]+"</td><td>"+m[3]+"</td></tr>");
            break;
               } 
             }else{
             $("#unit_table").append("<tr id="+m[1]+"><td>"+i+"</td><td>"+d+"</td><td>"+nametr+"</td><td>"+m[2]+"</td><td>"+m[3]+"</td></tr>");
            } 
          }
      }
    });
    }else{
      let size=data;
      load_jurnal(20233,'jurnal.txt',function (data) { 
        jurnal_data=data;
        jurnal_size=size;
        load_jurnal(20233,'jurnal_delete.txt',function (data) { 
          dataLoop1: for(let i = 1; i<jurnal_data.length; i++){
            for (v = 1; v < data.length; v++) {if (parseInt(data[v]) == i) continue dataLoop1; } 
          let m=jurnal_data[i].split('|');
          let d=new Date(parseInt(m[0])).toLocaleString("uk-UA", {year:'numeric',month:'numeric',day:'numeric'});
          let t=new Date(parseInt(m[4])).toLocaleString("uk-UA", {year:'numeric',month:'numeric',day:'numeric',hour:'numeric', minute: 'numeric', second: 'numeric'});
          let nametr = m[1];
          if(m[0]>fr && m[0]<to){
        if(str.lenght>0){
          for(let v = 0; v<str.length; v++){ 
            if(nametr.indexOf(str[v])<0)continue;
            $("#unit_table").append("<tr id="+m[1]+"><td>"+i+"</td><td>"+d+"</td><td>"+nametr+"</td><td>"+m[2]+"</td><td>"+m[3]+"</td><td>"+t+"</td></tr>");
            break;
          } 
        }else{
          $("#unit_table").append("<tr id="+m[1]+"><td>"+i+"</td><td>"+d+"</td><td>"+nametr+"</td><td>"+m[2]+"</td><td>"+m[3]+"</td><td>"+t+"</td></tr>");
        }
      }
        }
      });
      });
    }
  });
});






$('.zvit').hide();
$( "#vib_zvit" ).on( "change", function() {
  $('.leaflet-container').css('cursor','');
  let id='#'+'z'+this.value;
  $('.zvit').hide();
  $("#unit_table").empty();
  $(id).show();
  if(this.value=='z1'||this.value=='z2'|| this.value=='z3')$('.leaflet-container').css('cursor','crosshair');
  clearGEO(); 
  clearGarbage(garbage);
  clearGarbage(garbagepoly);
  clearGarbage(marshrutMarkers);
  let tt = new Date(Date.parse($('#f').text())).toJSON().slice(0,10);
  $('#polya_jurnal_time').val(tt);
} );


$("#fast_obr_poliv").on("click", function (){
  $('#map').css('width', '65%');
  $('#marrr').hide();
  $('#option').hide();
  $('#unit_info').show();
  $('#zupinki').hide();
  $('#palne').hide();
  $('#monitoring').hide();
  clearGEO(); 
  $('#men3').css({'background':'#e9e9e9'});
  $('#men1').css({'background':'#e9e9e9'});
  $('#men4').css({'background':'#b2f5b4'});
  $('#men5').css({'background':'#e9e9e9'});
  $('#men6').css({'background':'#e9e9e9'});
  $('#men7').css({'background':'#e9e9e9'});
  clearGarbage(garbage);
  clearGarbage(garbagepoly);
  clearGarbage(marshrutMarkers);
  $("#unit_table").empty();
  $("#vib_zvit [value='z10']").attr("selected", "selected");
  $('.zvit').hide();
  $('#zz10').show();
  let tt = new Date(Date.parse($('#f').text())).toJSON().slice(0,10);
  $('#polya_jurnal_time').val(tt);
});
