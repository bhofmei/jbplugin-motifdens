define([
  'dojo/_base/declare',
  'JBrowse/Plugin',
  'dijit/form/Button',
  'dijit/registry',
  'MotifDensityPlugin/View/Dialog/MotifDensityDialog'
  ],
    function (
      declare,
      JBrowsePlugin,
      dijitButton,
       dijitRegistry,
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

            if (this.config.dialog) {
              var button;
              browser.afterMilestone('initView', function () {
                function showDialog() {
                  new MotifDensDialog({
                    setCallback: function (ws, wd, minsc, maxsc, m, clr) {},
                    windowSize: 100,
                    windowDelta: 10,
                    minScore: 0,
                    maxScore: 1,
                    motifs: thisB.config.dialogMotifs,
                    colors: thisB.config.dialogColors
                  }).show();
                }
                // create button
                button = new dijitButton({
                  innerHTML: 'M',
                  title: 'take screen shot of browser',
                  id: 'motif-button',
                  onClick: showDialog
                });
                browser.menuBar.appendChild(button.domNode);
              }); // end initview

              browser.afterMilestone('completely initialized', function () {
                if (browser.view.tracks.length < 1) {
                  setTimeout(function () {
                    button = dijitRegistry.byId('motif-button');
            button.onClick();
                  }, 1000)
                }
              }); // end completely initialized
            } // end if dialog
          }// end constructor
      });
      });
