define(function (require) {
	"use strict";
	var $ = require("jquery");
	var _ = require("underscore");
	var Backbone = require("backbone");
	var Marionette = require("marionette");
	var TboneModel = require("common/TboneModel");
	var Promise = require("bluebird");
	var TestReport = require("jenkins/jenkins/TestReport");

	return TboneModel.extend({
		defaults: {
			building: false,
			fullDisplayName: null,
			result: null,
			url: null,
			job: null
		},

		idAttribute: "number",

		url: function () {
			return "/job/" + this.get("job.name") + "/" + this.get("number") + "/api/json";
		},

		isSuccessful: function () {
			return this.get("result") === "SUCCESSFUL";
		},

		getTriggerParameters: function () {
			var parametersAction = _.find(this.get("actions"), function (action) {
				return action.parameters;
			});

			return parametersAction.parameters;
		},

		getTriggerUser: function () {
			var causesAction = _.find(this.get("actions"), function (action) {
				return action.causes;
			});

			return causesAction.causes.userName;
		},

		fetchTestReport: function () {
			return TestReport.fetch(null, {
				build: this
			});
		},

		success: function () {
			var scope = this;
			return this.fetch()
				.then(function () {
					if (scope.get("building")) {
						return Promise.delay(30000)
							.then(function () {
								return scope.success();
							});
					} else {
						if (scope.isSuccessful()) {
							return scope;
						} else {
							return Promise.reject();
						}
					}
				});
		},

		rebuild: function () {
			return this.get("job").triggerBuild(this.getTriggerParameters());
		}
	});
});