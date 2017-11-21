/*
* Javascript document
* HCID Assignment - Polyzoom
* Authors: Mohamed Osman, Domonkos Horvath
*/

// ------------------------------------------------------------------
// ------------------------ GLOBAL VARIABLES ------------------------
// ------------------------------------------------------------------

//DrawManager global array
var dwManagers = [];

// Zoom level increase
var increaseZoomLevel = 3;

//Active viewport 
var m = 1.3;
var noav = 0; // number of active viewports
var avH = 0;
var avW = 0;
//Window size
var wWidth;
var wHeight;

// Maps
var mainMap;
var currentMapType = google.maps.MapTypeId.ROADMAP;

// Viewport ID here
var vpID = 3;
var gLevel = 0;   //Global level, this variable helps to check if we should create a new level or not
var nbOfViewports =[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];    // 15 levels, Store the number of viewports at each level, nbOfViewports[0] = 0 level (mainMap), [1] = level 
//TODO: make it dynamic

//Dynamic Layout manager variables
var VPhorizontally = 0;

// Random variables
var pickColor = 0;
var randomColors = [
    "#0eec82",
    "#367bef",
    "#d42714",
    "#eeed52",
    "#f96f78",
    "#992ccf",
    "#9d0a59",
    "#12d1cd",
    "#f08318",
    "#f96f78",
    "#992ccf",
    "#9d0a59",
    "#12d1cd",
    "#f08318",
];

// ------------------------------------------------------------------
// -------------------- MAIN MAP OPTIONS ----------------------------
// ------------------------------------------------------------------

// $( window ).load(function() {
//   $(".viewport").css({"height":"300","width":"400"});
// });

// MainMap options
var mainMapOptions = {
    id: 0,
    level: 0,
    center: new google.maps.LatLng(45,10),      // Center of Europe
    zoom: 4,
    disableDefaultUI: true,                   
    panControl: false,
    zoomControl: false,
    scaleControl: false,
    mapTypeControlOptions: {
      mapTypeIds: ["moon"]
    }
};



// Viewport map options
var viewportOptions = {
    id: 0,
    level: 0,
    center: new google.maps.LatLng(0,0),   //Show the whole map
    zoom: 1,
    disableDefaultUI: true,
    mapTypeControl:false,
    mapTypeControlOptions: {
      mapTypeIds: ["moon"]
    } 
  };


// Set main map to HTML div holder
mainMap = new google.maps.Map(document.getElementById("mainmap"), mainMapOptions);
google.maps.event.addListener(mainMap, 'drag', function() {
  updateCanvas();   
});

//Update canvas when zoom level changes in main map
google.maps.event.addListener(mainMap, 'zoom_changed', function() {
    updateCanvas();
  });


// Print the id of a map element: alert(mainMap.id);
// Add custom maptypes to mainMap and update it to the current one
addMapTypes(mainMap);
changeMapTypeMainMap();
addDrawingToMap(mainMap);


// ------------------------------------------------------------------
// -------------------------- FUNCTIONS -----------------------------
// ------------------------------------------------------------------

// ------------------------------------------------------------------
// Custom checkbox
function customCheckbox(){
  $('input').iCheck({
    checkboxClass: 'icheckbox_flat-red',
  });
}


