L.FormBuilder.LayerTypeChooser.include({
    initialize: function (builder, field, options) {
        this.selectOptions = [
            ['Default', L._('Default')],
            ['Cluster', L._('Clustered')],
            ['Heat', L._('Heatmap')],
            ['Mapbox', L._('Mapbox')]
        ];
        L.FormBuilder.Select.prototype.initialize.call(this, builder, field, options);
    }
});

L.FormBuilder.DateTimeMixin = {
    type: function () {
        return 'datetime-local';
    }
};

L.FormBuilder.DateTimeInput = L.FormBuilder.Input.extend({
    includes: [L.FormBuilder.DateTimeMixin]
});