cisco.extend(window.cisco,{"epg":{"widget":{"dcaWidget":{"config":{"KEY_STRING_MAP":{"ACTION_0":"0","ACTION_1":"1","ACTION_2":"2","ACTION_3":"3","ACTION_4":"4","ACTION_5":"5","ACTION_6":"6","ACTION_7":"7","ACTION_8":"8","ACTION_9":"9"},"maxDigitCount":4,"digitTimeOut":2000,"lastDigitTimeOut":500,"dcaEvents":{"ACTION_0":"ACTION_0","ACTION_1":"ACTION_1","ACTION_2":"ACTION_2","ACTION_3":"ACTION_3","ACTION_4":"ACTION_4","ACTION_5":"ACTION_5","ACTION_6":"ACTION_6","ACTION_7":"ACTION_7","ACTION_8":"ACTION_8","ACTION_9":"ACTION_9","ACTION_OK":"ACTION_OK","ACTION_BACK":"ACTION_BACK","ACTION_LEFT":"ACTION_LEFT"},"dcaInitEvents":["ACTION_0","ACTION_1","ACTION_2","ACTION_3","ACTION_4","ACTION_5","ACTION_6","ACTION_7","ACTION_8","ACTION_9"]}}}}});
/**
 * CISCO CONFIDENTIAL
 * Copyright (c) 2013, Cisco Systems, Inc.
 * Author: NitinJ
 * Date: 18/09/2013
 * Class: DCAWidget
 * Desc: class to display the dca digits on the screen
 */

cisco.epg = cisco.epg || {};
cisco.epg.widget = cisco.epg.widget || {};
cisco.epg.widget.dcaWidget = cisco.epg.widget.dcaWidget || {};

/**
 * @Class DCAWidget : class to display the dca digits on the screen
 * @param config
 * @constructor
 */

cisco.epg.widget.dcaWidget.DCAWidget = function (config) {
    'use strict';

    /**
     * _config - configuration values
     * @type Object
     */

    this._config = this._merge(config, cisco.epg.widget.dcaWidget.config);

    /**
     * _view - view object instance
     * @type Object
     */

    this._view = new cisco.epg.widget.dcaWidget.DCAView(this._config);

    /**
     * _listeners - listener object
     * @type Object
     */

    this._listeners = {};

    /**
     * _isVisible - visibility flag
     * @type Boolean
     */

    this._isVisible = false;

    /**
     * _currentDigitCount - Digit Counter
     * @type Number
     */

    this._currentDigitCount = 0;

    /**
     * _timer - Timer flag
     * @type null
     */

    this._timer = null;

    /**
     * _dcaString - DCA entered string
     * @type String
     */

    this._dcaString = "";

    /**
     * _callback - Callback reference
     * @type null
     */

    this._callback = null;

    /**
     * _dcaConstants - DCA constant values
     * @type Object
     */

    this._dcaConstants = cisco.epg.widgets.constants.dcaWidget;

    /**
     * This is the Logger provided by by framework for logging
     * @type Object
     */

    this._log = cisco.neev.log.LogManager.getLogger('cisco.epg.widget');
};

/**
 * @method _merge
 * This method is to merge second object in the first object
 * If any property is present in both the property of the first will be retained
 * @param obj1
 * @param obj2
 * @return obj1 merged with obj2
 * @private
 */

cisco.epg.widget.dcaWidget.DCAWidget.prototype._merge = function (obj1, obj2) {
    'use strict';
    obj1 = obj1 || {};
    var key;
    for (key in obj2) {
        if (obj2.hasOwnProperty(key) && obj1[key] === undefined) {
            obj1[key] = obj2[key];
        }
    }
    return obj1;
};

/**
 * @method isVisible
 * return the flag mentioning visibility of the widget
 * @return {Boolean}
 */

cisco.epg.widget.dcaWidget.DCAWidget.prototype.isVisible = function () {
    'use strict';
    return this._isVisible;
};

/**
 * @method show
 * will show the dca digit on the screen
 * and make the focus on dca widget to consume all the keys
 */

cisco.epg.widget.dcaWidget.DCAWidget.prototype.show = function () {
    'use strict';
    this._log.info('DCAWidget.show() - Entered');
    this.focus();
    this._view.show();
    this._log.info('DCAWidget.show() - Exited');
};

/**
 * @method hide
 * hide the dca widget from the screen,
 * take the focus away from DCAWidget
 * @param hideTriggerConst - It could be one of these constants [HIDE_ACTION_BACK, HIDE_ACTION_OK, HIDE_ACTION_TIMER
 *                          HIDE_ACTION_LEFT, HIDE_ACTION_EXPLICIT]
 */