// ------------------------------------------------------------------
// Rectangle created function --> call it in the rectangle created event !!!
 function createdRectangle(parentMap, rectangle){

  //Parentmap pass it as a parameter to draw the lines
  var rColor = rectangle.fillColor;

  // Get the center of the rectangle, get the rectangle NE and SW coordinates in latLng, 
  var center = getRectangleCenter(rectangle); //Call getRectangleFunction ---> get rectangle center coordinates LAT LNG

  //Set mainmap size back to regular after the first rectangle, pan it to the center of the rectangle
  google.maps.event.addDomListener( window, 'resize', function() {
    mainMap.setCenter(center);
  });

  // Create viewport
  var mapName = createViewport(parentMap, rColor, center); // get the new viewport google map, store it in mapName 
  addDrawingToMap(mapName);      // Add drawing manager to the new map


  //google.maps.event.trigger(mapName, 'resize');   // If the mapcontainer div gets resized
  // EVENT LISTENERS on the new VIEWPORT, updates rectangle when zoom level changed
  google.maps.event.addListener(mapName, 'zoom_changed', function() {
    var boundsOfViewport = mapName.getBounds(); //Get the center of the map --> will update rectangle center
    rectangle.setBounds(boundsOfViewport);
    updateCanvas();

  });

  //EVENT LISTENERS on the new VIEWPORT, updates rectangle when dragging / panning the map 
  google.maps.event.addListener(mapName, 'dragend', function() {
    var centerOfViewport = mapName.getBounds(); //Get the center of the map --> will update rectangle center
    rectangle.setBounds(centerOfViewport);
    // Draw correlation line
    drawCline(parentMap, rectangle, mapName, rColor);
  });
  
  // EVENT LISTENER on the rectangle, update viewport
  google.maps.event.addListener(rectangle, 'drag', function() {
  //  set the mapName (rectangle's viewport) center 
  var center = getRectangleCenter(rectangle);
  //console.log("rectangle bounds: " + rectangle.getBounds());
  //console.log("Mapname: vp" + mapName.level + mapName.id);
  mapName.panTo(center);
  // Draw correlation line
  drawCline(parentMap, rectangle, mapName, rColor);  
  });

  // google.maps.event.addListener(mapName, 'center_changed', function() {
  // //  set the mapName (rectangle's viewport) center 
  // var center = getRectangleCenter(rectangle);
  // mapName.setCenter(center);
  // // Draw correlation line
  // //drawCline(parentMap, rectangle, mapName, rColor);  
  // });
} 


// ------------------------------------------------------------------
// Add custom maptypes to a map
function addMapTypes(map){
  map.mapTypes.set("moon", moonMapType);
  map.mapTypes.set("sky", skyMapType);
  map.mapTypes.set("mars1", marsElevationMapType);
  map.mapTypes.set("mars2", marsVisibleMapType);
  map.mapTypes.set("mars3", marsInfraredMapType);
}


// ------------------------------------------------------------------
// Update MapType
function updateMapType(id){

  currentMapType = id;
  changeMapTypeMainMap();

}
function changeMapTypeMainMap(){
  mainMap.setMapTypeId(currentMapType);
}
function changeMapTypeViewPort(newViewport){
  newViewport.setMapTypeId(currentMapType);
}

// ------------------------------------------------------------------
// Add drawing manager to a map
function addDrawingToMap(Gmap){

   var drawingManager = new google.maps.drawing.DrawingManager({
    drawingMode: null,
    drawingControl: false,
    drawingControlOptions: {
    position: google.maps.ControlPosition.TOP_LEFT,
        drawingModes: [
        google.maps.drawing.OverlayType.RECTANGLE
        ]
    },
    rectangleOptions: {
      fillOpacity: 0.4,
      fillColor: randomColors[pickColor],
      strokeColor: randomColors[pickColor],
      strokeWeight: 3,
      clickable: true,
      editable: false,
      draggable: true,
      zIndex: 1
    }
  });
  dwManagers.push(drawingManager); // Add new drawingManager to global array
  drawingManager.setMap(Gmap);

  // Add event to drawingmanager
  google.maps.event.addListener(drawingManager, 'rectanglecomplete', function(rectangle) {
  // increase the number of pickcolor variable

  rectangle.setOptions({fillColor: randomColors[pickColor], strokeColor: randomColors[pickColor]});
  pickColor += 1;

  // Update rectangle color in drawingManager --- TODO: problem with the next rectangles, can't move them.
  // drawingManager.setOptions({
  // rectangleOptions: {
  //   fillColor: randomColors[pickColor],
  //   strokeColor: randomColors[pickColor]
  //   }
  // });

  var parentMap = rectangle.getMap();
  createdRectangle(parentMap, rectangle);
});
}

