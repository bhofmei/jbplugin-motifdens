define([
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/_base/array',
    'dojo/promise/all',
    'dojo/when',
    'JBrowse/Store/SeqFeature',
    'JBrowse/Store/DeferredStatsMixin',
    'JBrowse/Store/DeferredFeaturesMixin',
    'MotifDensityPlugin/Store/SeqFeature/SingleMotifDensity'
],
  function (
    declare,
    lang,
    array,
    all,
    when,
    SeqFeatureStore,
    DeferredFeaturesMixin,
    DeferredStatsMixin,
    SingleMotif
  ) {
    /*
        Based on MultiBigWig storage class but adapted for use with motif density
        specifically, adapted for storage classes not fetching data from backend
    */
    return declare([SeqFeatureStore, DeferredFeaturesMixin, DeferredStatsMixin], {
      constructor: function (args) {
        var thisB = this;
        this.motifs = args.motifs;
        this.stores = array.map(args.motifs, function (m) {
          return new SingleMotif(lang.mixin(args, {
            motif: m
          }));
        });
        //console.log(this.stores);
        all(array.map(this.stores, function (store) {
          return store._deferred.features;
        })).then(function () {
            thisB._deferred.features.resolve({
              success: true
            });
            thisB._deferred.stats.resolve({
              success: true
            });
          },
          lang.hitch(this, '_failAllDeferred'));
      },

      _getFeatures: function (query, featureCallback, endCallback, errorCallback) {
        var thisB = this;
        var finished = 0;
        var finishCallback = function () {
          if (thisB.stores.length === ++finished) {
            endCallback();
          }
        };
        array.forEach(thisB.stores, function (store) {
          store._getFeatures(lang.clone(query),
            featureCallback, finishCallback, errorCallback
          );
        }, this);
      },

      _getGlobalStats: function (successCallback, errorCallback) {
        // TODO update
        var thisB = this;
        var finished = 0;
        var stats = {
          scoreMin: 100000000,
          scoreMax: -10000000
        };

        var finishCallback = function (t) {
          if (t.scoreMin < stats.scoreMin) {
            stats.scoreMin = t.scoreMin;
          }
          if (t.scoreMax > stats.scoreMax) {
            stats.scoreMax = t.scoreMax;
          }
          if (thisB.stores.length === ++finished) {
            successCallback(stats);
          }
        };
        array.forEach(this.stores, function (store) {
          store._getGlobalStats(finishCallback, errorCallback);
        });
      },

      getRegionStats: function (query, successCallback, errorCallback) {
        var thisB = this;
        var finished = 0;
        var stats = {
          scoreMin: 100000000,
          scoreMax: -10000000
        };

        var finishCallback = function (t) {
          if (t.scoreMin < stats.scoreMin) {
            stats.scoreMin = t.scoreMin;
          }
          if (t.scoreMax > stats.scoreMax) {
            stats.scoreMax = t.scoreMax;
          }
          if (thisB.stores.length === ++finished) {
            successCallback(stats);
          }
        };
        array.forEach(this.stores, function (store) {
          store.getRegionStats(query, finishCallback, errorCallback);
        });
      },

      saveStore: function () {
        return {
          contexts: this.contexts
        };
      }
    });
  });
