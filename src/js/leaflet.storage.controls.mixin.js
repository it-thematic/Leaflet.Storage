L.Control.Embed.Mixin = {
    position: 'topright'
};
L.Control.Embed.include(L.Control.Embed.Mixin);


L.Storage.MoreControls.Mixin = {
    position: 'topright'
};
L.Storage.MoreControls.include(L.Storage.MoreControls.Mixin);


L.Storage.DataLayersControl.Mixin = {
    addDataLayer: function (container, datalayer, draggable) {
        var datalayerLi = L.DomUtil.create('li', '', container);
        //TODO: IT : пока уберем  - корректное перемещение слоя
        // if (draggable) L.DomUtil.element('i', {className: 'drag-handle', title: L._('Drag to reorder')}, datalayerLi);
        datalayer.renderToolbox(datalayerLi);

        //Вешаем легенду
        var zoomTo = L.DomUtil.create('i', 'layer-zoom_to', datalayerLi, datalayer.options.name);
        zoomTo.id =  datalayer.options.laydescription;
        zoomTo.title = L._('Показать легенду');


        var title = L.DomUtil.add('span', 'layer-title', datalayerLi, datalayer.options.name);
        //TODO: ForestMap : назначение обозначения для открытия табличного представления
        title.id =  datalayer.options.laydescription;


        datalayerLi.id = 'browse_data_toggle_' + datalayer.storage_id;

        L.DomUtil.classIf(datalayerLi, 'off', !datalayer.isVisible());
        title.innerHTML = datalayer.options.name;

        //отобразить легенду
        L.DomEvent.on(zoomTo, 'click', function () {
            var namelayer = zoomTo.id;
            if (namelayer != '')
            {
                $('#widget_legenda').children().children().children('img').attr('src', '/static/main/src/image/'  + namelayer + '.png');
                $('#widget_legenda').show();
            }
        }, this);

    }
};
L.Storage.DataLayersControl.include(L.Storage.DataLayersControl.Mixin);


L.Storage.TileLayerControl.Mixin = {
    //TODO: ForestMap  - добавление на нижний толбар открытия легенды
    //TODO:  замена  слоя происходит при нажатии  только на картинку
    addTileLayerElement: function (tilelayer, options) {
        var selectedClass = this._map.hasLayer(tilelayer) ? 'selected' : '',
            el = L.DomUtil.create('li', selectedClass, this._tilelayers_container),
                     img = L.DomUtil.create('img', '', el),
                     // name = L.DomUtil.create('div', 'mainclass', el),
                     widget_f = L.DomUtil.create('div', 'mainclass', el);


        widget_f.id= tilelayer.options.attribution;
        widget_f.innerHTML = tilelayer.options.name;
        widget_f.title = "Легенда слоя";

        img.src = L.Util.template(tilelayer.options.url_template, this._map.demoTileInfos);

        // name.innerHTML = tilelayer.options.name ;
        L.DomEvent.on(img, 'click', function () {
            this._map.selectTileLayer(tilelayer);
            this._map.ui.closePanel();
        }, this);

        //TODO:ForestMap  отображение легенды
        L.DomEvent.on(widget_f, 'click', function () {
            var namelayer = widget_f.id;
            if (namelayer != '')
            {
                $('#widget_legenda').children().children().children('img').attr('src', '/static/main/src/image/'  + namelayer + '.png');
                $('#widget_legenda').show();
            }
        }, this);
    },

    openSwitcher: function (options) {
        var container = L.DomUtil.get('tile_layer_container');
        if (container) {
            if (L.DomUtil.hasClass(container, 'leaflet-control-tilelayers')) {
                this._tilelayers_container = L.DomUtil.create('ul', 'storage-tilelayer-switcher-container');
                this.buildList(options);
//                L.DomUtil.removeClass(container, 'leaflet-control-tilelayers');
//                L.DomUtil.addClass(container, 'leaflet-control-tilelayers-enable');
            } else {
//                L.DomUtil.removeClass(container, 'leaflet-control-tilelayers-enable');
//                L.DomUtil.addClass(container, 'leaflet-control-tilelayers');
//                this._map.ui.closePanel();
            }
        }
    }
};
L.Storage.TileLayerControl.include(L.Storage.TileLayerControl.Mixin);


L.Storage.LocateControl.Mixin = {
    position: 'topright'
};
L.Storage.LocateControl.include(L.Storage.LocateControl.Mixin);


