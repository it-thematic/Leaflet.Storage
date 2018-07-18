StorageMixin = {
    initMapbox: function () {
        // TODO: vector_tiles
        this.MAPBOX = L.MapboxITT(this, {
        });
        this.MAPBOX.addTo(this);

        var that = this;
        var timerId = setTimeout(function tick() {
            if (that.options.noControl) { return; }
            if (that.activeDataLayer && that.activeDataLayer.layer._type === 'Mapbox') {
                that.activeDataLayer.layer.reloadData();
            }
            timerId = setTimeout(tick, 1000);
        }, 1000);

        this.MAPBOX.mapON('load', function (e) {
            if (that.options.noControl) { return; }
            // that.MAPBOX._glMap.showTileBoundaries = true;
            // that.MAPBOX._glMap.showCollisionBoxes = true;
            if (that.activeDataLayer && that.activeDataLayer.layer._type === 'Mapbox') {
                that.activeDataLayer.layer.reloadData();
            }
            // that.MAPBOX._glMap.vertices = true;
        });

        this.on('update-source', function (e)  {
            if (e.map.activeDataLayer && e.map.activeDataLayer.layer._type === 'Mapbox') {
                e.map.activeDataLayer.layer.default_filter = e.layer.default_filter;
            }
        });
    }
};

L.Storage.Map.include(StorageMixin);
