// CISCO CONFIDENTIAL
// Copyright (c) 2013, Cisco Systems, Inc.

/**
 * @class ProgressBarWidget
 */
cisco.epg = cisco.epg || {};
cisco.epg.widget = cisco.epg.widget || {};
cisco.epg.widget.common = cisco.epg.widget.common || {};
cisco.epg.widget.common.ProgressBarWidget = function () {

    var progressStartTime, progressDuration, progressTag, progressTimer, progressInterval, max = 100;

    this.initialize = function (startTime, duration, tag, interval) {
        progressStartTime = startTime;
        progressDuration = duration;
        progressTag = tag;
        progressInterval = interval;
        progressTag.max = max;
    };

    this.stopProgressBarTimer = function () {
        if (progressTimer) {
            clearInterval(progressTimer);
        }
    };

    function updateProgressValue() {
        var currentTime = Date.now();
        if (currentTime > (progressStartTime + progressDuration)) {
            progressTag.value = max;
            if (progressTimer) {
                clearInterval(progressTimer);
            }
        }
        else {
            progressTag.value = Math.round(((currentTime - progressStartTime) / progressDuration) * max);
        }
    }

    this.startProgressBarTimer = function () {
        progressTag.style.background = "transparent";
        progressTimer = setInterval(updateProgressValue, progressInterval);
    };
}
// CISCO CONFIDENTIAL
// Copyright (c) 2013, Cisco Systems, Inc.

cisco.declare("cisco.epg.widget.common.util");
/**
 * Clones the object.
 *
 * @method clone
 * @param {Object} obj
 * @returns {Object}
 */
cisco.epg.widget.common.util.clone = function(obj){
	"use strict";
	return JSON.parse(JSON.stringify(obj));
};