L.Storage.SearchControl.Mixin = {
    onAdd: function (map) {

        var container = L.DomUtil.create('div', 'leaflet-control-search storage-control');
        //блокируем область
        L.DomEvent.disableClickPropagation(container);
        var elementFormInput = L.DomUtil.create('div', 'element_form_input', container);
            var widForestry =  L.DomUtil.create('select', 'widForestry', elementFormInput);
            widForestry.setAttribute('data-live-search','true');
            widForestry.setAttribute('id','widForestry');
            var widLforestry =  L.DomUtil.create('select', 'widLforestry', elementFormInput);
            widLforestry.setAttribute('data-live-search','true');
            widLforestry.setAttribute('id', 'widLforestry');
            var widNblock =  L.DomUtil.create('input', 'widNblock', elementFormInput);
            widNblock.setAttribute('id','widNblock');
            var widNparcel =  L.DomUtil.create('input', 'widNparcel', elementFormInput);
            widNparcel.setAttribute('id','widNparcel');
        
        widNblock.setAttribute('placeholder', 'кв.');
        widNparcel.setAttribute('placeholder', 'выд.');

        

        var elementFormButFilter = L.DomUtil.create('div', 'forest-control-filter storage-control leaflet-control', container);
        var geomForest =L.DomUtil.create('a', 'findForestMap', elementFormButFilter);
        geomForest.setAttribute('id','geomForest');
        $(geomForest).dblclick("a", function (evt) {
                return false
            });
        $(geomForest).click("a", function (evt) {
                return false
            });
        
        var queryButtonContainer = L.DomUtil.create('div', 'forest-control-query storage-control leaflet-control', container);
        queryButtonContainer.id = 'queryButtonContainer';
        queryButtonContainer.setAttribute('style', 'width: 35px; height: 35px;');
//        var queryButton = L.DomUtil.create('a', 'queryForestMap');
//        queryButton.id = 'queryBtn';
//        queryButton.href = '#';
//        queryButton.title = 'Запрос';
        
        $(queryButtonContainer).click('a', function (evt) {
            return false
        });
        
        /** */

//        var elementFormButRosreestr = L.DomUtil.create('div', 'forest-control-rosreestr storage-control leaflet-control', container);
//        var infoRosreet =L.DomUtil.create('a', 'findForestMap', elementFormButRosreestr);
//        infoRosreet.setAttribute('id','infoRosreestr');
//        $(infoRosreet).dblclick("a", function (evt) {
//                return false
//            });
//        $(infoRosreet).click("a", function (evt) {
//                return false
//            });

        return container;
    }
};
L.Storage.SearchControl.include(L.Storage.SearchControl.Mixin);

L.Storage.DrawToolbar.prototype.initialize = function (options) {
    L.Toolbar.Control.prototype.initialize.call(this, options);
    this.map = this.options.map;
    this.map.on('seteditedlayer', this.redraw, this);
};
L.Storage.DrawToolbar.prototype.appendToContainer = function (container) {
    this.options.actions = [];
    if (this.map.editedLayer) {
        if (this.map.options.enableMarkerDraw) {
            this.options.actions.push(L.S.DrawMarkerAction);
        }
        if (this.map.options.enablePolylineDraw) {
            this.options.actions.push(L.S.DrawPolylineAction);
            if (this.map.editedFeature && this.map.editedFeature instanceof L.S.Polyline) {
                this.options.actions.push(L.S.AddPolylineShapeAction);
            }
        }
        if (this.map.options.enablePolygonDraw) {
            this.options.actions.push(L.S.DrawPolygonAction);
            if (this.map.editedFeature && this.map.editedFeature instanceof L.S.Polygon) {
                this.options.actions.push(L.S.AddPolygonShapeAction);
            }
        }
    }
    L.Toolbar.Control.prototype.appendToContainer.call(this, container);
};

L.Storage.DeleteVertexAction.Mixin = {
    onClick: function () {
        if (this.vertex.editor.vertexCanBeDeleted(this.vertex)) this.vertex.delete();
    }
};
L.Storage.DeleteVertexAction.include(L.Storage.DeleteVertexAction.Mixin);

// =====================================================================================================================
// New stroage actions
// =====================================================================================================================

L.Storage.CancelFeatureAction = L.S.BaseFeatureAction.extend({

    options: {
        toolbarIcon: {
            className: 'storage-cancel-one',
            tooltip: L._('Cancel edits')
        }
    },

    onClick: function (e) {
        this.feature.confirmCancel(e);
    }
});

