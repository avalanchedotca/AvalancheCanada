
var regions  = require('./forecast-regions.json');
var hotzones = require('./hotzones.json');

console.log('*** USING 2016 ***')

var all =  {
  "type": "FeatureCollection",
  "features": regions.features.concat(hotzones.features)
};

module.exports = all;
