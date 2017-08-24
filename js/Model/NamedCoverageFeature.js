/**
 * Based on JBrowse CoverageFeature but includes name attribute
 */
define( ['JBrowse/Util'],
        function( Util ) {

return Util.fastDeclare(
    {
        get: function(f) {
            return this[f];
        },
        tags: function() { return [ 'start', 'end', 'score' ]; },
        score: 0,
        constructor: function( args ) {
            this.start = args.start;
            this.end = args.end;
            this.score = args.score;
            this.name = args.name;
        }
    });
});
