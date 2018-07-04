StorageMixin = {
    initMapbox: function () {
        // TODO: vector_tiles
        this.MAPBOX = L.MapboxITT(this, {
        });
        this.MAPBOX.addTo(this);

        var that = this;
        var timerId = setTimeout(function tick() {
            that.MAPBOX.reload({diff: false});
            that.MAPBOX._glMap._update();
            document.getElementsByClassName('mapboxgl-map')[0].style.display = 'none';
            document.getElementsByClassName('mapboxgl-map')[0].style.display = 'block';

            timerId = setTimeout(tick, 1000);
        }, 1000);

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
        });
    }
};

L.Storage.Map.include(StorageMixin);
