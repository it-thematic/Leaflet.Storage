StorageMixin = {
    initMapbox: function () {
        // TODO: vector_tiles
        this.MAPBOX = L.MapboxITT(this, {
        });
        this.MAPBOX.addTo(this);

        var that = this;
        var timerId = setTimeout(function tick() {
            that.MAPBOX.reload({diff: false});
            timerId = setTimeout(tick, 30000);
        }, 30000);

        this.MAPBOX.on('add', function (e) {
            that.MAPBOX._glMap.showTileBoundaries = true;
            that.MAPBOX._glMap.showCollisionBoxes = true;
        });

        this.MAPBOX.mapON('load', function (e) {
            // L.DomUtil.addClass(document.body, 'storage-toolbar-enabled');
        });

        this.MAPBOX.mapON('click', 'locations', function (e) {
            console.log(e);
        });
        
        this.on('update-source', function (e)  {
            if (e.map.activeDataLayer && e.map.activeDataLayer.layer._type === 'Mapbox') {
                e.map.activeDataLayer.layer.default_filter = e.layer.default_filter;
            }
        });
    }
};

L.Storage.Map.include(StorageMixin);
