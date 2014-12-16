var _ = require('lodash');
var Q = require('q');
var express = require('express');
var router = express.Router();
var avalx = require('./avalx');
var regions = require('./forecast-regions');
var WebCache = require('webcache');
var WebCacheRedis = require('webcache-redis');
var gm = require('gm');

var acAvalxUrls = _.chain(regions.features).filter(function (feature) {
    return feature.properties.type === 'avalx';
}).map(function (feature) {
    return feature.properties.url;
}).value();

var webcacheOptions = {
    store: new WebCacheRedis(6379, process.env.REDIS_HOST)
};

var apiWebcache = new WebCache(webcacheOptions);

if(!process.env.NO_CACHE_REFRESH) webcacheOptions.refreshInterval = 300000;
var avalxWebcache = new WebCache(webcacheOptions);

avalxWebcache.seed(acAvalxUrls);
avalxWebcache.on('refreshed', _.bind(apiWebcache.refresh, apiWebcache));

// webcache middleware
router.use(function (req, res, next) {
    var url = req.protocol + '://' + req.headers.host + req.originalUrl;

    var webcacher = function (data) {
        if(typeof data === 'object'){
            data = JSON.stringify(data);
        }
        apiWebcache.cacheUrl(url, data);
    };

    if(req.headers['cache-control'] === 'no-cache') {
        console.log('cache bypass for %s', url);
        req.webcache = webcacher;
        next();
    } else {
        apiWebcache.get(url).then(function (data) {
            if(data){
                console.log('cache hit for %s', url);
                apiWebcache.cacheUrl(url);
                req.webcached = data;
            } else {
                console.log('cache miss for %s', url);
                req.webcache = webcacher;
            }
            next();
        });
    }
});

router.param('region', function (req, res, next) {
    req.region = _.find(regions.features, {id: req.params.region});

    if(req.region && req.webcached) {
        next();
    } else if (req.region) {
        if(req.region.properties.type === 'avalx') {
            avalxWebcache.get(req.region.properties.url).then(function (caaml) {
                var deferred = Q.defer();

                if(caaml){
                    console.log('avalx cache hit for forecast for %s', req.region.id);
                    deferred.resolve(caaml);
                } else {
                    console.log('avalx cache miss for forecast for %s', req.region.id);
                    avalx.fetchCaamlForecast(req.region, function (err, caaml) {
                        if(err || !caaml) {
                            deferred.reject('error fetching ' + req.region.id + ' caaml forecast.');
                        } else {
                            deferred.resolve(caaml);
                        }
                    });
                }

                return deferred.promise;
            }).then(function (caaml) {
                var deferred = Q.defer();

                if(caaml){
                    avalx.parseCaamlForecast(caaml, req.region, function (err, json) {
                        if(err || !json) {
                            deferred.reject('error parsing ' + req.region.id + ' caaml forecast.');
                        } else {
                            deferred.resolve({
                                region: req.region.id,
                                caaml: caaml,
                                json: json
                            });
                        }
                    });
                } else {
                    deferred.reject('error parsing ' + req.region.id + ' caaml forecast.');
                }

                return deferred.promise;
            }).then(function (forecast) {
                req.forecast = forecast;
                next();
            }).catch(function (e) {
                console.log(e);
                res.send(500);
            }).done();
        } else {
            req.forecast = {
                json: {
                    id: req.region.id,
                    name: req.region.properties.name,
                    externalUrl: req.region.properties.url
                }
            };
            next();
        }
    } else {
        console.log('forecast region not found');
        res.send(404);
    }
});


router.get('/', function(req, res) {
    res.json(regions);
});

router.get('/areas', function(req, res) {
    res.json(areas);
});

router.get('/:region.:format', function(req, res) {
    req.params.format = req.params.format || 'json'

    switch(req.params.format) {
        case 'xml':
            res.header('Content-Type', 'application/xml');
            if(req.webcached) {
                res.send(req.webcached);
            } else {
                req.webcache(req.forecast.caaml);
                res.send(req.forecast.caaml);
            }
            break;
        case 'json':
            if(req.webcached) {
                var forecast;

                try {
                    forecast = JSON.parse(req.webcached);
                } catch (e) {
                    console.log('error parsing json forecast');
                    res.send(500);
                }
                
                res.json(forecast);
            } else {
                req.webcache(req.forecast.json);
                res.json(req.forecast.json);
            }
            break;
        case 'rss':
            if(req.webcached) {
                res.send(req.webcached);
            } else {
                var locals = {
                    url: "url", 
                    forecast: req.forecast.json
                };

                res.render('forecasts/forecast-rss', locals, function (err, xml) {
                    if(err) {
                        res.send(500);
                    } else {
                        req.webcache(xml);
                        res.send(xml)
                    }
                });
            }
            
            break;
        case 'html':
            var locals = { 
                forecast: req.forecast.json
            };

            res.render('forecasts/forecast-html', locals, function (err, html) {
                if(err) {
                    res.send(500);
                } else {
                    req.webcache(html);
                    res.send(html)
                }
            });
            break;
        default:
            res.send(404);
            break;
    }

});

router.get('/:region/nowcast.:format', function(req, res) {
    var styles;
    var mimeType = req.params.format === 'svg' ? 'image/svg+xml' : 'image/png';

    res.header('Cache-Control', 'no-cache');
    res.header('Content-Type', mimeType);

    if(!req.webcached && req.region.properties.type === 'avalx') {
        styles = avalx.getNowcastStyles(req.forecast.json);

        res.render('forecasts/nowcast', styles, function (err, svg) {
            if(err) {
                res.send(500);
            } else {
                switch(req.params.format) {
                    case 'svg':
                        req.webcache(svg);
                        res.send(svg);
                        break;
                    case 'png':
                        var buf = new Buffer(svg);
                        gm(buf, 'nowcast.svg')
                            .options({imageMagick: true})
                            .resize(450, 150)
                            .stream('png')
                            .pipe(res);
                        break;
                    default:
                        res.send(404);
                        break;
                }
            }
        });
    } else if (req.region.properties.type === 'avalx'){
        res.send(req.webcached);
    } else {
        res.send(404);
    }
});

router.get('/:region/danger-rating-icon.svg', function(req, res) {
    var ratingStyles = {
        alp: '',
        tln: '',
        btl: ''
    };

    res.header('Cache-Control', 'no-cache');
    res.header('Content-Type', 'image/svg+xml');

    if(!req.webcached) {
        if(req.region.properties.type === 'avalx') {
            ratingStyles = avalx.getDangerIconStyles(req.forecast.json);
        }

        res.render('forecasts/danger-icon', ratingStyles, function (err, svg) {
            if(err) {
                res.send(500);
            } else {
                req.webcache(svg);
                res.send(svg)
            }
        });
    } else {
        res.send(req.webcached);
    }
});

module.exports = router;
