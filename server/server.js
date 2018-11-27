var express = require('express');
var MapboxClient = require('mapbox');
var moment = require('moment');
var argv = require('minimist')(process.argv.slice(2));
var client = new MapboxClient(argv.accessToken);
var datasetID = argv.dataset;

var app = express();

app.get('/', function(req, res) {
    var lat = parseFloat(req.query.lat);
    var lon = parseFloat(req.query.lon);
    var timestamp = req.query.timestamp;
    var feature = {
        'id': timestamp,
        'type': "Feature",
        'geometry': {
            'type': 'Point',
            'coordinates': [lon, lat]
        },
        'properties': {
            'timestamp': parseInt(timestamp, 10),
            'altitude': parseFloat(req.query.altitude, 10) || null,
            'speed': parseFloat(req.query.speed) || null,
            'accuracy': parseFloat(req.query.accuracy) || null,
            'time': moment.utc(parseInt(timestamp)*1000).toISOString(),
            'direction': req.query.direction || null
        }
    };
    client.insertFeature(feature, datasetID, function(err, feature) {
        if (err) {
            res.send(err);
        }
        console.log(feature);
        res.send(feature);
    });

    // clone this feature, and update the 'latest' id
    var latestFeature = JSON.parse(JSON.stringify(feature));
    latestFeature.id = 'latest';
    client.insertFeature(latestFeature, datasetID, function(err, feature) {
        if (err) {
            res.send(err);
        }
        res.send(feature);
    });
});

app.listen(8000, function() {
    console.log('listening.');
});