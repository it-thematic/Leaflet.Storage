L.S.Layer.WFST= L.WFST.extend({
    _type: 'WFST',
    _wfst: null,

    includes: [L.S.Layer],

    initialize: function (datalayer) {
        this.datalayer = datalayer;
        L.WFST.prototype.initialize.call(this, {
            typeName: datalayer.options.laydescription,
            showExisting: false,
            maxFeatures: 100,
            crs: L.CRS.EPSG4326,
            geometryField: 'geometry',
            style: {
              color: 'red',
              weight: 2
            }
        });
    }
});
