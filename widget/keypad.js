// CISCO CONFIDENTIAL
// Copyright (c) 2013, Cisco Systems, Inc.

cisco.declare("cisco.epg.widget.keypad");

cisco.epg.widget.keypad.config = {
    "view":{
        "class":"cisco.epg.widget.keypad.KeypadView",
        "config":{
            "container"             : "KeypadContainer",
            "ring"                  : "KeypadRing",
            "itemDisabledClass"     : "KeypadItemDisabled",
            "itemClass"             : "KeypadItem",
            "padding"               : "30",
            "itemFocusClass"        : "KeypadItemFocused",
	        "deleteKey"             : "<"
        }
    },
    "actions":{
        "NEXT":"ACTION_RIGHT",
        "PREVIOUS":"ACTION_LEFT",
        "SELECT":"ACTION_OK",
	    "ACTION_0":"KEY_0",
	    "ACTION_1":"KEY_1",
	    "ACTION_2":"KEY_2",
	    "ACTION_3":"KEY_3",
	    "ACTION_4":"KEY_4",
	    "ACTION_5":"KEY_5",
	    "ACTION_6":"KEY_6",
	    "ACTION_7":"KEY_7",
	    "ACTION_8":"KEY_8",
	    "ACTION_9":"KEY_9"
    }
};

// CISCO CONFIDENTIAL
// Copyright (c) 2013, Cisco Systems, Inc.

cisco.declare("cisco.epg.widget.keypad.config");

cisco.epg.widget.keypad.config.Keys = [
        "A", "B", "C", "D", "E", "F", "G", "H", "I", "J",
        "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U",
        "V","W", "X", "Y", "Z", "0", "1", "2", "3", "4", "5",
        "6", "7", "8", "9","_"
    ];

cisco.epg.widget.keypad.config.defaultHighlightKey ="A";

cisco.epg.widget.keypad.config.numericKeys = {
	KEY_0  : "0",
	KEY_1  : "1",
	KEY_2  : "2",
	KEY_3  : "3",
	KEY_4  : "4",
	KEY_5  : "5",
	KEY_6  : "6",
	KEY_7  : "7",
	KEY_8  : "8",
	KEY_9  : "9"
};

// CISCO CONFIDENTIAL
// Copyright (c) 2013, Cisco Systems, Inc.

cisco.declare("cisco.epg.widget.keypad");
/**
 * Handles keypad widget implementation's controller.
 *
 * @class KeypadWidget
 * @param {Object} config A config object
 * @constructor
 */
