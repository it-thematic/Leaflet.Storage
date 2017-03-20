L.Storage.Map.include({

    editLayer: function () {
        var container = L.DomUtil.create('div');

        var builder = new L.S.FormBuilder(this, ['datalayers'], {callbackContext: this});  // removeLayer step will close the edit panel, let's reopen it
        container.appendChild(builder.build());
        if (builder.helpers.datalayers.select.length == 0) {
            var msg = 'Нет видимых доступных для редактирования слоёв';
            this.ui.alert({content: msg, level: 'error', duration: 100000});
            return;
        }
        var editLink = L.DomUtil.create('a', 'button storage-edit', container);
        editLink.href = '#';
        editLink.innerHTML = L._('Edit');
        L.DomEvent
            .on(editLink, 'click', L.DomEvent.stop)
            .on(editLink, 'click', function (e) {
                L.DomEvent.stop(e);
                    var checkedLayer = builder.helpers['datalayers'].toJS();
                    if ( checkedLayer.isWFSTLayer() && !checkedLayer.layer.isValid) {
                        var msg = 'Выбранный слой не доступен для редактироваия';
                        this.ui.alert({content: msg, level: 'error', duration: 3000});
                        return;
                    }
                    this.ui.closePanel();
                    // При смене элемента в Select выбранный слой записывается в редактируемый
                    // Но если выбрать тот слой, который был по умолчанию, то приходится его записывать принудительно
                    if (!this.editedLayer) {this.editedLayer = checkedLayer}
            }, this);

        this.ui.openPanel({data: {html: container}, className: 'dark'})
    },
    
    disableEditLayer: function () {
        if (this.editedLayer && this.editedLayer.isDirty) {
            if (confirm(L._('Layer {name} contain unsaved changes. Save?', {name: '"'+this.editedLayer.options.name+'"'}))) {
                this.editedLayer.save();
                return true;
            } else {

                this.editedLayer.cancel();
            }
        }
        this.editedLayer.clear();
        this.editedLayer = null;
    }
});

L.Storage.Map.addInitHook(function(){
    var editedLayer = null,
        that = this;

    try {
        Object.defineProperty(this, 'editedLayer', {
            get: function () {
                return editedLayer;
            },
            set: function (datalayer) {
                if (!!datalayer && !datalayer.isVisible()) {datalayer.show();}
                editedLayer = datalayer;
                that.fire('seteditedlayer');
            }
        });
    }
    catch (e) {
        // Certainly IE8, which has a limited version of defineProperty
    }
});

L.Storage.Map.prototype.defaultDataLayer = function(){
    if (this.editedLayer) return this.editedLayer;

    var datalayer, fallback;
    datalayer = this.lastUsedDataLayer;
    if (datalayer && datalayer.allowEdit() && datalayer.canBrowse() && datalayer.isVisible()) {
        return datalayer;
    }
    datalayer = this.findDataLayer(function (datalayer) {
        if (datalayer.allowEdit() && datalayer.canBrowse()) {
            if (datalayer.isVisible()) return true;
        }
    });
    if (datalayer) return datalayer;
    if (fallback) {
        // No datalayer visible, let's force one
        this.addLayer(fallback.layer);
        return fallback;
    }
    return this.createDataLayer();
};

L.Storage.Map.prototype.askForReset = function(e) {
    if (!confirm(L._('Are you sure you want to cancel your changes?'))) return;
    if (this.editedLayer) { this.disableEditLayer(); }
    this.reset();
    this.disableEdit(e);
    this.ui.closePanel();
};

L.Storage.Map.prototype.disableEdit = function() {
    if (this.isDirty) return;
    L.DomUtil.removeClass(document.body, 'storage-edit-enabled');
    this.editedFeature = null;
    this.editedLayer = null;
    this.editEnabled = false;
    this.fire('edit:disabled');
};