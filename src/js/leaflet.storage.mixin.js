L.Storage.Map.addInitHook(function () {
    this.on('click', function (e) {
        if (e.stopPropagation) e.stopPropagation();
        var isLoad = true;
        this.eachDataLayerReverse(function (datalayer) {
            if (datalayer.isVisible()) {
                if (datalayer._wfs) {
                    isLoad = false;
                    datalayer.clear();
                    datalayer._wfs.loadFeatures(new L.Filter.Contains(propertyName = 'geometry', value = new L.Marker(e.latlng), crs = L.CRS.EPSG4326));
                }
            }
        }, this, function () {
            return isLoad;
        });
    });
});