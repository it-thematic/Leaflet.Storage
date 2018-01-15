L.VectorLayer = L.MapboxGL.extend({
    options: {
        version: 8
    },

    initialize: function (options) {
        L.Util.extend(options, {attributionControl: true});
        L.MapboxGL.prototype.initialize.call(this, options);
    },

    getStyle: function () {
        return this._glMap.getStyle();
    },
    
    setStyle: function (style, options) {
        if (!this._glMap.getStyle()) {
            this._glMap.setStyle(style);
            return;
        }

        let diff = true;
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
                for (var j in style.layers) {
                    if (!this._glMap.getLayer(style.layers[j].id)) {
                        this._glMap.addLayer(style.layers[j]);
                    }
                }
            }
        }
    },

    removeStyle: function (style) {
        // Удаление слоёв
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

L.vectorLayer = function (url, options) {
	return new L.VectorLayer(url, options);
};
