var approot = process.env.PWD;

var glob = require('glob');
var methods = require('methods');

/**
 * Main function to initialize routers of a Express app.
 * 
 * @param  {Express} app  Express app instance
 * @param  {Object} paths (optional) For configure relative paths of
 *                        controllers and filters rather than defaults.
 */
exports.route = function (app, paths) {
	paths = paths || {};
	var ctrlDir = approot + (paths.controllers || '/controllers');
	var fltrDir = approot + (paths.filters || '/filters');
	
	glob.sync(ctrlDir + '/**/*.js').forEach(function (file) {
		file = file.replace(/\/index\.js$/, '/');
		var router = require(file);
		var single = typeof router == 'function';
		var path = file.replace(ctrlDir, '').replace(/\.js$/, '');
		
		single ? app.all(path, router) :
			methods.forEach(function (method) {
				var eachRouter = router[method];
				if (eachRouter) {
					var filters = (eachRouter.filters || []).map(function (item) {
						return require(fltrDir + '/' + item);
					});
					app[method].apply(app, [path].concat(filters)
						.concat([eachRouter.process || eachRouter]));
				}
			});
	});
};
