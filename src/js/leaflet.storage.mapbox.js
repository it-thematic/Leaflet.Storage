/*globals L, console*/
(function() {
'use strict';

L.MapboxGL.ITT = L.MapboxGL.extend({
    TOKEN : "pk.eyJ1Ijoic2hwYXdlbCIsImEiOiJjaXMwOGRqajYwMDBhMnpvNzdyOWYxNWU2In0.tCzDmtQKGwFwHx40zXQhKQ",

    style: {
        "version": 8,
        "name": "moesk_gis_show",
        "center": [37.627487, 55.741028],
        "zoom": 8,
        "sprite": "mapbox://sprites/mapbox/streets-v8",
        "glyphs": "mapbox://fonts/mapbox/{fontstack}/{range}.pbf",
        "sources": {
        },
        "layers": [
        ]
    },

    options: {
        attributionControl: true,
        maxTileCacheSize: 0,
        accessToken: "pk.eyJ1Ijoic2hwYXdlbCIsImEiOiJjaXMwOGRqajYwMDBhMnpvNzdyOWYxNWU2In0.tCzDmtQKGwFwHx40zXQhKQ",
        center: [37.627487, 55.741028],
        // style: 'mapbox://styles/mapbox/streets-v9'
        style: {
            "version": 8,
            "name": "moesk_gis_show",
            "center": [37.627487, 55.741028],
            "zoom": 8,
            "sprite": "mapbox://sprites/mapbox/streets-v8",
            "glyphs": "mapbox://fonts/mapbox/{fontstack}/{range}.pbf",
            "sources": {
            },
            "layers": [
            ]
        }
    },

    initialize: function (map, options) {
        this.map = map;
        L.Util.extend(this.options, options);
        L.MapboxGL.prototype.initialize.call(this, this.options);
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
        var j;
        var diff = true;
        if (options && (options.diff === false)) {
            diff = false;
        }

        if (!diff) {
            this._glMap.setStyle(style);
        } else {
            // Добавление источника
            if (style.hasOwnProperty('sources')) {
                for (j in style.sources) {
                    if (style.sources.hasOwnProperty(j)) {
                        if (!this._glMap.getSource(j)) {
                            this._glMap.addSource(j, style.sources[j]);
                        }
                    }
                }
            }
            // Добавление слоёв
            if (style.hasOwnProperty('layers')) {
                for (j in style.layers) {
                    if (!style.layers.hasOwnProperty(j)) { continue; }
                    if (!this._glMap.getLayer(style.layers[j].id)) {
                        this._glMap.addLayer(style.layers[j]);
                    }
                }
            }
        }
    },

    setSource: function(id, source) {
        var s = this._glMap.getSource(id);
        if (s) {
            s.setData(source);
        }
    },

    removeStyle: function (style) {
        // Удаление слоёвО
        if (!style) {
            return;
        }
        var j;
        if (style.hasOwnProperty('layers')) {
            for (j in style.layers) {
                if (this._glMap.getLayer(style.layers[j].id)) {
                    this._glMap.removeLayer(style.layers[j].id);
                }
            }
        }

        // TODO: источники пока не удаляем, потому что на них могут ссылаться другие слои
        // Удаление слоёв
        if (style.hasOwnProperty('sources')) {
            for (j in style.sources) {
                if (this._glMap.isSourceLoaded(j)) {
                    this._glMap.removeSource(j, style.sources[j]);
                }
            }
        }
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
    },

    _reloadSources: function() {
        var _style = this._glMap.getStyle();
        if (!_style.hasOwnProperty('sources')) { return; }
        for (var source in _style.sources) {
            if (!_style.sources.hasOwnProperty(source)) { continue; }
            this._glMap.style.sourceCaches[source].reload();
            this._glMap.getSource(source).load();
            console.log(source + ' is reload', new Date());
        }
    },

    reload: function () {
        // this._glMap.style.reload();
        this._reloadSources();

    },
    
    reloadSource: function (source) {
        for (var s in source) {
            if (this._glMap.style.sourceCaches.hasOwnProperty(s)) {
                this._glMap.style.sourceCaches[s].reload();
            }
        }
    },

    getBearing: function() {
        return this._glMap.getBearing();
    },

    setBearing: function(bearing, eventData) {
        return this._glMap.setBearing(bearing, eventData);
    },
    
    rotateTo: function(bearing, options, eventData) {
        this._glMap.rotateTo(bearing, L.Util.extend({duration: 1000}, options), eventData);
    },

    /**
    * Adds a listener for events of a specified type.
    *
    * @method
    * @name on
    * @memberof Map
    * @instance
    * @param {string} type The event type to add a listen for.
    * @param {Function} listener The function to be called when the event is fired.
    *   The listener function is called with the data object passed to `fire`,
    *   extended with `target` and `type` properties.
    * @returns {Map} `this`
    */

    /**
    * Adds a listener for events of a specified type occurring on features in a specified style layer.
    *
    * @param {string} type The event type to listen for; one of `'mousedown'`, `'mouseup'`, `'click'`, `'dblclick'`,
    * `'mousemove'`, `'mouseenter'`, `'mouseleave'`, `'mouseover'`, `'mouseout'`, `'contextmenu'`, `'touchstart'`,
    * `'touchend'`, or `'touchcancel'`. `mouseenter` and `mouseover` events are triggered when the cursor enters
    * a visible portion of the specified layer from outside that layer or outside the map canvas. `mouseleave`
    * and `mouseout` events are triggered when the cursor leaves a visible portion of the specified layer, or leaves
    * the map canvas.
    * @param {string} layer The ID of a style layer. Only events whose location is within a visible
    * feature in this layer will trigger the listener. The event will have a `features` property containing
    * an array of the matching features.
    * @param {Function} listener The function to be called when the event is fired.
    * @returns {Map} `this`
    */
    mapON: function(type, layer, listener) {
        this._glMap.on(type, layer, listener);
    },

    /**
    * Removes an event listener previously added with `Map#on`.
    *
    * @method
    * @name off
    * @memberof Map
    * @instance
    * @param {string} type The event type previously used to install the listener.
    * @param {Function} listener The function previously installed as a listener.
    * @returns {Map} `this`
    */

    /**
    * Removes an event listener for layer-specific events previously added with `Map#on`.
    *
    * @param {string} type The event type previously used to install the listener.
    * @param {string} layer The layer ID previously used to install the listener.
    * @param {Function} listener The function previously installed as a listener.
    * @returns {Map} `this`
    */
    mapOFF: function (type, layer, listener) {
        this._glMap.off(type, layer, listener);
    }
});

L.MapboxITT = function (url, options) {
	return new L.MapboxGL.ITT(url, options);
};

}());