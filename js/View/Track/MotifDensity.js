define([
  'dojo/_base/declare',
  'dojo/_base/array',
  'dojo/_base/lang',
  'dojo/query',
  'dojo/_base/Color',
  'dojo/colors',
  'dojo/dom-construct',
  'JBrowse/View/Track/Wiggle/Density',
  'JBrowse/Util',
  'MotifDensityPlugin/Store/SeqFeature/MotifDensityStore',
  'MotifDensityPlugin/View/ColorHandler',
  'MotifDensityPlugin/View/Dialog/MotifDensityDialog'
],
  function (
    declare,
    array,
    lang,
    query,
    Color,
    dojoColors,
    domConstruct,
    WiggleDensity,
    Util,
    MotifStore,
    ColorHandler,
    MotifDensDialog
  ) {
    return declare(WiggleDensity, {
      constructor: function () {
        this.store = new MotifStore({
          store: this.store,
          browser: this.browser,
          windowSize: this.config.windowSize,
          windowDelta: this.config.windowDelta,
          bothStrands: this.config.bothStrands,
          motifs: this.config.motifs
        });
        //var tmp = [''].concat(this.config.context);
        this.labels = array.map(this.config.motifs, function (motif) {
          return {
            name: motif
          };
        });
        this.randomColors = ColorHandler.generateRandomColors(this.config.motifs);
      },

      _defaultConfig: function () {
        return Util.deepUpdate(lang.clone(this.inherited(arguments)), {
          maxFeatureScreen: 2500,
          forceExactWindowSize: false,
          min_score: 0,
          max_score: 1,
          windowSize: 100,
          windowDelta: 50,
          logScaleOption: false,
          showLabels: true,
          showScores: true,
          colors: 'random',
          bothStrands: false,
          style: {
            height: 100
          }
        });
      },


      getConfigColor: function (motif) {
        return ColorHandler.getConfigColor(motif, this.config.motifs, this.config.colors, this.randomColors);
      },

      getConfForFeature: function (opt, feature) {
        if (opt === 'style.pos_color')
          return this.getConfigColor(feature.name);
        else
          return this.inherited(arguments);
      },

      _calculatePixelScores: function (canvasWidth, features, featureRects) {
        var pixelValues = new Array(canvasWidth);
        array.forEach(features, function (f, i) {
          var fRect = featureRects[i];
          var jEnd = fRect.r;
          var score = f.get('score');
          for (var k = 0; k < this.labels.length; k++) {
            //console.log(this.labels[k].name, f.get('name'));
            if (this.labels[k].name === f.get('name')) {
              break;
            }
          }
          //console.log(k,f.name);
          for (var j = Math.round(fRect.l); j < jEnd; j++) {
            if (!pixelValues[j]) {
              pixelValues[j] = new Array(this.labels.length);
            }
            //console.log(j,k,f.name);
            if (!pixelValues[j][k]) {

              pixelValues[j][k] = {
                score: score,
                feat: f
              };
            }
          }
        }, this);

        // create score displays
        for (var i = 0; i < pixelValues.length; i++) {
          if (pixelValues[i]) {
            var tmp = '';
            for (var k = 0; k < this.labels.length; k++) {
              var clr = this.getConfigColor(this.labels[k].name);
              var fntClr = ColorHandler.getFontColor(clr);
              tmp += '<div class="motif-dens-wiggle-display" ' +
                'style="background-color:' + clr + '; color:' + fntClr + ';">' +
                pixelValues[i][k]['score'].toPrecision(6).toString() + '</div>';
            }
            pixelValues[i]['score'] = tmp;
          }
        }
        return pixelValues;
      },

      _showPixelValue: function (scoreDisplay, score) {
        if (this.config.showScores === false)
          return false;
        var scoreType = typeof score;
        if (scoreType == 'number') {
          // display the score with only 6
          // significant digits, avoiding
          // most confusion about the
          // approximative properties of
          // IEEE floating point numbers
          // parsed out of BigWig files
          scoreDisplay.innerHTML = parseFloat(score.toPrecision(6));
          return true;
        } else if (scoreType == 'string') {
          scoreDisplay.innerHTML = score;
          return true;
        } else if (score && typeof score['score'] == 'number') {
          // "score" may be an object.
          scoreDisplay.innerHTML = parseFloat(score['score'].toPrecision(6));
          return true;
        } else if (score && typeof score['score'] == 'string') {
          // "score" may be an object.
          scoreDisplay.innerHTML = score['score'];
          return true;
        } else {
          return false;
        }
      },

      fillBlock: function(args){
        var regionWidth = (args.rightBase - args.leftBase);
        var nFeatures = regionWidth / this.config.windowDelta;
        args.block.tooManyFeatures = false;
        //query('#track_' + this.config.label + ' div.block canvas').style('border-bottom', null);
        if(nFeatures > this.config.maxFeatureScreen && this.config.forceExactWindowSize){
          // error
          this.fillMessage(args.blockIndex,args.block, 'Too much data to show; increase window delta.');
          args.finishCallback();
        } else if (nFeatures > this.config.maxFeatureScreen){
          // adjust window size/delta to adjust for zoom
          var windowPortion = this.config.windowDelta / this.config.windowSize;
          var windowDelta = Math.floor(regionWidth / this.config.maxFeatureScreen);
          var windowSize = Math.floor(windowDelta / windowPortion);
          this.store.updateWindow(windowSize, windowDelta);
          args.block.tooManyFeatures = true;
          return this.inherited(arguments);
        }
        else {
          this.store.updateWindow(this.config.windowSize, this.config.windowDelta);

        return this.inherited(arguments);
        }
      },

      fillMessage: function(blockIndex, block, message){
        domConstruct.empty( block.domNode );
        domConstruct.create(
            'div', {
                className: 'message',
                innerHTML: message
            }, block.domNode );
        this.heightUpdate( this.config.style.height, blockIndex );
      },

      _drawFeatures: function (scale, leftBase, rightBase, block, canvas, pixels, dataScale) {
        var thisB = this;
        var context = canvas.getContext('2d');
        var canvasHeight = canvas.height;
        if(block.tooManyFeatures && !thisB.config.disable_clip_markers){
          context.fillStyle = 'black';
          context.fillRect(0, canvasHeight-1, canvas.width, 1);
          context.fillRect(0, 0, canvas.width, 1);
        }
        var featureColor = typeof this.config.style.color === 'function' ? this.config.style.color :
          (function () { // default color function uses conf variables
            var disableClipMarkers = thisB.config.disable_clip_markers;
            var normOrigin = dataScale.normalize(dataScale.origin);

            return function (p, n) {
              var feature = p.feat;
              var ret;
              // not clipped
              if (disableClipMarkers || n <= 1 && n >= 0) {
                ret = Color.blendColors(
                  new Color(thisB.getConfForFeature('style.bg_color', feature)),
                  new Color(thisB.getConfForFeature(n >= normOrigin ? 'style.pos_color' : 'style.neg_color', feature)),
                  Math.abs(n - normOrigin)
                ).toString();
              } else {
                ret = (n > 1 ? thisB.getConfForFeature('style.pos_color', feature) :
                  thisB.getConfForFeature('style.neg_color', feature));
              }
              return ret;
            };
          })();

        var resolution = Util.getResolution(context, this.browser.config.highResolutionMode);
        var kheight = canvasHeight / (this.labels.length * resolution);

        array.forEach(pixels, function (p, i) {
          if (p) {
            array.forEach(p, function (pi, j) {
              if (pi) {
                var score = pi.score;
                var n = dataScale.normalize(score);
                context.fillStyle = '' + featureColor(pi, n);
                thisB._fillRectMod(context, i, j * kheight, 1, kheight);
              }
            });
          }
        });
      },

      makeTrackLabel: function () {
        var canvasHeight = this.config.style.height;
        var kheight = canvasHeight / (this.labels.length);
        var thisB = this;
        this.inherited(arguments);
        if (this.config.showLabels) {
          var subTable = domConstruct.create('div', {
            className: 'track-sublabels'
          }, this.div);
          this.sublabels = array.map(this.labels, function (elt) {
            var bg = thisB.getConfigColor(elt.name);
            var htmlnode = domConstruct.create('div', {
              className: 'motif-dens-sublabel',
              id: elt.name,
              style: {
                position: 'absolute',
                height: (kheight - 1) + 'px',
                width: thisB.config.labelWidth ? thisB.config.labelWidth + 'px' : null,
                font: thisB.config.labelFont,
                backgroundColor: bg,
                color: ColorHandler.getFontColor(bg)
              },
              innerHTML: elt.name,
              title: elt.name
            }, subTable);
            return htmlnode;
          });
        }
      },

      updateStaticElements: function ( /** Object*/ coords) {
        this.inherited(arguments);
        var height = this.config.style.height - 2;
        if (this.sublabels && 'x' in coords) {
          var len = this.sublabels.length;
          array.forEach(this.sublabels, function (sublabel, i) {
            sublabel.style.left = coords.x + 'px';
            sublabel.style.top = i * height / len + 'px';
            if (i == len - 1) {
              dojo.addClass(sublabel, 'last');
            }
          }, this);
        }
      },

      _trackMenuOptions: function () {
        var track = this;
        var options = this.inherited(arguments);
        // remove trackScoreChange menu option if included
        var lastOpt = options[options.length - 1];
        if (lastOpt.hasOwnProperty('iconClass') && lastOpt.iconClass === 'trackScoreIcon')
          options.pop();
        options.push({
          type: 'dijit/MenuSeparator'
        }, {
          label: 'Track options',
          iconClass: 'dijitIconFunction',
          onClick: function () {
            new MotifDensDialog({
              setCallback: function (ws, wd, fwnd, minsc, maxsc, m, clr) {
                track.config.windowSize = ws;
                track.config.windowDelta = wd;
                track.config.forceExactWindowSize = fwnd;
                track.config.motifs = m;
                track.config.colors = clr;
                track.config.min_score = minsc;
                track.config.max_score = maxsc;
                track.browser.publish('/jbrowse/v1/c/tracks/replace', [track.config]);
              },
              windowSize: track.config.windowSize,
              windowDelta: track.config.windowDelta,
              forceWindow: track.config.forceExactWindowSize,
              minScore: track.config.min_score,
              maxScore: track.config.max_score,
              motifs: track.config.motifs,
              colors: track.config.colors
            }).show();
          }
        }, {
          label: 'Use both strands',
          title: 'use both strands or forward strand only to compute density',
          type: 'dijit/CheckedMenuItem',
          checked: track.config.bothStrands,
          onClick: function () {
            track.config.bothStrands = this.checked;
            track.browser.publish('/jbrowse/v1/c/tracks/replace', [track.config]);
          }
        }, {
          label: 'Show labels',
          title: 'show sequence context labels on track',
          type: 'dijit/CheckedMenuItem',
          checked: track.config.showLabels,
          onClick: function () {
            track.config.showLabels = this.checked;
            query('#track_' + track.config.label + ' div.track-sublabels').style('display', this.checked ? 'block' : 'none');

          }
        }, {
          label: 'Show scores',
          title: 'show density scores when mouseover track',
          type: 'dijit/CheckedMenuItem',
          checked: track.config.showScores,
          onClick: function () {
            track.config.showScores = this.checked;
            track.browser.publish('/jbrowse/v1/c/tracks/replace', [track.config]);
          }
        });
        return options;
      }
    });
  });