L.Storage.EnableEditLayerAction = L.Storage.BaseAction.extend({

    options: {
        helpMenu: true,
        className: 'edit-layer dark',
        tooltip: L._('Enable editing layer')
    },

    addHooks: function () {
        this.map.editLayer();
    }
});

L.Storage.DisableEditLayerAction = L.Storage.BaseAction.extend({

    options: {
        helpMenu: true,
        className: 'disable-edit-layer',
        tooltip: L._('Disable editing layer')
    },

    addHooks: function () {
        this.map.disableEditLayer();
    }
});

L.Storage.EditingLayerToolbar = L.Toolbar.Control.extend({

    initialize: function (options) {
        L.Toolbar.Control.prototype.initialize.call(this, options);
        this.map = this.options.map;
        this.map.on('seteditedlayer', this.redraw, this);
    },

    appendToContainer: function (container) {
        this.options.actions = [];
        if (!this.map.editedLayer) {
            this.options.actions.push(L.S.EnableEditLayerAction);
        } else {
            this.options.actions.push(L.S.DisableEditLayerAction);
        }
        L.Toolbar.Control.prototype.appendToContainer.call(this, container);
    },

    redraw: function () {
        var container = this._control.getContainer();
        container.innerHTML = '';
        this.appendToContainer(container);
    }
});

L.Storage.pkkControl = L.Control.extend({
    options: {
        position: 'topleft'
    },

    initialize: function (map, options) {
        this.map = map;
        L.Control.prototype.initialize.call(this, options);
        var rosr = L.tileLayer.wms("http://pkk5.rosreestr.ru/arcgis/services/Cadastre/CadastreWMS/MapServer/WMSServer", {
            wmsid: "rosr",
            attribution: "rosr",
            layers: "22,21,20,19,18,16,15,14,13,11,10,9,7,6,4,3,2,1",
            format: "image/png",
            version: "1.3.0",
            transparent: "TRUE",
            detectRetina: true
        });
        try {
            Object.defineProperty(this, 'rosr', {
                get: function () {
                return rosr;
                }
            });
        }
        catch (e) {
        // Certainly IE8, which has a limited version of defineProperty
        }
    },

    onAdd: function (map) {
        var container = L.DomUtil.create('div', 'leaflet-control-pkk storage-control');

        var link = L.DomUtil.create('a', '', container);
        link.href = '#';
        link.title = L._('PKK');

        L.DomEvent
            .on(link, 'click', L.DomEvent.stop)
            .on(link, 'click', this.onClick, this)
            .on(link, 'dblclick', L.DomEvent.stopPropagation);

        return container;
    },

    onClick: function () {
        if (this.map.hasLayer(this.rosr)) {
            this.map.removeLayer(this.rosr)
        } else {
            this.map.addLayer(this.rosr)
        }
        L.DomUtil.classIf(this.getContainer(), 'dark', this.map.hasLayer(this.rosr))
    }
});

L.Storage.printControl = L.Control.extend({
    options: {
        position: 'topleft'
    },

    onAdd: function (map) {
        var container = L.DomUtil.create('div', 'leaflet-control-print storage-control');

        var link = L.DomUtil.create('a', '', container);
        link.href = '#';
        link.title = L._('Print map');

        L.DomEvent
            .on(link, 'click', L.DomEvent.stop)
            .on(link, 'click', this.onClick, this)
            .on(link, 'dblclick', L.DomEvent.stopPropagation);

        return container;
    },

    onClick: function () {
        window.print();
    }
});

L.Storage.SaveControl = L.Control.extend({
    options: {
        position: 'topleft'
    },

    onAdd: function (map) {
        var container = L.DomUtil.create('div', 'leaflet-control-edit-save edit-button');

        var link = L.DomUtil.create('a', '', container);
        link.href = '#';
        link.title = L._('Save current edits') + ' (Ctrl-S)';
        link.innerHTML = L._('Save');

        L.DomEvent
            .addListener(link, 'click', L.DomEvent.stop)
            .addListener(link, 'click', map.save, map);

        return container;
    }
});