cisco.epg.widget.keypad.KeypadWidget = function(config){
	"use strict";
	var keyConfig, listeners, dataArray, highlightIndex, view, deleteKey, actions, util;

	keyConfig = cisco.epg.widget.keypad.config;
	deleteKey = config.view.config.deleteKey;
	util      = cisco.epg.widget.common.util;
	listeners = {};
	dataArray = {
		"keys"            : [deleteKey].concat(keyConfig.Keys),
		"recommendedKeys" : util.clone(keyConfig.Keys)
	};
	highlightIndex = dataArray.recommendedKeys.indexOf(keyConfig.defaultHighlightKey);
	view = new (eval(config.view.class))(config.view.config);

    /**
     * Notifies event to the corresponding handler Event.
     *
     * @method notify
     * @private
     * @param {Object} event An event object
     */
    var notify = function(event){
	    "use strict";
        if (listeners[event.type]) {
            listeners[event.type].handleEvent(event);
        }
    };

	/**
	 * Returns the two arrays difference list.
	 *
	 * @method subtract
	 * @private
	 * @param {Array} from Left array
	 * @param {Array} to Right array
	 * @return {Array} The substracted array
	 */
	var subtract = function(from, to){
		"use strict";
		var change;

		change = [];
		for (var i = 0; i < from.length; i++) {
			if (to.indexOf(from[i]) == -1) {
				change.push(from[i]);
			}
		}
		return change;
	};

	/**
	 * Returns new suggestions and old suggestions list difference.
	 *
	 * @method filterList
	 * @private
	 * @param {Array} keys Suggestion keys
	 * @return {Array} Filtered keys
	 */
	var filterList = function(keys){
		"use strict";
		var result;

		result = subtract(dataArray.recommendedKeys, keys);
		return result.concat(subtract(keys, dataArray.recommendedKeys));
	};

    /**
     * Updates UI with the new suggestions letters.
     *
     * @method setData
     * @public
     * @final
     * @param {Object} data Suggestion keys
     */
    this.setData = function(data){
	    "use strict";
	    var change, newSuggestions, oldSuggestions;

	    newSuggestions = data.project;
	    oldSuggestions = dataArray.recommendedKeys;

	    if (newSuggestions.indexOf(deleteKey) == -1) {
		    newSuggestions.unshift(deleteKey);
	    }
        change = {
            "keys":filterList(newSuggestions)
        };

	    if (change.keys.length > 0) {
			if (oldSuggestions[highlightIndex] === deleteKey) {
				highlightIndex = 0;
			} else {
				highlightIndex = newSuggestions.length > 1 ? 1 : 0;
			}
	    }
        change.focusKey = newSuggestions[highlightIndex];
        dataArray.recommendedKeys = newSuggestions;
        view.update(change);
    };

	/**
     * Creates the default keypad list and display the keypad.
	 *
	 * @method show
	 * @public
	 * @final
     */
    this.show = function(){
	    "use strict";
	    view.initialize(dataArray.recommendedKeys,
		    dataArray.recommendedKeys[highlightIndex]);
        view.show();
        notify({
            type:cisco.epg.widget.keypad.SHOWN,
            context:null
        });
    };

    /**
     * Sends notification when user press any key.
     *
     * @method select
     * @private
     * @final
     */
    this.select = function(){
	    "use strict";
        notify({
            type:cisco.epg.widget.keypad.SELECTION_CHANGE,
            context:dataArray.recommendedKeys[highlightIndex]
        });
    };

    /**
     * Sets the focus to the next suggestion char.
     *
     * @method next
     * @private
     * @final
     */
    this.next = function(){
	    "use strict";
	    var prevHighlightChar;

        prevHighlightChar = dataArray.recommendedKeys[highlightIndex];
        if (highlightIndex + 1 < dataArray.recommendedKeys.length) {
            highlightIndex+= 1;
        } else {
	        highlightIndex = 0;
        }
        view.next(prevHighlightChar, dataArray.recommendedKeys[highlightIndex]);

    };

    /**
     * Sets the focus to the previous suggestion char.
     *
     * @method previous
     * @private
     * @final
     */
    this.previous = function(){
	    "use strict";
	    var prevHighlightChar;

        prevHighlightChar = dataArray.recommendedKeys[highlightIndex];
        if (highlightIndex > 0) {
            highlightIndex-= 1;
        } else {
	        highlightIndex = dataArray.recommendedKeys.length - 1;
        }
        view.previous(prevHighlightChar, dataArray.recommendedKeys[highlightIndex]);
    };

    /**
     * Hides the keypad and send hide notification to the handler.
     *
     * @method hide
     * @public
     * @final
     */
    this.hide = function(){
	    "use strict";
        view.hide();
        notify({
            type:cisco.epg.widget.keypad.HIDE,
            context:null
        });
    };

    /**
     * Clears all the created objects and variables.
     *
     * @method dispose
     * @public
     * @final
     */
    this.dispose = function(){
	    "use strict";
        view.dispose();
        view = null;
        dataArray = null;
        listeners = null;
    };

    /**
     * Resets the focus char to default char.
     *
     * @method reset
     * @public
     * @final
     */
    this.reset = function(){
	    "use strict";
        view.setFocusItem(dataArray.recommendedKeys[highlightIndex], keyConfig.defaultHighlightKey);
	    view.setKeysEnabled([deleteKey], false);
	    dataArray.recommendedKeys = util.clone(keyConfig.Keys);
        highlightIndex = dataArray.recommendedKeys.indexOf(keyConfig.defaultHighlightKey);
    };

	/**
	 * Enables/Disables delete key.
	 *
	 * @method setDeleteKeyEnabled
	 * @public
	 * @final
	 * @param {Boolean} enable True if delete key needs to be enabled
	 */
	this.setDeleteKeyEnabled = function(enable){
		"use strict";
		if (enable) {
			dataArray.recommendedKeys.unshift(deleteKey);
			highlightIndex+= 1;
		} else {
			dataArray.recommendedKeys.shift();
			if (highlightIndex > 0) {
				highlightIndex-= 1;
			}
		}
		view.setKeysEnabled([deleteKey], true);
	};

	/**
	 * Handles the RCU Numeric key Actions.
	 *
	 * @method handleNumericKey
	 * @private
	 * @final
	 * @param {Object} event An event object
	 */
	this.handleNumericKey = function(event){
		"use strict";
		var key , keyIndex ;

		key = keyConfig.numericKeys[event.type];
		keyIndex = dataArray.recommendedKeys.indexOf(key);
		if(keyIndex > 0 ){
			highlightIndex = keyIndex;
			notify({
				type:cisco.epg.widget.keypad.SELECTION_CHANGE,
				context:dataArray.recommendedKeys[highlightIndex]
			});
		}

	};

    /**
     * Adds Listener to the keypad Widget.
     *
     * @method addEventListener
     * @public
     * @final
     * @param {String} eventType Event type
     * @param {Object} handler Handler object
     */
    this.addEventListener = function(eventType, handler){
	    "use strict";
        listeners[eventType] = handler;
    };

    /**
     * Removes Listener from the keypad Widget.
     *
     * @method removeEventListener
     * @public
     * @final
     * @param {String} eventType Event type
     */
    this.removeEventListener = function(eventType){
	    "use strict";
        delete listeners[eventType];
    };


    actions = [];
    actions[config.actions.NEXT] = this.next;
    actions[config.actions.PREVIOUS] = this.previous;
    actions[config.actions.SELECT] = this.select;
	actions[config.actions.ACTION_0] = this.handleNumericKey;
	actions[config.actions.ACTION_1] = this.handleNumericKey;
	actions[config.actions.ACTION_2] = this.handleNumericKey;
	actions[config.actions.ACTION_3] = this.handleNumericKey;
	actions[config.actions.ACTION_4] = this.handleNumericKey;
	actions[config.actions.ACTION_5] = this.handleNumericKey;
	actions[config.actions.ACTION_6] = this.handleNumericKey;
	actions[config.actions.ACTION_7] = this.handleNumericKey;
	actions[config.actions.ACTION_8] = this.handleNumericKey;
	actions[config.actions.ACTION_9] = this.handleNumericKey;

    /**
     * Handles the keypad Actions.
     *
     * @method handleEvent
     * @public
     * @final
     * @param {Object} event An event object
     */
    this.handleEvent = function(event){
	    "use strict";
        if (actions[event.type]) {
            actions[event.type](event);
	    }
    };

    /**
     * Focuses keypad Widget.
     *
     * @method focus
     * @public
     * @final
     */
    this.focus = function(){
	    "use strict";
        view.focus();
    };

    /**
     * Unfocuses keypad Widget.
     *
     * @method unFocus
     * @public
     * @final
     */
    this.unFocus = function(){
	    "use strict";
        view.unFocus();
    };
};

