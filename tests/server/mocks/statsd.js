'use strict';

var sinon = require('sinon');

module.exports = sinon.stub().returns({
	timing: sinon.stub(),
	gauge: sinon.stub(),
	increment: sinon.stub(),
	decrement: sinon.stub(),
	histogram: sinon.stub(),
	set: sinon.stub(),
	unique: sinon.stub(),
	classifiedTiming: sinon.stub(),
	classifiedGauge: sinon.stub(),
	classifiedIncrement: sinon.stub(),
	classifiedDecrement: sinon.stub(),
	classifiedHistogram: sinon.stub(),
	classifiedSet: sinon.stub(),
	classifiedUnique: sinon.stub(),
	buildMetricNameForUrl: sinon.stub()
});
