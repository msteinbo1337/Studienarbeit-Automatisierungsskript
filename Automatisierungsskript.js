var MapboxClient = require('mapbox');
var CONFIG = require('./config.json')

var accesstoken = CONFIG.Accesstoken

var client = new MapboxClient(accesstoken);  //mapbox token !
var AWS = require('aws-sdk');
var fs = require('fs-extra');
var zaehler = 1;
var credentials = {
    "accessKeyId": "{accessKeyId}",
    "bucket": "{bucket}",
    "key": "{key}",
    "secretAccessKey": "{secretAccessKey}",
    "sessionToken": "{sessionToken}",
    "url": "{s3 url}"
};
var uploadids = [];
var listlength = 0;
var mapname = CONFIG.Mapname;      // Mapnamen eingeben, anderenfalls wird neue Karte erstellt !
var mapid = "default";
var styleid = "default";
var uploadzaehler = 0;

var s3trigger = [1];

var updatetrigger = [];
var updatezaehler = 0;
var username = CONFIG.Username;  //Mapboxusername
var tileset = [];
var i = 0;
var j = 1;

var datapath = CONFIG.Datapath;
var UAVname = CONFIG.Datasetname;
var format = CONFIG.Dataformat;

var style = {
    "version": 8,
    "name": mapname,
    "metadata": {
        "mapbox:autocomposite": true
    },
    "sources": {
        "mapbox": {
            "url": "mapbox://mapbox.mapbox-streets-v7",
            "type": "vector"
        }
    },
    "sprite": "mapbox://sprites/mapbox/basic-v8",
    "glyphs": "mapbox://fonts/mapbox/{fontstack}/{range}.pbf",
    "layers": [
        {
            "id": "background",
            "type": "background",
            "paint": {
                "background-color": "#dedede"
            },
            "interactive": true
        },
        {
            "id": "landuse_overlay_national_park",
            "type": "fill",
            "source": "mapbox",
            "source-layer": "landuse_overlay",
            "filter": [
                "==",
                "class",
                "national_park"
            ],
            "paint": {
                "fill-color": "#d2edae",
                "fill-opacity": 0.75
            },
            "interactive": true
        },
        {
            "id": "landuse_park",
            "type": "fill",
            "source": "mapbox",
            "source-layer": "landuse",
            "filter": [
                "==",
                "class",
                "park"
            ],
            "paint": {
                "fill-color": "#d2edae"
            },
            "interactive": true
        },
        {
            "id": "waterway",
            "type": "line",
            "source": "mapbox",
            "source-layer": "waterway",
            "filter": [
                "all",
                [
                    "==",
                    "$type",
                    "LineString"
                ],
                [
                    "in",
                    "class",
                    "river",
                    "canal"
                ]
            ],
            "paint": {
                "line-color": "#a0cfdf",
                "line-width": {
                    "base": 1.4,
                    "stops": [
                        [
                            8,
                            0.5
                        ],
                        [
                            20,
                            15
                        ]
                    ]
                }
            },
            "interactive": true
        },
        {
            "id": "water",
            "type": "fill",
            "source": "mapbox",
            "source-layer": "water",
            "paint": {
                "fill-color": "#a0cfdf"
            },
            "interactive": true
        },
        {
            "id": "building",
            "type": "fill",
            "source": "mapbox",
            "source-layer": "building",
            "paint": {
                "fill-color": "#d6d6d6"
            },
            "interactive": true
        },
        {
            "interactive": true,
            "layout": {
                "line-cap": "butt",
                "line-join": "miter"
            },
            "filter": [
                "all",
                [
                    "==",
                    "$type",
                    "LineString"
                ],
                [
                    "all",
                    [
                        "in",
                        "class",
                        "motorway_link",
                        "street",
                        "street_limited",
                        "service",
                        "track",
                        "pedestrian",
                        "path",
                        "link"
                    ],
                    [
                        "==",
                        "structure",
                        "tunnel"
                    ]
                ]
            ],
            "type": "line",
            "source": "mapbox",
            "id": "tunnel_minor",
            "paint": {
                "line-color": "#efefef",
                "line-width": {
                    "base": 1.55,
                    "stops": [
                        [
                            4,
                            0.25
                        ],
                        [
                            20,
                            30
                        ]
                    ]
                },
                "line-dasharray": [
                    0.36,
                    0.18
                ]
            },
            "source-layer": "road"
        },
        {
            "interactive": true,
            "layout": {
                "line-cap": "butt",
                "line-join": "miter"
            },
            "filter": [
                "all",
                [
                    "==",
                    "$type",
                    "LineString"
                ],
                [
                    "all",
                    [
                        "in",
                        "class",
                        "motorway",
                        "primary",
                        "secondary",
                        "tertiary",
                        "trunk"
                    ],
                    [
                        "==",
                        "structure",
                        "tunnel"
                    ]
                ]
            ],
            "type": "line",
            "source": "mapbox",
            "id": "tunnel_major",
            "paint": {
                "line-color": "#fff",
                "line-width": {
                    "base": 1.4,
                    "stops": [
                        [
                            6,
                            0.5
                        ],
                        [
                            20,
                            30
                        ]
                    ]
                },
                "line-dasharray": [
                    0.28,
                    0.14
                ]
            },
            "source-layer": "road"
        },
        {
            "interactive": true,
            "layout": {
                "line-cap": "round",
                "line-join": "round"
            },
            "filter": [
                "all",
                [
                    "==",
                    "$type",
                    "LineString"
                ],
                [
                    "all",
                    [
                        "in",
                        "class",
                        "motorway_link",
                        "street",
                        "street_limited",
                        "service",
                        "track",
                        "pedestrian",
                        "path",
                        "link"
                    ],
                    [
                        "in",
                        "structure",
                        "none",
                        "ford"
                    ]
                ]
            ],
            "type": "line",
            "source": "mapbox",
            "id": "road_minor",
            "paint": {
                "line-color": "#efefef",
                "line-width": {
                    "base": 1.55,
                    "stops": [
                        [
                            4,
                            0.25
                        ],
                        [
                            20,
                            30
                        ]
                    ]
                }
            },
            "source-layer": "road"
        },
        {
            "interactive": true,
            "layout": {
                "line-cap": "round",
                "line-join": "round"
            },
            "filter": [
                "all",
                [
                    "==",
                    "$type",
                    "LineString"
                ],
                [
                    "all",
                    [
                        "in",
                        "class",
                        "motorway",
                        "primary",
                        "secondary",
                        "tertiary",
                        "trunk"
                    ],
                    [
                        "in",
                        "structure",
                        "none",
                        "ford"
                    ]
                ]
            ],
            "type": "line",
            "source": "mapbox",
            "id": "road_major",
            "paint": {
                "line-color": "#fff",
                "line-width": {
                    "base": 1.4,
                    "stops": [
                        [
                            6,
                            0.5
                        ],
                        [
                            20,
                            30
                        ]
                    ]
                }
            },
            "source-layer": "road"
        },
        {
            "interactive": true,
            "layout": {
                "line-cap": "butt",
                "line-join": "miter"
            },
            "filter": [
                "all",
                [
                    "==",
                    "$type",
                    "LineString"
                ],
                [
                    "all",
                    [
                        "in",
                        "class",
                        "motorway_link",
                        "street",
                        "street_limited",
                        "service",
                        "track",
                        "pedestrian",
                        "path",
                        "link"
                    ],
                    [
                        "==",
                        "structure",
                        "bridge"
                    ]
                ]
            ],
            "type": "line",
            "source": "mapbox",
            "id": "bridge_minor case",
            "paint": {
                "line-color": "#dedede",
                "line-width": {
                    "base": 1.6,
                    "stops": [
                        [
                            12,
                            0.5
                        ],
                        [
                            20,
                            10
                        ]
                    ]
                },
                "line-gap-width": {
                    "base": 1.55,
                    "stops": [
                        [
                            4,
                            0.25
                        ],
                        [
                            20,
                            30
                        ]
                    ]
                }
            },
            "source-layer": "road"
        },
        {
            "interactive": true,
            "layout": {
                "line-cap": "butt",
                "line-join": "miter"
            },
            "filter": [
                "all",
                [
                    "==",
                    "$type",
                    "LineString"
                ],
                [
                    "all",
                    [
                        "in",
                        "class",
                        "motorway",
                        "primary",
                        "secondary",
                        "tertiary",
                        "trunk"
                    ],
                    [
                        "==",
                        "structure",
                        "bridge"
                    ]
                ]
            ],
            "type": "line",
            "source": "mapbox",
            "id": "bridge_major case",
            "paint": {
                "line-color": "#dedede",
                "line-width": {
                    "base": 1.6,
                    "stops": [
                        [
                            12,
                            0.5
                        ],
                        [
                            20,
                            10
                        ]
                    ]
                },
                "line-gap-width": {
                    "base": 1.55,
                    "stops": [
                        [
                            4,
                            0.25
                        ],
                        [
                            20,
                            30
                        ]
                    ]
                }
            },
            "source-layer": "road"
        },
        {
            "interactive": true,
            "layout": {
                "line-cap": "round",
                "line-join": "round"
            },
            "filter": [
                "all",
                [
                    "==",
                    "$type",
                    "LineString"
                ],
                [
                    "all",
                    [
                        "in",
                        "class",
                        "motorway_link",
                        "street",
                        "street_limited",
                        "service",
                        "track",
                        "pedestrian",
                        "path",
                        "link"
                    ],
                    [
                        "==",
                        "structure",
                        "bridge"
                    ]
                ]
            ],
            "type": "line",
            "source": "mapbox",
            "id": "bridge_minor",
            "paint": {
                "line-color": "#efefef",
                "line-width": {
                    "base": 1.55,
                    "stops": [
                        [
                            4,
                            0.25
                        ],
                        [
                            20,
                            30
                        ]
                    ]
                }
            },
            "source-layer": "road"
        },
        {
            "interactive": true,
            "layout": {
                "line-cap": "round",
                "line-join": "round"
            },
            "filter": [
                "all",
                [
                    "==",
                    "$type",
                    "LineString"
                ],
                [
                    "all",
                    [
                        "in",
                        "class",
                        "motorway",
                        "primary",
                        "secondary",
                        "tertiary",
                        "trunk"
                    ],
                    [
                        "==",
                        "structure",
                        "bridge"
                    ]
                ]
            ],
            "type": "line",
            "source": "mapbox",
            "id": "bridge_major",
            "paint": {
                "line-color": "#fff",
                "line-width": {
                    "base": 1.4,
                    "stops": [
                        [
                            6,
                            0.5
                        ],
                        [
                            20,
                            30
                        ]
                    ]
                }
            },
            "source-layer": "road"
        },
        {
            "interactive": true,
            "layout": {
                "line-cap": "round",
                "line-join": "round"
            },
            "filter": [
                "all",
                [
                    "==",
                    "$type",
                    "LineString"
                ],
                [
                    "all",
                    [
                        "<=",
                        "admin_level",
                        2
                    ],
                    [
                        "==",
                        "maritime",
                        0
                    ]
                ]
            ],
            "type": "line",
            "source": "mapbox",
            "id": "admin_country",
            "paint": {
                "line-color": "#8b8a8a",
                "line-width": {
                    "base": 1.3,
                    "stops": [
                        [
                            3,
                            0.5
                        ],
                        [
                            22,
                            15
                        ]
                    ]
                }
            },
            "source-layer": "admin"
        },
        {
            "interactive": true,
            "minzoom": 5,
            "layout": {
                "icon-image": "{maki}-11",
                "text-offset": [
                    0,
                    0.5
                ],
                "text-field": "{name_en}",
                "text-font": [
                    "Open Sans Semibold",
                    "Arial Unicode MS Bold"
                ],
                "text-max-width": 8,
                "text-anchor": "top",
                "text-size": 11,
                "icon-size": 1
            },
            "filter": [
                "all",
                [
                    "==",
                    "$type",
                    "Point"
                ],
                [
                    "all",
                    [
                        "==",
                        "scalerank",
                        1
                    ],
                    [
                        "==",
                        "localrank",
                        1
                    ]
                ]
            ],
            "type": "symbol",
            "source": "mapbox",
            "id": "poi_label",
            "paint": {
                "text-color": "#666",
                "text-halo-width": 1,
                "text-halo-color": "rgba(255,255,255,0.75)",
                "text-halo-blur": 1
            },
            "source-layer": "poi_label"
        },
        {
            "interactive": true,
            "layout": {
                "symbol-placement": "line",
                "text-field": "{name_en}",
                "text-font": [
                    "Open Sans Semibold",
                    "Arial Unicode MS Bold"
                ],
                "text-transform": "uppercase",
                "text-letter-spacing": 0.1,
                "text-size": {
                    "base": 1.4,
                    "stops": [
                        [
                            10,
                            8
                        ],
                        [
                            20,
                            14
                        ]
                    ]
                }
            },
            "filter": [
                "all",
                [
                    "==",
                    "$type",
                    "LineString"
                ],
                [
                    "in",
                    "class",
                    "motorway",
                    "primary",
                    "secondary",
                    "tertiary",
                    "trunk"
                ]
            ],
            "type": "symbol",
            "source": "mapbox",
            "id": "road_major_label",
            "paint": {
                "text-color": "#666",
                "text-halo-color": "rgba(255,255,255,0.75)",
                "text-halo-width": 2
            },
            "source-layer": "road_label"
        },
        {
            "interactive": true,
            "minzoom": 8,
            "layout": {
                "text-field": "{name_en}",
                "text-font": [
                    "Open Sans Semibold",
                    "Arial Unicode MS Bold"
                ],
                "text-max-width": 6,
                "text-size": {
                    "stops": [
                        [
                            6,
                            12
                        ],
                        [
                            12,
                            16
                        ]
                    ]
                }
            },
            "filter": [
                "all",
                [
                    "==",
                    "$type",
                    "Point"
                ],
                [
                    "in",
                    "type",
                    "town",
                    "village",
                    "hamlet",
                    "suburb",
                    "neighbourhood",
                    "island"
                ]
            ],
            "type": "symbol",
            "source": "mapbox",
            "id": "place_label_other",
            "paint": {
                "text-color": "#666",
                "text-halo-color": "rgba(255,255,255,0.75)",
                "text-halo-width": 1,
                "text-halo-blur": 1
            },
            "source-layer": "place_label"
        },
        {
            "interactive": true,
            "layout": {
                "text-field": "{name_en}",
                "text-font": [
                    "Open Sans Bold",
                    "Arial Unicode MS Bold"
                ],
                "text-max-width": 10,
                "text-size": {
                    "stops": [
                        [
                            3,
                            12
                        ],
                        [
                            8,
                            16
                        ]
                    ]
                }
            },
            "maxzoom": 16,
            "filter": [
                "all",
                [
                    "==",
                    "$type",
                    "Point"
                ],
                [
                    "==",
                    "type",
                    "city"
                ]
            ],
            "type": "symbol",
            "source": "mapbox",
            "id": "place_label_city",
            "paint": {
                "text-color": "#666",
                "text-halo-color": "rgba(255,255,255,0.75)",
                "text-halo-width": 1,
                "text-halo-blur": 1
            },
            "source-layer": "place_label"
        },
        {
            "interactive": true,
            "layout": {
                "text-field": "{name_en}",
                "text-font": [
                    "Open Sans Regular",
                    "Arial Unicode MS Regular"
                ],
                "text-max-width": 10,
                "text-size": {
                    "stops": [
                        [
                            3,
                            14
                        ],
                        [
                            8,
                            22
                        ]
                    ]
                }
            },
            "maxzoom": 12,
            "filter": [
                "==",
                "$type",
                "Point"
            ],
            "type": "symbol",
            "source": "mapbox",
            "id": "country_label",
            "paint": {
                "text-color": "#666",
                "text-halo-color": "rgba(255,255,255,0.75)",
                "text-halo-width": 1,
                "text-halo-blur": 1
            },
            "source-layer": "country_label"
        }
    ]
};

