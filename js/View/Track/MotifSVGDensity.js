define([
  'dojo/_base/declare',
  'dojo/_base/array',
  'dojo/_base/Color',
  'dojo/colors',
  'dojo/dom-construct',
  'dojox/gfx',
  'MotifDensityPlugin/View/Track/MotifDensity'
], function (
  declare,
  array,
  Color,
  dojoColor,
  domConstruct,
  gfx,
  MotifDensity
) {
  var MotifSVGDensity = declare(MotifDensity, {
    renderBlock: function (args) {
      var block = args.block;

      // don't render this block again if we have already rendered
      // it with this scaling scheme
      if (!this.scaling.compare(block.scaling) || !block.pixelScores)
        return;

      block.scaling = this.scaling;

      domConstruct.empty(block.domNode);

      var features = block.features;
      var featureRects = block.featureRects;
      var dataScale = this.scaling;
      var canvasHeight = this._canvasHeight();
      var canvasWidth = this._canvasWidth(block);

      var c = gfx.createSurface(block.domNode, canvasWidth, canvasHeight);

      c.startBase = block.startBase;
      c.height = canvasHeight;
      block.canvas = c;

      //Calculate the score for each pixel in the block
      var pixels = this._calculatePixelScores(canvasWidth, features, featureRects);


      this._draw(block.scale, block.startBase,
        block.endBase, block,
        c, features,
        featureRects, dataScale,
        pixels, block.maskingSpans); // note: spans may be undefined.

      this.heightUpdate(c.height, args.blockIndex);
      if (!(c.rawNode.parentNode && c.rawNode.parentNode.parentNode)) {
        var blockWidth = block.endBase - block.startBase;

        c.rawNode.style.position = "absolute";
        c.rawNode.style.left = (100 * ((c.startBase - block.startBase) / blockWidth)) + "%";
        switch (this.config.align) {
          case "top":
            c.rawNode.style.top = "0px";
            break;
          case "bottom":
            /* fall through */
          default:
            c.rawNode.style.bottom = this.trackPadding + "px";
            break;
        }
      }

    },

    _drawFeatures: function (scale, leftBase, rightBase, block, canvas, pixels, dataScale) {
      var thisB = this;
      var dim = canvas.getDimensions();
      var canvasHeight = dim.height;

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

      var kheight = canvasHeight / (this.labels.length);
      var fullRects = [];
      for (var i = 0; i < this.labels.length; i++) {
        fullRects[i] = [];
      }
      var rect;

      array.forEach(pixels, function (p, i) {
        if (p) {
          array.forEach(p, function (pi, j) {
            if (pi) {
              rect = fullRects[j];
              var score = pi.score;
              var n = dataScale.normalize(score);
              var fill = '' + featureColor(pi, n);
              // check add to previous
              if (rect.length > 1 && rect[rect.length - 1].score === score) {
                rect[rect.length - 1].w++;
              } else {
                rect.push({
                  x: i,
                  y: j * kheight,
                  score: score,
                  fill: fill,
                  w: 1
                });
              }
            }
          });
        }
      });
      // flatten rects
      var flattenRects = [].concat.apply([], fullRects);
      // draw
      array.forEach(flattenRects, function (rect) {
        /*canvas.createRect({
          x: rect.x,
          y: rect.y,
          width: rect.w,
          height: kheight
        }).setFill(rect.fill)*/
        thisB._createRect(canvas, rect.x, rect.y, rect.w, kheight, rect.fill);
      });

      if(block.tooManyFeatures && !thisB.config.disable_clip_markers){
          /*canvas.createRect({
            x: 0, y: 0, width: dim.width, height: 1
          }).setFill('black');
        canvas.createRect({
            x: 0, y: canvasHeight-1, width: dim.width, height: 1
          }).setFill('black');*/
        var fill = thisB.config.style.clip_marker_color || 'black';
        thisB._createRect(canvas, 0, 0, dim.width, 1, fill);
        thisB._createRect(canvas, 0, canvasHeight-1, dim.width, 1, fill);
        }
    },

    mouseover: function (bpX, evt) {
      // if( this._scoreDisplayHideTimeout )
      //     window.clearTimeout( this._scoreDisplayHideTimeout );
      if (bpX === undefined) {
        var thisB = this;
        //this._scoreDisplayHideTimeout = window.setTimeout( function() {
        thisB.scoreDisplay.flag.style.display = 'none';
        thisB.scoreDisplay.pole.style.display = 'none';
        //}, 1000 );
      } else {
        var block;
        array.some(this.blocks, function (b) {
          if (b && b.startBase <= bpX && b.endBase >= bpX) {
            block = b;
            return true;
          }
          return false;
        });

        if (!(block && block.canvas && block.pixelScores && evt))
          return;

        var pixelValues = block.pixelScores;
        var canvas = block.canvas.rawNode;
        var cPos = dojo.position(canvas);
        var x = evt.pageX;
        var cx = evt.pageX - cPos.x;

        if (this._showPixelValue(this.scoreDisplay.flag, pixelValues[Math.round(cx)])) {
          this.scoreDisplay.flag.style.display = 'block';
          this.scoreDisplay.pole.style.display = 'block';

          this.scoreDisplay.flag.style.left = evt.clientX + 'px';
          this.scoreDisplay.flag.style.top = cPos.y + 'px';
          this.scoreDisplay.pole.style.left = evt.clientX + 'px';
          this.scoreDisplay.pole.style.height = cPos.h + 'px';
        }
      }
    },
    _createRect: function(canvas, x, y, w, h, fill){
      var path = 'M ' + x + ','+y + ' h '+ w + ' v ' + h + ' h -' + w + ' z';
      canvas.createPath({path: path}).setFill(fill);
    }
  });
  return MotifSVGDensity;
});
