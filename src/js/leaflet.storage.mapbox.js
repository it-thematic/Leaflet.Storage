L.MapboxGL.ITT = L.MapboxGL.extend({
    TOKEN : "pk.eyJ1Ijoic2hwYXdlbCIsImEiOiJjaXMwOGRqajYwMDBhMnpvNzdyOWYxNWU2In0.tCzDmtQKGwFwHx40zXQhKQ",

    options: {
        version: 8
    },

    style: {
        "version": 8,
        "name": "mgs_web_service",
        "center": [37.627487, 55.741028],
        "zoom": 8,
        "sprite": "mapbox://sprites/mapbox/streets-v8",
        "glyphs": "mapbox://fonts/mapbox/{fontstack}/{range}.pbf",
        "sources": {
        },
        "layers": [
        ]
    },

    initialize: function (options) {
        L.Util.extend(options, {
            attributionControl: true,
            accessToken: this.TOKEN
        });
        L.MapboxGL.prototype.initialize.call(this, options);
    },

    getStyle: function () {
        return this._glMap.getStyle();
    },
    
    setStyle: function (style, options) {
        if (!style) {
            return;
        }
        if (!this._glMap.getStyle()) {
            this._glMap.setStyle(style);
            return;
        }

        var diff = true;
        if (options && (options.diff === false)) {
            diff = false;
        }

        if (!diff) {
            this._glMap.setStyle(style);
        } else {
            // Добавление источника
            if (style.hasOwnProperty('sources')) {
                for (var j in style.sources) {
                    if (!this._glMap.getSource(j)) {
                        this._glMap.addSource(j, style.sources[j]);
                    }
                }
            }
            // Добавление слоёв
            if (style.hasOwnProperty('layers')) {
                for (j in style.layers) {
                    if (!this._glMap.getLayer(style.layers[j].id)) {
                        this._glMap.addLayer(style.layers[j]);
                    }
                }
            }
        }
    },

    removeStyle: function (style) {
        // Удаление слоёвО
        if (!style) {
            return;
        }
        if (style.hasOwnProperty('layers')) {
            for (var j in style.layers) {
                if (this._glMap.getLayer(style.layers[j].id)) {
                    this._glMap.removeLayer(style.layers[j].id);
                }
            }
        }

        // TODO: источники пока не удаляем, потому что на них могут ссылаться другие слои
        // Удаление слоёв
        // if (style.hasOwnProperty('sources')) {
        //     for (let j in style.sources) {
        //         if (this._glMap.isSourceLoaded(j)) {
        //             this._glMap.removeSource(j, style.sources[j]);
        //         }
        //     }
        // }
    },

    hasStyle: function (style) {
        if (!style || !this._glMap.getStyle()) {
            return false;
        }

        if (style.hasOwnProperty('layers')) {
            for (var j in style.layers) {
                if (this._glMap.getLayer(style.layers[j].id)) {
                    return true;
                }
            }
        }
    }
});

L.MapboxITT = function (url, options) {
	return new L.MapboxGL.ITT(url, options);
};