cisco.epg.widget.dcaWidget.DCAWidget.prototype.hide = function (hideTriggerConst) {
    'use strict';
    var dcaNumber = this._dcaString;
    var hideReason = hideTriggerConst;
    this._log.info('DCAWidget.hide() - Entered');
    this._currentDigitCount = 0;
    clearTimeout(this._timer);
    this.unfocus();
    this._dcaString = '';
    this._view.hide();
    this._log.info('DCAWidget.hide() - Exited');
    this._notify(this._dcaConstants.ACTION_DCA_DISMISSED, dcaNumber, hideReason);

};

/**
 * @method focus
 * make the focus on dca widget to consume all the keys
 */

cisco.epg.widget.dcaWidget.DCAWidget.prototype.focus = function () {
    'use strict';
    this._log.info('DCAWidget.focus() - Entered');
    this._isVisible = true;
    this._addDOMEventListener();
    this._view.focus();
    this._log.info('DCAWidget.focus() - Exited');
};

/**
 * @method unfocus
 * takes the focus away from DCAWidget
 */

cisco.epg.widget.dcaWidget.DCAWidget.prototype.unfocus = function () {
    'use strict';
    this._log.info('DCAWidget.unfocus() - Entered');
    this._isVisible = false;
    this._removeDOMEventListener();
    this._view.unfocus();
    this._log.info('DCAWidget.unfocus() - Exited');
};

/**
 * @method handleEvent
 * Handles the passed event as per the DCA use case functionality
 * @param event
 */

cisco.epg.widget.dcaWidget.DCAWidget.prototype.handleEvent = function (event) {
    'use strict';
    event.stopPropagation();
    if (this._currentDigitCount >= this._config.maxDigitCount) {
        return;
    }
    switch (event.type) {
        case this._dcaConstants.ACTION_0:
        case this._dcaConstants.ACTION_1:
        case this._dcaConstants.ACTION_2:
        case this._dcaConstants.ACTION_3:
        case this._dcaConstants.ACTION_4:
        case this._dcaConstants.ACTION_5:
        case this._dcaConstants.ACTION_6:
        case this._dcaConstants.ACTION_7:
        case this._dcaConstants.ACTION_8:
        case this._dcaConstants.ACTION_9:
            this._log.info('DCAWidget numeric key entered');
            this._handleNumericEvents(event);
            break;
        default :
            this._log.info('DCAWidget non-numeric key entered');
            this._handleNonNumericEvents(event);
            break;
    }
};

/**
 * @method addEventListener
 * Mediator registers for the events it wants to listen to
 * @param eventType
 * @param handler
 */

cisco.epg.widget.dcaWidget.DCAWidget.prototype.addEventListener = function (eventType, handler) {
    'use strict';
    this._log.info('DCAWidget.addEventListener() - Entered');

    if(typeof handler === 'function'){
        this._listeners[eventType] = handler;
    } else if(typeof handler === 'object' && typeof handler.handleEvent === 'function'){
        this._listeners[eventType] = handler.handleEvent.bind(handler);
    }else{
        this._log.info('DCAWidget.addEventListener() - handler should be either function ' +
            'or object which has handleEvent as a method');
    }

    this._log.info('DCAWidget.addEventListener() - Exited');
};

/**
 * @method removeEventListener
 * Mediator unregister for the events that it don't want to listen to
 * @param eventType
 */

cisco.epg.widget.dcaWidget.DCAWidget.prototype.removeEventListener = function (eventType) {
    'use strict';
    this._log.info('DCAWidget.removeEventListener() - Entered');
    delete(this._listeners[eventType]);
    this._log.info('DCAWidget.removeEventListener() - Exited');
};

/**
 * @method _resetTimer
 * To reset the timer based on the digit count
 * @private
 */

cisco.epg.widget.dcaWidget.DCAWidget.prototype._resetTimer = function () {
    'use strict';
    clearTimeout(this._timer);
    var duration = this._config.digitTimeOut;
    if (this._currentDigitCount === this._config.maxDigitCount) {
        this._log.iex('IEX Selection DCA_Number@#$' + this._dcaString);
        this._notify(this._dcaConstants.ACTION_DCA_UPDATED, this._dcaString, null);
        duration = this._config.lastDigitTimeOut;
    }
    this._timer = setTimeout(this._timerCallback.bind(this), duration);
};

