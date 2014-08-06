define(function (require) {
    "use strict";
    var $ = require("jquery");
    var _ = require("underscore");
    var Backbone = require("backbone");
    var Marionette = require("marionette");
    var Promise = require("bluebird");

    return Marionette.Controller.extend({
        constructor: function (options) {
            Marionette.Controller.prototype.constructor.apply(this, arguments);

            if (options.model) {
                this.model = options.model;
            }
        }
    }, {
        _showView: function (region, modelPromise, viewClass, viewOptions) {
            var ThisClass = this;

            region.show(Promise.resolve(modelPromise)
                .then(function (model) {
                    var controllerArgs = {
                        region: region
                    };

                    if (model) {
                        controllerArgs.model = model;
                    }
                    var controller = new ThisClass(controllerArgs);

                    var ViewClass = controller.viewClass || viewClass;
                    var viewArgs = {
                        controller: controller
                    };
                    if (model) {
                        viewArgs.model = model;
                    }
                    var view = new ViewClass(_.extend(viewArgs, viewOptions));
                    controller.listenTo(view, "destroy", controller.destroy);

                    return view;
                }));
        }
    });
});