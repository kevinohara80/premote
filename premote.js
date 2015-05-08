/*global Visualforce:false, define:false, exports:false, module:false */

(function(name, definition, root){
  'use strict';

  if(typeof exports === 'object' && typeof module === 'object') {
    module.exports = definition();
  } else if(typeof define === 'function' && typeof define.amd === 'object') {
    define([], definition);
  } else {
    root[name] = definition();
  }

})('Premote', function(){
  'use strict';

  var Premote = {};
  var Visualforce;

  if(!window || !window.Visualforce) {
    throw new Error('Visualforce Remoting manager not found');
  } else {
    Visualforce = window.Visualforce;
  }

  // Wrap a javascript remoting function in a promise
  // Only works if function is properly `bind`ed to the remoting manager. This
  // method is private to ensure that we pass in properly bound methods.
  function wrapFunction (func, options) {
    return function() {
      var args;

      if(arguments.length) {
        args = Array.prototype.slice.apply(arguments);
      } else {
        args = [];
      }

      return new Promise(function(resolve, reject) {
        var cb = function(result, event) {
          if(event.status) {
            resolve(result);
          } else {
            var err = new Error(event.message);
            err.result = result;
            if(event.type === 'exception') {
              err.apexStackTrace = event.where;
            }
            reject(err);
          }
        };

        args.push(cb);

        if(options) {
          args.push(options);
        }

        func.apply(null, args);
      });
    };
  }

  // public interface.  Can either wrap a string remoting name ('namespace.className.remoteMethod')
  // or a javascript remoting class (`className`)
  // if provided, `options` will be appended to the promises's run-time arguments
  Premote.wrap = function(remoteAction, options) {

    if(options && typeof options !== 'object') {
      throw new Error('options must be an object');
    }

    // if remoteAction is an object, wrap each of its members
    if (typeof remoteAction === 'object') {
      var ret = {};
      for (var prop in remoteAction) {
        if (remoteAction.hasOwnProperty(prop) &&
            typeof remoteAction[prop] === 'function') {
          var func = remoteAction[prop];
          var boundFunc = func.bind(remoteAction);
          ret[prop] = wrapFunction(boundFunc, options);
        }
      }
      return ret;

    // if remoteAction is a string, turn it into a function
    } else if (typeof remoteAction === 'string') {

      // validate the string format
      var namespace, controller, method;
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

      var Manager = Visualforce.remoting.Manager;

      var bound = function () {
        var args;

        if(arguments.length) {
          args = Array.prototype.slice.apply(arguments);
        } else {
          args = [];
        }

        args.splice(0, 0, remoteAction);

        Manager.invokeAction.apply(Manager, args);
      };

      return wrapFunction(bound, options);

    // remoteAction was neither an object nor a string
    } else {
      throw new Error('invalid remote action supplied: ' + remoteAction);
    }
  };

  // create the global
  return Premote;

}, (this || {}));