/**
 * @method _notify
 * notify back to mediator listener passing it the state
 * @param eventType - constant which could be one of these values [ACTION_DCA_UPDATED, ACTION_DCA_DISMISSED]
 * @param dcaNum - String which holds the DCA number.
 * @param hideReason - It could be one of these constants [HIDE_ACTION_BACK, HIDE_ACTION_OK, HIDE_ACTION_TIMER
 *                          HIDE_ACTION_LEFT, HIDE_ACTION_EXPLICIT]
 * @private
 */

cisco.epg.widget.dcaWidget.DCAWidget.prototype._notify = function (eventType, dcaNum, hideReason) {
    'use strict';
    if (this._listeners[eventType]) {
        var context = {
            dcaNumber : dcaNum,
            type : eventType,
            hideTrigger : hideReason
        };

        this._log.info('DCAWidget._notify() DCA context :' + context);
        this._listeners[eventType](context);
    }
};

/**
 * @method _timerCallback
 * callBack for timer
 * @private
 */

cisco.epg.widget.dcaWidget.DCAWidget.prototype._timerCallback = function () {
    'use strict';
    if (this._currentDigitCount < this._config.maxDigitCount) {
        this._log.iex('IEX Selection DCA_Number@#$' + this._dcaString);
        this._notify(this._dcaConstants.ACTION_DCA_UPDATED, this._dcaString, null);
    }
    this.hide(this._dcaConstants.HIDE_ACTION_TIMER);
};

/**
 * @method _addDOMEventListener
 * add DOM events to be listened directly by the DCA Widget instead of getting them through mediator
 * @private
 */

cisco.epg.widget.dcaWidget.DCAWidget.prototype._addDOMEventListener = function () {
    'use strict';
    var dcaContainer = this._view.getDCAContainer(), key;
    var dcaEvents = this._config.dcaEvents;
    this._log.info('DCAWidget._addDOMEventListener() - Entered');
    if (dcaContainer) {
        this._callback = this.handleEvent.bind(this);
        for (key in dcaEvents) {
            if (dcaEvents.hasOwnProperty(key)) {
                dcaContainer.addEventListener(dcaEvents[key], this._callback);
            }
        }
    } else {
        this._log.error('Invalid DCA container Id');
    }
};

/**
 * @method _removeDOMEventListener
 * removes DOM events to be listened directly by the DCA Widget
 * @private
 */

cisco.epg.widget.dcaWidget.DCAWidget.prototype._removeDOMEventListener = function () {
    'use strict';
    var dcaContainer = this._view.getDCAContainer(), key;
    var dcaEvents = this._config.dcaEvents;
    this._log.info('DCAWidget._removeDOMEventListener() - Entered');
    if (dcaContainer) {
        for (key in dcaEvents) {
            if (dcaEvents.hasOwnProperty(key)) {
                dcaContainer.removeEventListener(dcaEvents[key], this._callback);
            }
        }
    } else {
        this._log.error('Invalid DCA container Id');
    }
};

/**
 * @method _handleNumericEvents
 * handle Numeric Key events
 * @method _handleNumericEvents
 * @param event
 * @private
 */

cisco.epg.widget.dcaWidget.DCAWidget.prototype._handleNumericEvents = function (event) {
    'use strict';
    var eventType = event.type;
    this._dcaString += this._config.KEY_STRING_MAP[eventType];
    this._view.setData(this._dcaString);
    this._currentDigitCount += 1;
    this._resetTimer();
};

/**
 * @method _handleNonNumericEvents
 * handles non numeric key events
 * @method _handleNonNumericEvents
 * @param event
 * @private
 */

cisco.epg.widget.dcaWidget.DCAWidget.prototype._handleNonNumericEvents = function (event) {
    'use strict';
    var eventType = event.type;
    this._log.info('DCAWidget._handleNonNumericEvents() - Entered');
    switch (eventType) {
        case this._dcaConstants.ACTION_OK:
            this._log.info('DCAWidget._handleNonNumericEvents() - Action OK Entered');
            this._log.iex('IEX Selection DCA_Number@#$' + this._dcaString);
            this._notify(this._dcaConstants.ACTION_DCA_UPDATED, this._dcaString, null);
            this.hide(this._dcaConstants.HIDE_ACTION_OK);
            break;
        case this._dcaConstants.ACTION_LEFT:
            this._log.info('DCAWidget._handleNonNumericEvents() - Action Left Entered');
            this._currentDigitCount -= 1;
            if (0 === this._currentDigitCount) {
                this.hide(this._dcaConstants.HIDE_ACTION_LEFT);
            }
            else {
                this._dcaString = this._dcaString.slice(0, -1);
                this._resetTimer();
                this._view.setData(this._dcaString);
            }
            break;
        case this._dcaConstants.ACTION_BACK:
            this._log.info('DCAWidget._handleNonNumericEvents() - Action Back Entered');
            this.hide(this._dcaConstants.HIDE_ACTION_BACK);
            break;
        default:
            this._log.info('event type received is ' + eventType + ', which is not handled by DCA');
            break;
    }
};
/**
 * @method dispose
 * to nullify all the objects created by DCAWidget
 */

