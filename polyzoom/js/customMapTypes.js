// ------------------------------------------------------------------
// --------------------- CUSTOM DATASETS ----------------------------
// ------------------------------------------------------------------

//Normalizes the tile URL so that tiles repeat across the x axis (horizontally) like the standard Google map tiles.
    function getHorizontallyRepeatingTileUrl(coord, zoom, urlfunc) {
      var y = coord.y;
      var x = coord.x;
 
      //tile range in one direction range is dependent on zoom level
      //0 = 1 tile, 1 = 2 tiles, 2 = 4 tiles, 3 = 8 tiles, etc
      var tileRange = 1 << zoom;
 
      //don't repeat across y-axis (vertically)
      if (y < 0 || y >= tileRange) {
        return null;
      }
 
      //repeat across x-axis
      if (x < 0 || x >= tileRange) {
        x = (x % tileRange + tileRange) % tileRange;
      }
 
      return urlfunc({x:x,y:y}, zoom)
    }

    function getMarsTileUrl(baseUrl, coord, zoom) {
      var bound = Math.pow(2, zoom);
      var x = coord.x;
      var y = coord.y;
      var quads = ['t'];
 
      for (var z = 0; z < zoom; z++) {
        bound = bound / 2;
        if (y < bound) {
          if (x < bound) {
            quads.push('q');
          } else {
            quads.push('r');
            x -= bound;
          }
        } else {
          if (x < bound) {
            quads.push('t');
            y -= bound;
          } else {
            quads.push('s');
            x -= bound;
            y -= bound;
          }
        }
      }
 
      return baseUrl + quads.join('') + ".jpg";
    }

var moonTypeOptions = {
      getTileUrl: function(coord, zoom) {
        return getHorizontallyRepeatingTileUrl(coord, zoom, function(coord, zoom) {
          var bound = Math.pow(2, zoom);
          //alert("http://mw1.google.com/mw-planetary/lunar/lunarmaps_v1/clem_bw/" + zoom + "/" + coord.x + "/" + (bound - coord.y - 1) + '.jpg');
          return "http://mw1.google.com/mw-planetary/lunar/lunarmaps_v1/clem_bw/" +
                 + zoom + "/" + coord.x + "/" + (bound - coord.y - 1) + '.jpg';
        });
      },
      tileSize: new google.maps.Size(256, 256),
      isPng: false,
      maxZoom: 9,
      minZoom: 0,
      radius: 1738000,
      name: 'Moon',
      credit: 'Image Credit: NASA/USGS'
    };

var skyTypeOptions = {
      getTileUrl: function(coord, zoom) {
        return getHorizontallyRepeatingTileUrl(coord, zoom, function(coord, zoom) {
          return "http://mw1.google.com/mw-planetary/sky/skytiles_v1/" +
                 coord.x + "_" + coord.y + '_' + zoom + '.jpg';
 
        });
      },
      tileSize: new google.maps.Size(256, 256),
      isPng: false,
      maxZoom: 13,
      radius: 57.2957763671875,
      name: 'Sky',
      credit: 'Image Credit: SDSS, DSS Consortium, NASA/ESA/STScI'
    };
 
var marsElevationTypeOptions = {
      getTileUrl: function(coord, zoom) {
        return getHorizontallyRepeatingTileUrl(coord, zoom, function(coord, zoom) {
          return getMarsTileUrl("http://mw1.google.com/mw-planetary/mars/elevation/", coord, zoom);
        });
      },
      tileSize: new google.maps.Size(256, 256),
      isPng: false,
      maxZoom: 8,
      radius: 3396200,
      name: 'Mars Elevation',
      credit: 'Image Credit: NASA/JPL/GSFC'
    };
 
var marsVisibleTypeOptions = {
      getTileUrl: function(coord, zoom) {
        return getHorizontallyRepeatingTileUrl(coord, zoom, function(coord, zoom) {
          return getMarsTileUrl("http://mw1.google.com/mw-planetary/mars/visible/", coord, zoom);
        });
      },
      tileSize: new google.maps.Size(256, 256),
      isPng: false,
      maxZoom: 9,
      radius: 3396200,
      name: 'Mars Visible',
      credit: 'Image Credit: NASA/JPL/ASU/MSSS'
    };
 
var marsInfraredTypeOptions = {
      getTileUrl: function(coord, zoom) {
        return getHorizontallyRepeatingTileUrl(coord, zoom, function(coord, zoom) {
          return getMarsTileUrl("http://mw1.google.com/mw-planetary/mars/infrared/", coord, zoom);
        });
      },
      tileSize: new google.maps.Size(256, 256),
      isPng: false,
      maxZoom: 9,
      radius: 3396200,
      name: 'Mars Infrared',
      credit: 'Image Credit: NASA/JPL/ASU'
    };

// Custom map types
var currentMapType =          google.maps.MapTypeId.TERRAIN;
var moonMapType =             new google.maps.ImageMapType(moonTypeOptions);
var skyMapType =              new google.maps.ImageMapType(skyTypeOptions);
var marsInfraredMapType =     new google.maps.ImageMapType(marsInfraredTypeOptions);
var marsVisibleMapType =      new google.maps.ImageMapType(marsVisibleTypeOptions);
var marsElevationMapType =    new google.maps.ImageMapType(marsElevationTypeOptions);