cisco.epg.widget.keypad.SHOWN = "KEYPAD_SHOWN";
cisco.epg.widget.keypad.HIDE = "KEYPAD_HIDE";
cisco.epg.widget.keypad.SELECTION_CHANGE = "KEYPAD_SELECTION_CHANGE";

// CISCO CONFIDENTIAL
// Copyright (c) 2013, Cisco Systems, Inc.

cisco.declare("cisco.epg.widget.keypad");
/**
 * Handles keypad widget's presentation.
 *
 * @class KeypadView
 * @param {Object} config A config object
 * @constructor
 */
cisco.epg.widget.keypad.KeypadView = function(config){
	"use strict";
    var newOffset, centerXPos, padding, containerElement;

	/**
	 * Creates the html element based on the elementName.
	 *
	 * @method createElement
	 * @private
	 * @param {String} elementName DOM element's tag name
	 * @param {String} id DOM element's id
	 * @returns {*} DOM element
	 */
	var createElement = function(elementName, id){
		"use strict";
		var element;

		element = document.createElement(elementName);
		if (id) {
			element.id = id;
		}
		return element;
	};

	/**
	 * Creates all keypad elements.
	 *
	 * @method createKeypadElements
	 * @private
	 * @param {Array} keypadKeys The user supplied keys for the keypad widget
	 */
	var createKeypadElements = function(keypadKeys){
		"use strict";
		var fragment, ulElem, liElem, deleteElem, i;

		ulElem = createElement('ul', config.ring);
		ulElem.classList.add(config.ring);
		containerElement.appendChild(ulElem);

		deleteElem = createElement('img', config.deleteKey);
		deleteElem.classList.toggle(config.itemDisabledClass);
		ulElem.appendChild(deleteElem);

		fragment = document.createDocumentFragment();
		for (i = 0; i < keypadKeys.length; i++) {
			liElem = createElement('li', keypadKeys[i]);
			liElem.innerText = keypadKeys[i];
			liElem.classList.add(config.itemClass);
			fragment.appendChild(liElem);
		}
		ulElem.appendChild(fragment);
	};

	/**
	 * Initializes the keypad widget.
	 *
	 * @method initialize
	 * @public
	 * @final
	 * @param {Array} keypadKeys The user supplied keys for the keypad widget
	 * @param {Array} focusKey The key to be in focus
	 */
    this.initialize = function(keypadKeys, focusKey){
	    "use strict";
		var listItems, menuItemsSize, mRwidth, newPos, index, focusKeyElem;

	    containerElement = document.getElementById(config.container);
	    containerElement.className = config.container;

	    createKeypadElements(keypadKeys);

        centerXPos = window.innerWidth / 2;
        padding = config.padding;
        listItems = document.getElementById(config.ring).children;
	    menuItemsSize = listItems.length;
        mRwidth = 0;
        for (index = 0; index < menuItemsSize; index=index+1) {
            mRwidth += (listItems[index].offsetWidth);
        }
        containerElement.style.width = mRwidth + 200 + "px";

	    focusKeyElem = document.getElementById(focusKey);
	    focusKeyElem.classList.add(config.itemFocusClass);

        newPos = centerXPos - (focusKeyElem.offsetLeft + ((focusKeyElem.offsetWidth - padding) / 2));
        containerElement.style.left = newPos + "px";
    };

	/**
	 * Shows the keypad.
	 *
	 * @method show
	 * @public
	 * @final
	 */
    this.show = function(){
	    "use strict";
        if (document.getElementById(config.ring).children.length >= 1) {
            this.focus();
        }
    };

	/**
	 * Hides the keypad.
	 *
	 * @method hide
	 * @public
	 * @final
	 */
    this.hide = function(){
	    "use strict";
        if (document.getElementById(config.ring).children.length >= 1) {
            this.unFocus();
        }
    };

	/**
	 * Update the keypad with the suggested chars.
	 *
	 * @method update
	 * @public
	 * @final
	 * @param {Object} data Data object contains the keypad keys & default focus key
	 */
    this.update = function(data){
	    "use strict";
	    var keys, focusKey, i, elementCenter, focusKeyElem;

        keys = [];
        if (data.keys) {
            keys = data.keys;
        }
        focusKey = data.focusKey;
	    for (i = 0; i < keys.length; i=i+1) {
		    document.getElementById(keys[i]).classList.toggle(config.itemDisabledClass);
        }
        document.getElementsByClassName(config.itemFocusClass)[0].classList.toggle(config.itemFocusClass);

	    focusKeyElem = document.getElementById(focusKey);
	    focusKeyElem.classList.toggle(config.itemFocusClass);
        elementCenter = focusKeyElem.offsetLeft + ((focusKeyElem.offsetWidth - padding) / 2);
        newOffset = (centerXPos) - elementCenter;
        containerElement.style.left = newOffset + "px";
    };

	/**
	 * Transfers the focus.
	 *
	 * @method setFocusItem
	 * @public
	 * @final
	 * @param {String} previousHighlightChar Previous key in focus
	 * @param {String} currentHighlightChar Key to be in focus
	 */
    this.setFocusItem = function( previousHighlightChar , currentHighlightChar){
	    "use strict";
        this.next(previousHighlightChar , currentHighlightChar);
    };

	/**
	 * Sets the keys enabled or disabled based on the boolean value.
	 *
	 * @method setKeysEnabled
	 * @public
	 * @final
	 * @param {Array} keys Keys to be enabled or disabled
	 * @param {Boolean} enable
	 */
	this.setKeysEnabled = function(keys, enable){
		"use strict";
		var i, element;

		for (i = 0; i < keys.length; i=i+1) {
			element = document.getElementById(keys[i]);
			if (enable) {
				element.classList.remove(config.itemDisabledClass);
			} else {
				element.classList.add(config.itemDisabledClass);
			}
		}
	};

	/**
	 * Focuses the next char.
	 *
	 * @method next
	 * @public
	 * @final
	 * @param {String} prevHighlightChar Previous key in focus
	 * @param {String} highlightChar Key to be in focus
	 */
    this.next = function(prevHighlightChar, highlightChar){
	    "use strict";
	    var elementCenter, prevHighlightElem, highlightElem;

	    if (prevHighlightChar !== highlightChar) {
		    prevHighlightElem = document.getElementById(prevHighlightChar);
		    highlightElem     = document.getElementById(highlightChar);

		    prevHighlightElem.classList.toggle(config.itemFocusClass);
		    highlightElem.classList.toggle(config.itemFocusClass);

		    elementCenter = highlightElem.offsetLeft + ((highlightElem.offsetWidth - padding) / 2);
		    newOffset = (centerXPos) - elementCenter;
		    containerElement.style.left = newOffset + "px";
	    }
    };

	/**
	 * Disposes the keypad root element.
	 *
	 * @method dispose
	 * @public
	 * @final
	 */
    this.dispose = function(){
	    "use strict";
	    containerElement.parentNode.removeChild(containerElement);
        containerElement = undefined;
    };

	/**
	 * Focuses the previous char.
	 *
	 * @method previous
	 * @public
	 * @final
	 * @param {String} prevHighlightChar Previous key in focus
	 * @param {String} highlightChar Key to be in focus
	 */
    this.previous = function(prevHighlightChar, highlightChar){
	    "use strict";
	    var elementCenter, prevHighlightElem, highlightElem;

	    if (prevHighlightChar !== highlightChar) {
		    prevHighlightElem = document.getElementById(prevHighlightChar);
		    highlightElem     = document.getElementById(highlightChar);

		    prevHighlightElem.classList.toggle(config.itemFocusClass);
		    highlightElem.classList.toggle(config.itemFocusClass);

		    elementCenter = highlightElem.offsetLeft + ((highlightElem.offsetWidth - padding) / 2);
		    newOffset = (centerXPos) - elementCenter;
		    containerElement.style.left = newOffset + "px";
	    }
    };

    /**
     * Focuses the keypad Widget.
     *
     * @method focus
     * @public
     * @final
     */
    this.focus = function(){
	    "use strict";
	    containerElement.classList.remove("KeypadHide") ;
	    containerElement.classList.add("KeypadShow") ;
    };

    /**
     * Unfocus the keypad Widget.
     *
     * @method unFocus
     * @public
     * @final
     */
    this.unFocus = function(){
	    "use strict";
	    containerElement.classList.remove("KeypadShow") ;
	    containerElement.classList.add("KeypadHide") ;
    };
};