client.listStyles(function (err, styles) {
    listlength = styles.length;
    for (i = 0; i < listlength; i++) {
        console.log("Pruefe vorhandene Karten!");  // Prüft ob Map bereits vorhanden!
        console.log(styles[i]);
        if (styles[i].name === mapname) {
            console.log("Match!");
            mapid = styles[i].id;
            console.log("StyleID: " + mapid);

            break
        }
        else if (i === listlength - 1 && styles[i].name !== mapname) {
            //create new map alias "mapname" !!
            console.log("Karte nicht vorhanden! Erstelle Karte:");

            
            client.createStyle(style, function (err, createdStyle) {
                //console.log(createdStyle);
                mapid = createdStyle.id;
                console.log("StyleID: "+ mapid);
            });
        }
        else {
            console.log("noch kein match!");

        }
    }
});




setInterval(function upl() {
    if (fs.existsSync(datapath + UAVname + zaehler + '.' + format) && s3trigger[zaehler-1] === 1 ) {
        console.log("Datei "+ UAVname + zaehler + " ist vorhanden! Bereite upload vor!"); // Dateipfad angeben

        zaehler += 1;

        client.createUploadCredentials(function (err, credentials) {
            // Use aws-sdk to stage the file on Amazon S3
            var s3 = new AWS.S3({
                accessKeyId: credentials.accessKeyId,
                secretAccessKey: credentials.secretAccessKey,
                sessionToken: credentials.sessionToken,
                region: 'us-east-1'
            });
            //console.log(
            s3.putObject({
                Bucket: credentials.bucket,
                Key: credentials.key,
                Body: fs.createReadStream(datapath + UAVname + (zaehler-1) + '.' + format)
            },
               
                
                function (err, resp) {

                    client.createUpload({
                        tileset: [username, UAVname+(zaehler-1)].join('.'),   
                        url: credentials.url,
                        name: UAVname + (zaehler-1)
                    }, function (err, upload) {
                        console.log(upload);
                        uploadids.push(upload.id);
                        console.log("UploadID von Tileset " + (zaehler-1) + " :" + uploadids[zaehler - 2]);
                        s3trigger.push(1);
                        //zaehler += 1;
                        
                    });
                });  // ) vor semikolon



        });


    }
    else {
        //console.log("Datei referenced_000" + zaehler + " noch nicht vorhanden! Pruefe erneut in 5 Sekunden!");
    }
}, 5000);  //5Sekunden Intervall