L.Storage.CancelControl = L.Control.extend({
    options: {
        position: 'topleft'
    },

    onAdd: function (map) {
        var container = L.DomUtil.create('div', 'leaflet-control-edit-cancel edit-button');

        var link = L.DomUtil.create('a', '', container);
        link.href = '#';
        link.title = L._('Cancel edits');
        link.innerHTML = L._('Cancel');

        L.DomEvent
            .addListener(link, 'click', L.DomEvent.stop)
            .addListener(link, 'click', map.askForReset, map);

        return container;
    }
});

L.Storage.DisableControl = L.Control.extend({
    options: {
        position: 'topleft'
    },

    onAdd: function (map) {
        var container = L.DomUtil.create('div', 'leaflet-control-edit-disable');

        var link = L.DomUtil.create('a', '', container);
        link.href = '#';
        link.title = L._('Disable editing');
        link.innerHTML = L._('Disable editing');

        L.DomEvent
            .addListener(link, 'click', L.DomEvent.stop)
            .addListener(link, 'click', function (e) {
                this.disableEdit(e);
                this.ui.closePanel();
            }, map);

        return container;
    }
});

L.Storage.EditLayerControl = L.Control.extend({
    options: {
        position: 'topleft'
    },
    onAdd: function (map) {
        var container = L.DomUtil.create('div', 'leaflet-control-edit-layer storage-control');

        var link = L.DomUtil.create('a', '', container);
        link.href = '#';
        if (map.editedLayer) {
            link.title = L._('Enable editing layer');
        } else {
            link.title = L._('Disable editing layer');
        }

        L.DomEvent
            .addListener(link, 'click', L.DomEvent.stop)
            .addListener(link, 'click', function (e) {
                if (map.editedLayer) {
                    map.askForDisable(e)
                } else {
                    map.editLayer()
                }
            }, map);

        return container;
    }

});

L.Storage.importControl = L.Control.extend({
    options: {
        position: 'topleft'
    },

    onAdd: function (map) {
        var container = L.DomUtil.create('div', 'leaflet-control-upload storage-control');

        var link = L.DomUtil.create('a', '', container);
        link.href = '#';
        link.title = L._('Import data') + ' (Ctrl+I)';

        L.DomEvent
            .on(link, 'click', L.DomEvent.stop)
            .on(link, 'click', map.importPanel, map);
        return container;
    },

    onClick: function () {
        window.print();
    }
});

L.Storage.tablesemanticControl = L.Control.extend({
    options: {
        position: 'topleft'
    },

    onAdd: function (map) {
        var container = L.DomUtil.create('div', 'leaflet-control-table-semantic storage-control');

        var link = L.DomUtil.create('a', '', container);
        link.href = '#';
        link.title = L._('Открыть  семантику');

        $(link).click('a', function (evt) {
            evt.preventDefault();
            dlgForest.ShowForestMapData(evt,'', '');
            return false;
        });
        return container;
    }
});

L.Storage.searchcontextControl = L.Control.extend({
    options:{
        position : "topleft"
    },

    onAdd: function (map) {
        var container = L.DomUtil.create('div', 'leaflet-control-searchcontextCadNum storage-control');
        //блокируем область
        L.DomEvent.disableClickPropagation(container);


        var aisumz_search = L.DomUtil.create('div','umz-search', container);
          var search_input =  L.DomUtil.create('input', 'search_input', aisumz_search);
            search_input.setAttribute('data-live-search','true');
            // search_input.setAttribute('id','search_input');
            search_input.setAttribute('placeholder',"   Поиск ...");
            search_input.setAttribute('type',"text");


        // var elementFormButFilter = L.DomUtil.create('div', 'forest-control-filter storage-control leaflet-control', container);
        // var search_cadnum =L.DomUtil.create('a', 'findForestMap', elementFormButFilter);
        // search_cadnum.setAttribute('id','search_cadnum');

        //  $(search_cadnum).click('a', function (evt) {
        //     evt.preventDefault();
        //     dlgForest.SearchContextCadNumber(evt,$(search_input).val(),MAP.layerSearchCadNum);
        //     return false;
        // });

         $(search_input).on('keydown',function (evt) {
             if (evt.keyCode === L.S.Keys.ENTER) {
                evt.preventDefault();
                dlgForest.SearchContextCadNumber(evt,$(search_input).val(),MAP.layerSearchCadNum);
                return false;
             }
         });
         $('.search-input').on('keyup',function (e) {
                if (e.which ===17) {
                    e.preventDefault();
                    $('.search-input').focus();
                }
                else{
                    if (e.keyCode === L.S.Keys.ESC){
                        $('.search-input').cleanData();
                    }
                    else {
                        if (e.which !== 0 && !e.ctrlKey && !e.metaKey && !e.altKey && e.keyCode !== 114 && e.keyCode !== 70) {
                            dlgForest.SearchContextCadNumber(e, $(search_input).val(), MAP.layerSearchCadNum);
                        }
                    }
                }
                return false;

         });

        return container;
    }

});


