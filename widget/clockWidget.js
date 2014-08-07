cisco.extend(window.cisco,{"epg":{"widget":{"clockWidget":{"Config":{"updateInterval":1000,"timeFormat":"HH:mm:ss","zone":"0"}}}}});
// CISCO CONFIDENTIAL
// Copyright (c) 2013, Cisco Systems, Inc.

/**
 * @author Sanjukta Sukul
 * @date created: 16/09/2013
 * @class cisco.epg.widget.clockWidget.ClockWidget
 * Clock widget to display current time
 */

 //Added code  Aditya
cisco.epg = cisco.epg || {};
cisco.epg.widget = cisco.epg.widget || {};
cisco.epg.widget.clockWidget = cisco.epg.widget.clockWidget || {};

cisco.epg.widget.clockWidget.ClockWidget = function(params){
	this._clockNode = null;
	this._listenerArray = {};
	this._currentTime = null;
	this._clockTimer = null;
	this._config = this._merge(params, cisco.epg.widget.clockWidget.Config);
};

/**
 * Merges 2 objects copying the properties of the 2nd object into the first
 * @param obj1 - object1
 * @param obj2 - object2
 */
cisco.epg.widget.clockWidget.ClockWidget.prototype._merge = function(obj1, obj2){
    var key;
	obj1 = obj1 || {};
        for(key in obj2){
            if(obj2.hasOwnProperty(key)){
                obj1[key] = obj1[key] ? obj1[key] : obj2[key];
            }
        }
	return obj1;
};

/**
 * starts the clock timer
 */
cisco.epg.widget.clockWidget.ClockWidget.prototype.show = function(){
	if(this._config && this._config.clockNode){
		this._clockNode = this._config.clockNode;
		this._clockNode.style.opacity = '1';
	}
	this._updateTime();
	this._startTimer();
};

/**
 * update the clock time in regular interval, interval is configurable and format of the time displayed is configurable
 *
 */
cisco.epg.widget.clockWidget.ClockWidget.prototype._startTimer = function(){
	window.clearInterval(this._clockTimer);

	this._clockTimer = window.setInterval(function(){
		this._updateTime();

	}.bind(this), this._config.updateInterval);
};


/**
 * updates clock time
 *
 */
cisco.epg.widget.clockWidget.ClockWidget.prototype._updateTime = function(){
	this._currentTime = moment().format(this._config.timeFormat);

	if(this._clockNode){
		this._clockNode.innerText = this._currentTime;
	}
	if(this._listenerArray[cisco.epg.widgets.constants.clockWidget.CLOCK_UPDATE]){
		this._notify(cisco.epg.widgets.constants.clockWidget.CLOCK_UPDATE, this._currentTime);
	}
};

/**
 * hides the clock from screen
 *
 */
cisco.epg.widget.clockWidget.ClockWidget.prototype.hide = function(){
    if(this._clockNode){
        this._clockNode.style.opacity = '0';
    }
};

/**
 * disposes clock widget
 *
 */
cisco.epg.widget.clockWidget.ClockWidget.prototype.dispose = function(){
	window.clearInterval(this._clockTimer);
    if(this._clockNode){
        this._clockNode.innerText = "";
    }
	this._listenerArray = null;
	this._config = null;
	this._currentTime = null;
	this._clockTimer = null;
};

/**
 * add listeners to notify them on specific event
 *@param eventType
 * @param handler
 */
cisco.epg.widget.clockWidget.ClockWidget.prototype.addEventListener = function(eventType, handler){
	this._listenerArray[eventType] = handler;
};

/**
 * notifies listeners on specific event
 *@param eventType
 * @param context
 */
cisco.epg.widget.clockWidget.ClockWidget.prototype._notify = function(eventType, context){
	var event = {type: eventType, context: context};
	if(this._listenerArray[eventType]){
		this._listenerArray[eventType].handleEvent(event);
	}
};

/**
 * remove listeners from listeners array
 *@param eventType
 */
cisco.epg.widget.clockWidget.ClockWidget.prototype.removeEventListener = function(eventType){
	delete this._listenerArray[eventType];
};


/**
 * focus widget
 */
cisco.epg.widget.clockWidget.ClockWidget.prototype.focus = function(){

};


/**
 * un focus widget
 */
cisco.epg.widget.clockWidget.ClockWidget.prototype.unFocus = function(){

};

/**
 * handle events
 * @param event
 *
 */
cisco.epg.widget.clockWidget.ClockWidget.prototype.handleEvent = function(event){

};
