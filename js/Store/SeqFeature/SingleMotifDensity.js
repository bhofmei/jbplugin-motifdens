define([
    'dojo/_base/declare',
    'dojo/_base/array',
  'dojo/_base/lang',
    'JBrowse/Store/SeqFeature',
    'JBrowse/Store/DeferredFeaturesMixin',
    'JBrowse/Util',
    'MotifDensityPlugin/Model/NamedCoverageFeature',
    'MotifDensityPlugin/Store/Util'
],
function(
    declare,
    array,
     lang,
    SeqFeatureStore,
    DeferredFeaturesMixin,
    Util,
    CoverageFeature,
    StoreUtil
) {
    /*
        Based on GCContent Plugin
        Adapted for sequence motifs and to be used with multitracks
    */
    return declare([SeqFeatureStore, DeferredFeaturesMixin], {
        constructor: function(args) {
            this.store = args.store;
            this.refSeq = this.store.refSeq;
            this.windowSize = args.windowSize;
            this.windowDelta = args.windowDelta;
            this.bothStrands = args.bothStrands;
            this.motif = args.motif;
            this.motifLength = args.motif.length;
            this.motifArray = StoreUtil.getPossibilities(this.motif, this.bothStrands);
            this._deferred.features.resolve({success: true});
        },

        _getGlobalStats: function(callback){
            return this.getGlobalStats(callback);
        },

        getGlobalStats: function(callback /* , errorCallback */) {
            var s = lang.mixin(this.stats, {mean: this.stats.sum / this.stats.count});
            callback(s);
        },

        _getFeatures: function(query, featureCallback, finishCallback, errorCallback){
            //console.log(query.end-query.start,this.nuc);

            this.getFeatures(query, featureCallback, finishCallback, errorCallback);

        },

        getFeatures: function(query, featureCallback, finishCallback, errorCallback) {
            //console.log('getFeatures', this.nuc);
            var hw = this.windowSize / 2; // Half the window size
            query.start = Math.max(0, query.start - hw);
            query.end = Math.min(query.end + hw, this.browser.refSeq.length);
            var thisB = this;

            if (query.end < 0 || query.start > query.end) {
                finishCallback();
                return;
            }
            thisB.stats = {sum: 0, count: 0, min: 5, max: 0};

            this.store.getReferenceSequence(query, function(residues) {
                for (var i = hw; i < residues.length - hw; i += thisB.windowDelta) {

                    var r = residues.slice(i - hw, i + hw);
                    var rn = r.length - thisB.motifLength+1;
                    var nc = 0;
                    for (var j = 0; j < rn; j++) {
                        var rs = r.slice(j, j+thisB.motifLength);
                        if(array.indexOf(thisB.motifArray, rs.toUpperCase()) !== -1)
                            nc++;
                    }
                    var pos = query.start;
                    var score = nc / rn;
                    if(thisB.bothStrands)
                        score /= 2;

                    // add to stats
                    thisB.stats.count++;
                    thisB.stats.sum += score;
                    if(score < thisB.stats.min)
                        thisB.stats.min = score;
                    if(score > thisB.stats.max)
                        thisB.stats.max = score;
                    var n = thisB.motif;
                    var fStart = pos + i - thisB.windowDelta / 2.0;
                    var feat = new CoverageFeature({
                      start: fStart,
                      end: fStart+thisB.windowDelta,
                        score: score,
                        name: n
                    });
                    featureCallback(feat);
                }
                finishCallback();
            },
            finishCallback,
            errorCallback);
        }
    });
});
