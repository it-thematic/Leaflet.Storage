StorageMixin = {
    initMapbox: function () {
        // TODO: vector_tiles
        this.MAPBOX = L.MapboxITT(this, {
        });
        this.MAPBOX.addTo(this);

        var that = this;
        var timerId = setTimeout(function tick() {
            that.MAPBOX.reload();
            // that.fire('mapbox-reload', that);
            // console.log("map reload");
            timerId = setTimeout(tick, 1000);
        }, 1000);

        this.MAPBOX.mapON('load', function (e) {
            // that.MAPBOX._glMap.showTileBoundaries = true;
            // that.MAPBOX._glMap.showCollisionBoxes = true;
            that.MAPBOX._glMap.repaint = true;
            // that.MAPBOX._glMap.vertices = true;
        });

        this.MAPBOX.mapON('click', 'mgs_locations', function (e) {
            console.log(e);
        });

        this.MAPBOX._glMap.on('mouseenter', 'mgs_locations', function (e) {
            console.log(e);
        });

        this.MAPBOX._glMap.on('mouseleave', 'mgs_locations', function (e) {
            console.log(e);
        });

        // this.on('mapbox-reload', this.MAPBOX._glMap._update.bind(this.MAPBOX._glMap, true));

        this.on('update-source', function (e)  {
            if (e.map.activeDataLayer && e.map.activeDataLayer.layer._type === 'Mapbox') {
                e.map.activeDataLayer.layer.default_filter = e.layer.default_filter;
            }
        });

        this.on('click', function (e) {
            var x,y, width=10, height=10;
            x = e.latlng['lat'];
            y = e.latlng['lng'];
            var bbox = [
                [x - width / 2, y - height / 2],
                [x + width / 2, y + height / 2]
            ];
            var features = that.MAPBOX._glMap.queryRenderedFeatures(bbox);//, {layers: ['mgs_locations']});
            console.log(features);
            bbox = [
                [y - width / 2, x - height / 2],
                [x + width / 2, y + height / 2]
            ];
            var features = that.MAPBOX._glMap.queryRenderedFeatures(bbox);//, {layers: ['mgs_locations']});
            console.log(features);
        }, true);
    }
};

L.Storage.Map.include(StorageMixin);
