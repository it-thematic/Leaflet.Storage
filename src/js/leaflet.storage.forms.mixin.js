L.FormBuilder.DataLayerSwitcher.prototype.getOptions = function () {
    var options = [];
    if (this.builder.map.editedLayer) {
        options.push([L.stamp(this.builder.map.editedLayer), this.builder.map.editedLayer.getName()]);
    } else {
        this.builder.map.eachDataLayerReverse(function (datalayer) {
            if(datalayer.isLoaded() && datalayer.allowEdit() && datalayer.canBrowse()) {
                    options.push([L.stamp(datalayer), datalayer.getName()]);
            }
        });
    }
    return options;
};

L.FormBuilder.LayerTypeChooser.include({
    initialize: function(builder, field, options) {
        this.selectOptions = [
            ['Default', L._('Default')],
            ['Cluster', L._('Clustered')],
            ['Heat', L._('Heatmap')],
            ['WFST', L._('WFST')]
        ];
        L.FormBuilder.Select.prototype.initialize.call(this, builder, field, options);
    }
});

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

L.Storage.FormBuilder.addInitHook(function () {
   this.defaultOptions.datalayers = {handler: 'DataLayersSwitcher', label: L._('Choose the edited layer')};
});

L.FormBuilder.DataLayersSwitcher = L.FormBuilder.Select.extend({

    getOptions: function () {
        var options = [];
        this.builder.map.eachDataLayerReverse(function (datalayer) {
            if(datalayer.isLoaded() && datalayer.allowEdit() && datalayer.canBrowse()) {
                    options.push([L.stamp(datalayer), datalayer.getName()]);
            }
        });
        return options;
    },

    toHTML: function () {
        return L.stamp(this.obj);
    },

    toJS: function () {
        return this.builder.map.datalayers[this.value()];
    },

    set: function () {
        // TODO: Переопределил, но закооментарил код потому что в Leaflet.Formbuilder событие 'change' селектора
        // TODO:    вызывает метод 'sync' который в свою очередь вызывает метод 'set' в исходниках которого происходит
        // TODO:    удаление исключение выбранного объекта из внутреннего списка, что нас не устраивает
        // if (this.obj.hasOwnProperty("editedLayer")) {this.obj.editedLayer = this.toJS();}
    }

});