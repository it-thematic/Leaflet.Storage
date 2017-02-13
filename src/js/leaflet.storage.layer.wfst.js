L.S.Layer.WFST = L.Class.extend({
    _type: 'WFST',
    includes: [L.S.Layer],

    initialize: function (datalayer) {
        this.datalayer = datalayer;
    },

    getFeatures: function(){

    }
});

L.S.Layer.WFSTMixin = {
    _wfst: null
};

L.S.Layer.WFST.include(L.S.Layer.WFSTMixin);