L.Storage.reportControls = L.Control.extend({
    geometry: null,
    editable: null,
    VK_DELETE: 46,
    lreport : null,

    options: {
        position: 'topleft'
    },


    onAdd: function (map) {
        var container = L.DomUtil.create('div', 'leaflet-control-report storage-control');

        var poly = L.DomUtil.create('a', 'poly', container);
        poly.href = '#';
        poly.title = 'Пространственный отчет';

        L.DomEvent
            .on(poly, 'click', L.DomEvent.stop)
            .on(poly, 'click', this.preCreateReport, this);
        return container;
    },

    preCreateReport: function () {
        if (!lsel.isEmpty()) lreport.addLayer(L.polygon(lsel.getLatLngs()));
        if (lreport.getLayers().length != 0) {
            this.askCreate()
        } else {
            this.geometry = this.createGeometry();
        }
    },

     createReport: function () {
        console.log(lreport.toGeoJSON());

        var geojson = lreport.toGeoJSON();
        var formData = new FormData();
        formData.append('geojson', JSON.stringify(geojson));

        var param = {};
        for (var pair of formData.entries()) {
            param[pair[0]] = pair[1]
        }
        window.open(this._getUrlReport(jQuery.param(param)), '_blank');
        lreport.clearLayers()
    },
        askCreate: function () {
        var that = this;
        var box = L.DomUtil.create('div', 'report-confirm-box dark', document.body);
        var builder = new L.S.FormBuilder(this._map, [
            ['add', {
                handler: L.FormBuilder.ControlChoice,
                label: 'Добавить объект?',
                choices: [
                    [true, 'Добавить объект'],
                    [false, 'Сформировать отчет'],
                    ['null', 'Очистить']
                ],
                callback: function (e) {
                    L.DomUtil.removeClass(document.body, 'report-confirm-on');
                    var value = e.helper.toJS();
                    if (value == null) {
                        lreport.clearLayers();
                        return;
                    }
                    if (!value) {
                        that.createReport();
                    } else {
                        that.createGeometry();
                    }
                }
            }]
        ]);
        var form = builder.build();
        var checked = form.querySelector('input[type="radio"]:checked');
        if (checked) checked.checked = false;
        box.appendChild(form);
        L.DomUtil.addClass(document.body, 'report-confirm-on');
    },

    createGeometry: function () {
        return this.editable.startPolygon();
    },

     _onToggleEdit: function (e) {
        e.layer.toggleEdit(e);
    },

    _onNewHole: function (e) {
        e.layer.newHole(e.latlng)
    },

    _onDelete: function (e) {
        if (e.layer._latlngs && e.layer._latlngs.length < e.layer.editor.MIN_VERTEX) lreport.removeLayer(e.layer)
    },

    _getUrlReport: function (param) {
        var template, url;
        template = '/spatialreport/?{param}';
        url = L.Util.template(template, {param: param});
        return url;
    },

     initialize: function (map, options) {
        L.Control.prototype.initialize.call(this, map, options);
        lreport = L.featureGroup([]).addTo(map);
        this.editable = new L.Editable(map, {
            featuresLayer: lreport
        });

        this.editable.on('editable:drawing:cancel', this._onDelete);

        lreport
            .on('click', L.DomEvent.stop)
            .on('click', function (e) {
                if (e.originalEvent.shiftKey) this._onToggleEdit(e);
                if (e.originalEvent.ctrlKey) this._onNewHole(e);
            }, this);

        L.DomEvent.addListener(document, 'keydown', function (e) {
            if (e.keyCode === L.S.Keys.ESC) {
                if (this.editable.drawing()) this.editable.stopDrawing();
            }
            if (e.keyCode === L.S.Keys.ENTER) {
                if (this.editable.drawing()) this.editable.commitDrawing();
            }
            if (e.keyCode === this.VK_DELETE) {
                var _layers = lreport.getLayers();
                for (var i in _layers) {
                    if (_layers[i].editEnabled()) {
                        lreport.removeLayer(_layers[i]);
                    }
                }
                delete _layers;
            }
        }, this);
    },



});