setInterval(function status() { //check upload status!
    if (uploadids[uploadzaehler] === undefined) {
        console.log("Kein fertiggestellter S3 Bucket Upload!");
    }
    else {
        client.readUpload(uploadids[uploadzaehler], function (err, upload) {
            if (upload.complete === false) {
                //console.log("Upload von Tileset" + uploadzaehler + " noch nicht bereit!");
            }
            else {
                console.log("Upload von Tileset" + uploadzaehler + " ist Bereit!");
                console.log("Binde Tileset" + uploadzaehler + " in Style " + mapname + " ein");
                uploadzaehler += 1;
                updatetrigger.push("trigger");
            }
        })
    }
}

    , 1000);

setInterval(function update() {
    if (updatetrigger[updatezaehler] === undefined) {
        //console.log("Keine Tilesets zum einbinden verfuegbar!");
    }
    else {
        tileset.push(UAVname + j);
        style.sources[tileset[updatezaehler]] = { url: "mapbox://" + username + "." + UAVname + j, type: "raster" };
        var add = { id: tileset[updatezaehler], source: tileset[updatezaehler], type: "raster" };
        style.layers.push(add);
        client.updateStyle(style, mapid, function (err, createdStyle) {
            console.log("Karte mit tileset" + j + " aktualisiert");
            updatezaehler += 1;
            j += 1;
        });
    }

},
    2000);