// ------------------------------------------------------------------
// Layout manager algorithm
function updateLayout(){
  // Viewport ratio
  var ratioW = 4
  var ratioH = 3

  //Max number of viewports horizontally
  for (i=0; i < nbOfViewports.length; i++) {
    if (VPhorizontally < nbOfViewports[i]) {
      VPhorizontally = nbOfViewports[i];
    }
  };

  //Global level + 1 (starts with 0)
  var VPvertically = gLevel+1;    
  console.log("Number of viewports horizontally: " + VPhorizontally + " vertically: " + VPvertically);

  // Container size             
  var cW = $( window ).width() - 100;
  var cH = $( window ).height() - 100;
  console.log("Container width: " + cW + " Container height: " + cH);

  var newWidth;
  var newHeight;

  if (VPhorizontally > VPvertically) {
      newWidth =    (cW / VPhorizontally);
      newHeight =   newWidth * (ratioH / ratioW);
  } else {
      newHeight =   (cH / VPvertically);
      newWidth =    newHeight * (ratioW / ratioH);
  }
  
  console.log("Size of each viewPort: " + newWidth + ", " + newHeight);
  $(".viewport").animate({width: Math.round(newWidth), height: Math.round(newHeight)}, 500 , "swing");
  // Update canvas after resizing viewports
  updateCanvas();
}



// ------------------------------------------------------------------
// -------------------- CREATE VIEWPORTS - sortable UI
// ------------------------------------------------------------------
$( 'div[class^="row level"]').sortable({ 
       
        axis: "x",
        opacity: 0.5,
        item: 'div[class^="viewport"]',
        
        activate: function( event, ui ) {

        },
        change: function( event, ui ) { updateCanvas();}
     });

    $('div[class^="row level"]' ).disableSelection();
    $('div[class^="row level"]').sortable('disable');

   

// ------------------------------------------------------------------
// -------------------- CREATE VIEWPORTS 
// ------------------------------------------------------------------
function createViewport(parentMap, rColor, centerLatLng){
  // if global level = parent level --> create new level
  var parentID = parentMap.id;
  var parentLevel = parentMap.level;
  var parentZoom = parentMap.zoom;
  var viewportsNextLevel = nbOfViewports[parentMap.id + 1];

  var newViewport;

  console.log("Parent: " + parentID + parentLevel);
  // viewPort + level it has been created + ID on that level
  var vpName = "viewport" + (parentLevel+1) + (viewportsNextLevel+1);  
  console.log("Will create: " + vpName);
  
  //create new level (row div in HTML file)
  //$( "#mapcontainer" ).append( '<div class="row level' + (parentLevel+1) + '"></div>' );
  
  // ------------------------------------------------------------------
  //Add viewport container div to the right level 

  $( ".level" + (parentLevel+1) ).append( '<div id="' + vpName + '" class="viewport"></div>' ); // Add viewport div to
  nbOfViewports[parentMap.id + 1] += 1; //Add new vp into the global array

  if (gLevel == (parentLevel+1) || gLevel == (parentLevel+2) || gLevel == (parentLevel+3)){
    console.log('Level not added, global level = ' + (parentLevel+1));
  } else {
    gLevel += 1;
  }

  newViewport = new google.maps.Map(document.getElementById(vpName), viewportOptions);

  // ------------------------------------------------------------------
  // Add checkbox div to the new viewport div
  $( "#" + vpName ).append( '<input id="'+vpName+'c" class="checkActive" style="margin: 5px; z-index: 10; position: absolute; left: 0px; top: 0px;" type="checkbox">' ); 
  // TODO: fix custom checkbox problem
  //customCheckbox();

  // ------------------------------------------------------------------
  // CHECHBOX - ACTIVE VIEWPORT
  $('input[id='+vpName+'c]').change(
    function(){
        var h;
        var w;

        if (this.checked) {

            if (noav == 0){

              h = $( "#" + vpName ).height();
              w = $( "#" + vpName ).width();
              avH = h;
              avW = w;
              noav += 1;

            } else {

              h = avH;
              w = avW;
              noav += 1;

            }
            
            
            google.maps.event.trigger(newViewport, 'resize');

            $( "#" + vpName ).removeClass( "viewport" ).addClass( "avp" );
            $(".viewport").animate({width: (w/m), height: (h/m)}, 300 , "swing");
            $( "#" + vpName ).animate({width: (w*m), height: (h*m)}, 400 , "swing");

            updateCanvas();
        }
        else if(!this.checked){
            h = $( ".viewport" ).height();
            w = $( ".viewport" ).width();
            //alert("viewport h = " + h + ", w = " + w);
            
            $( "#" + vpName ).removeClass( "avp" ).addClass( "viewport" );
            $(".viewport").animate({width: w, height: h}, 300 , "swing");

            noav -= 1;
            //alert("# of active viewports: " + noav);

            if (noav == 0){
              updateLayout();
            }
            
            
            updateCanvas();

        }
    });

  // ------------------------------------------------------------------
  // SETUP new viewport 
  newViewport.setOptions({
          zoom: parentZoom+increaseZoomLevel,       //increase the zoom level
          center: centerLatLng,                     //set new viewport center to the rectangle's center
          id: (parentLevel+1),                      //set new viewport ID
          level: (parentLevel+1)                    //set new viewport level (increase parent map level by 1)  
        });

 // ------------------------------------------------------------------
 // SORTABLE VIEWPOERTS, KEY LISTENER CTRL
 $(document).keydown(function(){

           if(event.keyCode == 17){   //prev key
            console.log("Reorder mode: ON");
             $('div[class^="row level"]').sortable('enable');
             newViewport.setOptions({draggable: false, zoomControl: false, scrollwheel: false, disableDoubleClickZoom: true});

           }
         });

         $(document).keyup(function(){

           if(event.keyCode == 17){  //prev key
            console.log("Reorder mode: OFF");
            $('div[class^="row level"]').sortable('disable');
            newViewport.setOptions({draggable: true, zoomControl: false, scrollwheel: true, disableDoubleClickZoom: false});

           }
  });

  //console.log("Parentmap: " + parentMap.level + ", gLevel: " + gLevel);
  //console.log("nbOfVP: " + nbOfViewports);
  //alert(newViewport.id);

  // Add custom maptypes to the new viewport / map and update it to the current maptype
  addMapTypes(newViewport);
  changeMapTypeViewPort(newViewport);
  
  $("#" + vpName).css("border-color", rColor);     // Set color of viewport

  // Call layout manager algorithm to resize viewports 
  updateLayout();

  return newViewport;
}



