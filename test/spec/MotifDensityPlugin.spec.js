require([
    'dojo/_base/declare',
    'dojo/_base/array',
    'JBrowse/Browser',
    'JBrowse/Store/SeqFeature/SequenceChunks',
    'MotifDensityPlugin/View/ColorHandler',
    'MotifDensityPlugin/View/Track/MotifDensity',
    'MotifDensityPlugin/Store/SeqFeature/SingleMotifDensity',
    'MotifDensityPlugin/Store/SeqFeature/MotifDensityStore',
    'MotifDensityPlugin/Store/Util'
    ], function(
        declare,
        array,
        Browser,
        SequenceChunks,
        ColorHandler,
        motifDensTrack,
        motifDensSingleStore,
        motifDensStore,
        mmotifDensUtil
    ) {

    describe( 'Initial test', function() {
        var test = true;
        it('jasmine is working', function() {
            expect(test).toBe(true);
        });
    }); // end initial test

    describe( 'Test degenerate nucleotide utilities', function(){
        it('non-degenerate test, forward only', function(){
            var cgAr = mmotifDensUtil.getPossibilities('CG',false);
            var gttAr = mmotifDensUtil.getPossibilities('GTT',false);
            expect(cgAr.length).toBe(1);
            expect(gttAr.length).toBe(1);
        });

        it('non-degenerate test, both strands', function(){
            var cgAr = mmotifDensUtil.getPossibilities('CG',true);
            var gttAr = mmotifDensUtil.getPossibilities('GTT',true);
            expect(cgAr.length).toBe(2);
            expect(gttAr.length).toBe(2);
        });

        it('degenerate test, forward only', function(){
            var cnAr = mmotifDensUtil.getPossibilities('CN',false);
            var chhAr = mmotifDensUtil.getPossibilities('CHH',false);
            var gbrAr = mmotifDensUtil.getPossibilities('GBR',false);
            var nnAr = mmotifDensUtil.getPossibilities('NN',false);
             var nnnAr = mmotifDensUtil.getPossibilities('NNN',false);
            expect(cnAr.length).toBe(4);
            expect(chhAr.length).toBe(9);
            expect(gbrAr.length).toBe(6);
            expect(nnAr.length).toBe(16);
            expect(nnnAr.length).toBe(64);
        });

        it('degenerate test, both strands', function(){
            var cnAr = mmotifDensUtil.getPossibilities('CN',true);
            var chhAr = mmotifDensUtil.getPossibilities('CHH',true);
            var gbrAr = mmotifDensUtil.getPossibilities('GBR',true);
            var nnAr = mmotifDensUtil.getPossibilities('NN',true);
            expect(cnAr.length).toBe(8);
            expect(chhAr.length).toBe(18);
            expect(gbrAr.length).toBe(12);
            expect(nnAr.length).toBe(32);
        });
    }); // end test util

    describe('test color handler utility', function(){
        it('generate n colors', function(){
            var clr5 = ColorHandler.generateNColors(5);
            expect(clr5.length).toBe(5);
            expect(clr5).toEqual(["#ff00a2", "#ea8500", "#00bb20", "#00c2ff", "#0097ff"]);
        });

        it('generate random colors', function(){
            var clr2 = ColorHandler.generateRandomColors(["CG","CH"]);
            expect(clr2).toEqual({CG:"#ff00a2",CH:'#00c29b'});
        });

        it('get font color', function(){
            var cr1 = ColorHandler.getFontColor('#284996');
            expect(cr1).toBe('#F0F0F0');
            var cr2 = ColorHandler.getFontColor('#f1b982');
            expect(cr2).toBe('#010101');
        });

        it('get color from list', function(){
            var colorList = ['blue','red','pink','purple']

            var clr2 = ColorHandler.intToColorFromList(1, colorList, true);
            expect(clr2).toBe('red');

            var clr2 = ColorHandler.contextToColorFromList('CN', ['TA','WCN','CN','NY'],['blue','red','pink','purple'], true);
            expect(clr2).toBe('pink');
        });

        it('get color from list not defined', function(){
            var un = ColorHandler.contextToColorFromList('NN',['NH','GT','AC'],['blue','red','pink'], false);
            expect(un).not.toBeDefined()
        });

        it('get color from repeatable list', function(){
            var colorList = ['blue','red','pink'];
            var ctxList = ['AA','AC','AT','CC','CG','CT','GA','GC','TT'];

            var clr1 = ColorHandler.contextToColorFromList('CC',ctxList, colorList, true);
            expect(clr1).toBe('blue');
            var clr2 = ColorHandler.contextToColorFromList('TT',ctxList, colorList, true);
            expect(clr2).toBe('pink');
        });
    }); // end test color handler

  describe('test stores', function(){
    var browser = new Browser({unitTestMode: true});
    browser.refSeq = {
      length: 500001
    };
    var seqstore = new SequenceChunks({
      urlTemplate: "../data/seq/{refseq_dirpath}/{refseq}-",
      refSeq: { name: 'Chr5', start: 0, end: 50001 },
      label: "refseqs",
      browser: browser
    });
    describe('test single store', function(){
      var store = motifDensSingleStore({
        store: seqstore,
        browser: browser,
        windowSize: 2000,
        windowDelta: 2000,
        motif: 'TA',
        label: 'single.nucleotide.density.track'
      });
      var features = [];
      beforeEach(function(done){
        store.getFeatures({ref:'Chr5', start: 0, end: 12001}, function(feature){
          features.push(feature);
        }, function(){
          done();
        }, function(error){
          console.error(error);
          done();
        });
      });
      afterEach(function(){
        features = [];
      });

      it('store exists', function(){
        expect(store).toBeTruthy();
      });
      it('features length', function(){
        //console.log(JSON.stringify(features));
        expect(features.length).toBe(6);
      });
      it('features values', function(){
        var scores = array.map(features, function(feat){ return feat.score; });
        var expected = [0.062, 0.1015, 0.1165, 0.1085, 0.0885, 0.0895];
        var i;
        for(i=0; i < scores.length; i++){
          expect(scores[i]).toBeCloseTo(expected[i],3);
        }
      });

    });

    describe('test multi store', function(){
      var store = motifDensStore({
        store: seqstore,
        browser: browser,
        windowSize: 2000,
        windowDelta: 2000,
        motifs: ['Y','KH','NNN'],
        label: 'multi.nucleotide.density.track'
      });
      var features = [];
      beforeEach(function(done){
        store.getFeatures({ref:'Chr5', start: 0, end: 12001}, function(feature){
          features.push(feature);
        }, function(){
          done();
        }, function(error){
          console.error(error);
          done();
        });
      });
      afterEach(function(){
        features = [];
      });

      it('store exists', function(){
        expect(store).toBeTruthy();
      });
      it('features length', function(){
        //console.log(JSON.stringify(features));
        expect(features.length).toBe(18);
      });
      it('features values - Y', function(){
        features = array.filter(features, function(feat){return feat.name === 'Y'});
        var scores = array.map(features, function(feat){ return feat.score; });
        var expected = [0.535732, 0.521239, 0.502749, 0.492754, 0.531734, 0.488256];
        var i;
        for(i=0; i < scores.length; i++){
          expect(scores[i]).toBeCloseTo(expected[i],3);
        }
      });

      it('features values - KH', function(){
        features = array.filter(features, function(feat){return feat.name === 'KH'});
        var scores = array.map(features, function(feat){ return feat.score; });
        var expected = [0.4115, 0.4365, 0.407, 0.426, 0.4295, 0.419];
        var i;
        for(i=0; i < scores.length; i++){
          expect(scores[i]).toBeCloseTo(expected[i],3);
        }
      });
      it('features values - NNN', function(){
        features = array.filter(features, function(feat){return feat.name === 'NNN'});
        var scores = array.map(features, function(feat){ return feat.score; });
        var expected = [1, 1, 1, 1, 1, 1];
        var i;
        for(i=0; i < scores.length; i++){
          expect(scores[i]).toBeCloseTo(expected[i],3);
        }
      });
    });
  });

});

