(function(root, Q, Visualforce) {

  var Premote = {};

  Premote.wrap = function(remoteAction, options) {

    var namespace, controller, method;

    var Manager = Visualforce.remoting.Manager;
    var parts = remoteAction.split('.');

    if(parts.length === 3) {
      namespace = parts[0];
      controller = parts[1];
      method = parts[2];
    } else if(parts.length === 2) {
      controller = parts[0];
      method = parts[1];
    } else {
      throw new Error('invalid remote action supplied: ' + remoteAction);
    }

    if(options && typeof options !== 'object') {
      throw new Error('options must be an object');
    }

    return function() {
      var deferred = Q.defer();

      var args;

      if(arguments.length) {
        args = Array.prototype.slice.apply(arguments);
      } else {
        args = [];
      }

      args.splice(0, 0, remoteAction);

      var cb = function(result, event) {
        if(event.status) {
          deferred.resolve(result);
        } else {
          var err = new Error(event.message);
          err.result = result;
          if(event.type === 'exception') {
            err.apexStackTrace = event.where;
          }
          deferred.reject(err);
        } 
      };

      args.push(cb);

      if(options) {
        args.push(options);
      }

      Manager.invokeAction.apply(Manager, args);

      return deferred.promise;
    };

  };

  // amd and requirejs support
  if(typeof define === 'function' && define.amd) {
    define(Promote);
  }

  // create the global
  root.Premote = Premote;

}(this, Q, Visualforce));