// ------------------------------------------------------------------
// Get Rectangle center
function getRectangleCenter(rectangle){ 
  var ne = rectangle.getBounds().getNorthEast();
  var sw = rectangle.getBounds().getSouthWest();
  var clat = (ne.lat() + sw.lat()) / 2;
  var clng = (ne.lng() + sw.lng()) / 2;
  var rectangleCenter = new google.maps.LatLng(clat,clng);
  //console.log("Rectangle center: " + rectangleCenter);
  return rectangleCenter;

}  

// ------------------------------------------------------------------
// Draw correlation line function
function drawCline(parentMap, rectName, mapName, rColor){

    // // Add custom latLng control to parent map of the rectangle
    var latLngControl = new LatLngControl(parentMap);

    // Parent map offset
    var parentX = Math.round($(parentMap.getDiv()).offset().left + 5);  // +5 pixel because of the border of the parent DIV
    var parentY = Math.round($(parentMap.getDiv()).offset().top + 5);
    //console.log("Parent X:Y --> " + parentX + " : " + parentY);

    // Rectangle coordniates
    var ne = rectName.getBounds().getNorthEast();
    var sw = rectName.getBounds().getSouthWest();

    var rLeftX = latLngControl.getX(sw) + parentX;
    var rLeftY = latLngControl.getY(sw) + parentY - 50;

    var rRightX = latLngControl.getX(ne) + parentX;
    var correction = latLngControl.getY(sw) - latLngControl.getY(ne);
    var rRightY = latLngControl.getY(ne) + parentY + correction - 50;

    // Target viewport
    var vpLeftX = Math.round($(mapName.getDiv()).offset().left) + 1;
    var vpLeftY = Math.round($(mapName.getDiv()).offset().top) - 50 ; // -50: navigattion paddign top, +3: correction

    var vpRightX = vpLeftX + $(mapName.getDiv()).width() + 8; // +8 (border thickness)
    var vpRightY = vpLeftY;

    updateCanvas();
    dLine(rLeftX,rLeftY,vpLeftX,vpLeftY,rColor);
    dLine(rRightX,rRightY,vpRightX,vpRightY,rColor);
    //console.log("Line left: " + rLeftX + ", " + rLeftY + ", " + vpLeftX + ", " + vpLeftY + ": Line right: " + rRightX + ", " + rRightY + ", " + vpRightX + ", " + vpRightY);
}


