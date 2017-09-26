define([
  'dojo/_base/declare',
  'JBrowse/Plugin',
  'MotifDensityPlugin/View/Dialog/MotifDensityDialog'
  ],
  function (
    declare,
    JBrowsePlugin,
    MotifDensDialog
  ) {
    return declare(JBrowsePlugin, {
      constructor: function (args) {
        var browser = args.browser;
        var thisB = this;

        // do anything you need to initialize your plugin here
        this.config.version = '2.1.0';
        console.log("MotifDensityPlugin plugin starting - v" + this.config.version);

        this.config.dialog = false;
        if (args.dialogMode !== undefined)
          this.config.dialog = args.dialogMode;
        this.config.dialogColors = args.dialogColors || 'random';
        this.config.dialogMotifs = args.dialogMotifs || ["CG", "CHG", "CHH", "AT"];

        // register track type
        browser.registerTrackType({
          label: 'MotifDensity',
          type: 'MotifDensityPlugin/View/Track/MotifDensity'
        });

        // dialog mode
        browser.afterMilestone('completely initialized', function () {
          if (thisB.config.dialog) {
            if (browser.view.tracks.length < 1) {
              setTimeout(function () {
                //var button = dijitRegistry.byId('screenshot-button');
                //button.onClick();
                // open dialog
                new MotifDensDialog({
                  setCallback: function (ws, wd, minsc, maxsc, m, clr) {},
                  windowSize: 100,
                  windowDelta: 10,
                  minScore: 0,
                  maxScore: 1,
                  motifs: thisB.config.dialogMotifs,
                  colors: thisB.config.dialogColors
                }).show();
              }, 700);
            }
          }
        })
      }
    });
  });
