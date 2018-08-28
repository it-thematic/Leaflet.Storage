StorageMixin = {
    initMapbox: function () {
        // TODO: vector_tiles
        this._timeout = 10000;

        this.MAPBOX = L.MapboxITT(this, {});
        this.MAPBOX.addTo(this);

        var that = this;
        this.timerId = setTimeout(function tick() {
            if (that.options.noControl) {
                return;
            }
            if (that.activeDataLayer && that.activeDataLayer.layer._type === 'Mapbox') {
                that.activeDataLayer.layer.reloadData();
            }
            that.timerId = setTimeout(tick, that._timeout);
        }, that._timeout);

        this.MAPBOX.mapON('load', function (e) {
            if (that.options.noControl) {
                return;
            }
            // that.MAPBOX._glMap.showTileBoundaries = true;
            // that.MAPBOX._glMap.showCollisionBoxes = true;
            if (that.activeDataLayer && that.activeDataLayer.layer._type === 'Mapbox') {
                that.activeDataLayer.layer.reloadData();
            }
            // that.MAPBOX._glMap.vertices = true;
        });

        this.on('update-source', function (e) {
            if (e.map.activeDataLayer && e.map.activeDataLayer.layer._type === 'Mapbox') {
                e.map.activeDataLayer.layer.default_filter = e.layer.default_filter;
            }
        });
    },

    startTimer: function () {
        var that = this;
        if (!!this.timerId) {
            clearTimeout(this.timerId);
        }
        this.timerId = setTimeout(function tick() {
            if (that.options.noControl) {
                return;
            }
            if (that.activeDataLayer && that.activeDataLayer.layer._type === 'Mapbox') {
                that.activeDataLayer.layer.reloadData();
            }
            that.timerId = setTimeout(tick, that._timeout);
        }, that._timeout);
    },

    stopTimer: function () {
        if (!!this.timerId) {
            clearTimeout(this.timerId);
            delete this.timerId;
        }
    }
};

L.Storage.Map.include(StorageMixin);