cisco.epg.widget.dcaWidget.DCAWidget.prototype.dispose = function () {
    'use strict';
    this._log.info('DCAWidget.dispose() - Entered');
    this._config = null;
    this._view.dispose();
    this._view = null;
    this._listeners = null;
    this._isVisible = null;
    this._currentDigitCount = null;
    clearTimeout(this._timer);
    this._timer = null;
    this._log.info('DCAWidget.dispose() - Exited');
    this._log = null;

};

/**
 * CISCO CONFIDENTIAL
 * Copyright (c) 2013, Cisco Systems, Inc.
 * Author: NitinJ
 * DCA widget view class
 */

cisco.epg = cisco.epg || {};
cisco.epg.widget = cisco.epg.widget || {};
cisco.epg.widget.dcaWidget = cisco.epg.widget.dcaWidget || {};

/**
 * Class: DCAView
 * this class is to display the DCA on the screen
 * @param config - configuration values
 * @constructor
 */

cisco.epg.widget.dcaWidget.DCAView = function (config) {
    'use strict';

    /**
     * This is the Logger provided by by framework for logging
     * @type Object
     */

    this._log = cisco.neev.log.LogManager.getLogger('cisco.epg.widget');

    /* Checks if the configuration and the container to display the DCA is there */
    if (config && config.containerId) {
        this.screenContainer = document.getElementById(config.containerId);
        this._dcaContainer = document.createElement('div');
        this._dcaContainer.id = 'dcaContainer';
        this._dcaContainer.className = 'dcaContainer';
        this._dcaTextTag = document.createElement('p');
        this._dcaTextTag.className = 'dcaText';
        this._dcaContainer.appendChild(this._dcaTextTag);

        if (this.screenContainer) {
            this.screenContainer.appendChild(this._dcaContainer);
        }
    } else {
        this._log.error('Invalid DCA configurations');
    }
};

/**
 * @method show
 * To show the dca view and make it visible
 */

cisco.epg.widget.dcaWidget.DCAView.prototype.show = function () {
    'use strict';
    if (this._dcaContainer) {
        this._dcaContainer.style.visibility = 'visible';
    }
};

/**
 * @method hide
 * to hide the DCA view and make it invisible
 */

cisco.epg.widget.dcaWidget.DCAView.prototype.hide = function () {
    'use strict';
    if (this._dcaContainer) {
        this._dcaTextTag.innerText = "";
        this._dcaContainer.style.visibility = 'hidden';
    }
};

/**
 * @method focus
 * this is to make the DCA view in focus to accept the keys directly
 */

cisco.epg.widget.dcaWidget.DCAView.prototype.focus = function () {
    'use strict';
    if (this._dcaTextTag) {
        this._dcaTextTag.setAttribute('tabindex', 0);
        this._dcaTextTag.focus();
    }

};

/**
 * @method unfocus
 * this is to unfocus the DCA view
 */

cisco.epg.widget.dcaWidget.DCAView.prototype.unfocus = function () {
    'use strict';
    if (this._dcaTextTag) {
        this._dcaTextTag.removeAttribute('tabindex');
    }
};

/**
 * @method getDCAContainer
 * To return back the container back to widget , so that widget can attach eventListeners to it
 * @return {DOM Object}
 */

cisco.epg.widget.dcaWidget.DCAView.prototype.getDCAContainer = function () {
    'use strict';
    if (this._dcaTextTag) {
        return this._dcaTextTag;
    }
};

/**
 * @method setData
 * To update the DCA view with the data passed in the parameter
 * @param dcaDigit
 */

cisco.epg.widget.dcaWidget.DCAView.prototype.setData = function (dcaDigit) {
    'use strict';
    if (this._dcaTextTag) {
        this._dcaTextTag.innerText = dcaDigit;
    }
};

/**
 * @method dispose
 * Will delete the para tag created by this view and make the DCA objects to null
 */

cisco.epg.widget.dcaWidget.DCAView.prototype.dispose = function () {
    'use strict';
    if (document.getElementById('dcaContainer') && this.screenContainer) {
        this.screenContainer.removeChild(this._dcaContainer);
    }
    this._log = null;
    this.screenContainer = null;
    this._dcaContainer = null;
    this._dcaTextTag = null;
};