// ------------------------------------------------------------------
// --------------------- LTN_LNG_PIXEL ------------------------------
// ------------------------------------------------------------------
      /**
       * LatLngControl class displays the LatLng and pixel coordinates
       * underneath the mouse within a container anchored to it.
       * @param {google.maps.Map} map Map to add custom control to.
       */
      function LatLngControl(map) {
        /**
         * Offset the control container from the mouse by this amount.
         */
        this.ANCHOR_OFFSET_ = new google.maps.Point(8, 8);
        
        // Add control to the map. Position is irrelevant.
        map.controls[google.maps.ControlPosition.TOP].push(this.node_);
        
        // Bind this OverlayView to the map so we can access MapCanvasProjection
        // to convert LatLng to Point coordinates.
        this.setMap(map);
        
        // Register an MVC property to indicate whether this custom control
        // is visible or hidden. Initially hide control until mouse is over map.
        this.set('visible', false);
      }
      
      // Extend OverlayView so we can access MapCanvasProjection.
      LatLngControl.prototype = new google.maps.OverlayView();
      LatLngControl.prototype.draw = function() {};

      // Gets X coordinate of the latLng  
      LatLngControl.prototype.getX = function(latLng) {
        var projection = this.getProjection();
        var point = projection.fromLatLngToContainerPixel(latLng);
        return Math.round(point.x);
      }
      // Gets Y coordinate of the latLng 
      LatLngControl.prototype.getY = function(latLng) {
        var projection = this.getProjection();
        var point = projection.fromLatLngToContainerPixel(latLng);
        return Math.round(point.y);
      }

      // To Use it:
      //var latLngControl = new LatLngControl(mainMap);
      //var x = latLngControl.getX(latLng);
      //var y = latLngControl.getY(latLng);
// ------------------------------------------------------------------


// ------------------------------------------------------------------
// ---------------------------- CANVAS ------------------------------
// ------------------------------------------------------------------

    var canvas =  document.getElementById('canvas'),
        ctx =     canvas.getContext('2d');

    // resize the canvas to fill browser window dynamically
    window.addEventListener('resize', updateCanvas, false);

    function updateCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight - 50; 

            wWidth = $( window ).width() - 100;
            wHieght = $( window ).height() - 100; // -50 navbar

            //console.log("Window size W-H: " + wWidth + ", " + wHieght);
            //console.log("canvas size: " + canvas.width + ", " + canvas.height);
            google.maps.event.trigger(mainMap, 'resize');
            //$("#mainmap").animate({width: wWidth, height: wHieght}, 200 );

    }

    function dLine(a,b,c,d,color) {
        ctx.beginPath();
        ctx.moveTo(a,b);
        ctx.lineTo(c,d);
        ctx.lineWidth = 3;
        // set line color
        ctx.strokeStyle = color;

      //Draw line
      ctx.stroke();
      //console.log("Draw line: " + a + ", " + b + ", " + c + ", " + d + ", color: " + color);
    }

    updateCanvas();


// ------------------------------------------------------------------
// ---------- SWITCH BETWEEN ADD RECTANGLE AND PAN MODE -------------
// ------------------------------------------------------------------
var allowed = true; // Avoid autorepeated keydown

// KEY DOWN
$(document).keydown(function(){
  if (!allowed) return;
  allowed = false;

  if(event.keyCode == 0 || event.keyCode == 32){   //space key
    //console.log("Space DOWN, create rectangle mode: ON");
    // Change drawingMode for all viewports
    for (var i = 0; i < dwManagers.length; i++) {
        dwManagers[i].setOptions({
          drawingMode: google.maps.drawing.OverlayType.RECTANGLE
        });
    }
  }
});

// KEY UP
$(document).keyup(function(){
 allowed = true;
 if(event.keyCode == 0 || event.keyCode == 32){  //space key
  //console.log("Space UP, create rectangle mode: OFF");
      for (var i = 0; i < dwManagers.length; i++) {
        dwManagers[i].setOptions({
          drawingMode: null
        });
    }
 }
});

// FOCUS
$(document).focus(function(e) { 
  allowed = true;
});
