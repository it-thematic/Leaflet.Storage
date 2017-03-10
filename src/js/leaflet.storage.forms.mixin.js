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