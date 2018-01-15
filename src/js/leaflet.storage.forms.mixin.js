L.FormBuilder.DataFormat.include({
    initialize: function(builder, field, options) {
        this.selectOptions = [
            [undefined, L._('Choose the data format')],
            ['geojson', 'geojson'],
            ['osm', 'osm'],
            ['csv', 'csv'],
            ['gpx', 'gpx'],
            ['kml', 'kml'],
            ['georss', 'georss'],
            ['pbf', 'pbf']
        ];
        L.FormBuilder.Select.prototype.initialize.call(this, builder, field, options);
    }
});
