cisco.extend(window.cisco,{"epg":{"widget":{"pinconfig":{"widget":{"Class":"cisco.epg.widget.pin.PinWidgetCtrl","Config":{"length":4,"userMsg":"PIN_USER_MSG","successMsg":"PIN_SUCC_MSG","failureMsg":"PIN_FAIL_MSG","defaultPin":"0000","pwEntryChar":"*","pwDisplayChar":""}},"keyMap":{"ACTION_LEFT":"37","ACTION_UP":"38","ACTION_RIGHT":"39","ACTION_DOWN":"40","ACTION_OK":"13","ACTION_BACK":"8","ACTION_0":"48","ACTION_1":"49","ACTION_2":"50","ACTION_3":"51","ACTION_4":"52","ACTION_5":"53","ACTION_6":"54","ACTION_7":"55","ACTION_8":"56","ACTION_9":"57"},"view":{"Class":"cisco.epg.widget.pin.PinWidgetView","Config":{"actions":["ACTION_0","ACTION_1","ACTION_2","ACTION_3","ACTION_4","ACTION_5","ACTION_6","ACTION_7","ACTION_8","ACTION_9","ACTION_LEFT"]}},"presentation":{"Class":"cisco.epg.widget.pin.PinPresentation","Config":{"imageUrl":"src/resources/images/YellowLine.png","container":"parentalpin","bgContainer":"pinBg","infoContainer":"pinInfo","titleContainer":"pinTitle","userMsgContainer":"pinUserMsg","pinContainer":"pinEntry","statusContainer":"pinStatus","titleLabel":"PIN_VALUE","time":"10:10","profName":"JANE"}}}}}});
// CISCO CONFIDENTIAL
// Copyright (c) 2013, Cisco Systems, Inc.

/*
  *@PinWidgetCtrl - Class for Pin widget controller
  */

cisco.epg = cisco.epg || {};
cisco.epg.widget = cisco.epg.widget || {};
cisco.epg.widget.pin = cisco.epg.widget.pin || {};
cisco.epg.widget.pin.PinWidgetCtrl = function ( config ) {
	var pinIndex = null,
		pinStr = null,
		noOfChars = null,
		sucessMsg = null,
		failureMsg = null,
		userMsg = null,
		widgetConfig = null,
		viewobj = null,
		content = null,
		pinEntry = [],
		index,
		keyMap = config.keyMap,
		domEvents,
		pinContainer;

	/**
         * Shows error message and need to confirm whether we need it or not
         * @method  showError
         */

    var	 showError = function(){
		content.status = failureMsg;
		viewobj.showStatusMsg(failureMsg);
    };

/**
     * after pin is entered, this one will validate the pin
     * @method  confirm
     */
    var confirm =function () {
		var validateObject = {};

		if(pinIndex === noOfChars)
		{
				pinEntry = content.pinEntry;

				validateObject.newPinSuccessCb = function() {

		            content.status = sucessMsg;
					viewobj.showStatusMsg(sucessMsg);
					viewobj.clearPIN( true );
					content.pinEntry = [];
		        }.bind(this);

		        validateObject.newPinFailureCb = function() {
		            // Error
					viewobj.clearPIN( false );
		            content.pinEntry = [];
		            for(var index = 0; index<noOfChars; index++)
		            {
						content.pinEntry.push ( {item: widgetConfig.pwDisplayChar});
						viewobj.updatePIN( content.pinEntry[index].item, index );
		            }
		            showError();
		        }.bind(this);

				validateObject.pinStr = pinStr;

		        //Common for both success & failure path
		        pinIndex = 0;
				pinStr = "";
				return	validateObject;
			}else{
				if(pinStr.length > 0)
				{
					showError();
				}
				return	validateObject;
			}
    };

	/* Subscribe to DOM events */

 	this.subscribeToDOMEvents = function ( containerTag, events ){
		domEvents	= events;
		pinContainer = containerTag;
		for ( index = 0; index < events.length; index++ )
		{
			cisco.listen('#'+containerTag,events[index], this.handleEvent);
		}
	};

	/* UnSubscribe to DOM events */
	
 	this.unSubscribeToDOMEvents = function ( ){
		for ( index = 0; index < domEvents.length; index++ )
		{
			cisco.unlisten('#'+pinContainer,domEvents[index], this.handleEvent);
		}
	};
	

	/**
	 * initialize to load the pin widget data
	 */

	widgetConfig = config.widget.Config;
	pinIndex = 0;
	noOfChars = widgetConfig.length;
	sucessMsg = widgetConfig.successMsg;
	failureMsg = widgetConfig.failureMsg;
	userMsg = widgetConfig.userMsg;
	pinStr = "";
	content = {pinEntry: pinEntry, userMsg : userMsg, status: "" };

	for( index = 0; index<noOfChars; index++)
	{
		content.pinEntry.push ({item: widgetConfig.pwDisplayChar });
	}

	viewobj	= new cisco.epg.widget.pin.PinWidgetView( content,  config.presentation );


	/**
	* To enable the display of the PIN widget container
	* @method  show
	*/

	this.show = function ( ){
		this.subscribeToDOMEvents( config.presentation.Config.container, config.view.Config.actions );
		viewobj.show();

	};

	/**
	* To disable the display of the PIN widget container
	* @method  hide
	*/

	this.hide = function ( ){
		viewobj.hide();
	};

	/**
	* To clear the display of the PIN widget container
	* @method  dispose
	*/

	this.dispose = function ( ){
		this.unSubscribeToDOMEvents();
		viewobj.dispose();
	};

	/**
	* To reduce the complexity of the switch case for numeric key handling
	* @params - actionType - action that fired from the event manager
	*/
	var isNumericAction = function( actionType )
	{
		var numericKeys = {
			"ACTION_0": "0",
			"ACTION_1": "1",
			"ACTION_2": "2",
			"ACTION_3": "3",
			"ACTION_4": "4",
			"ACTION_5": "5",
			"ACTION_6": "6",
			"ACTION_7": "7",
			"ACTION_8": "8",
			"ACTION_9": "9"
		};

		if (numericKeys[actionType]){
			return	'ACTION_NUMERIC';
		}
		else{
			return	actionType;
		}
	};

	/**
         * handles the key events 0~9 numeric and left
         * @method  handleEvent
         * @param p_event {object} event triggered
         */
	this.handleEvent = function( event) {
		var eventType = isNumericAction( event.type );

		switch( eventType ){

			case 'ACTION_NUMERIC':
			{
				if ( content.pinEntry.length > 0 &&
						pinIndex < noOfChars )
				{
					content.pinEntry[pinIndex].item = widgetConfig.pwEntryChar;
					viewobj.updatePIN( content.pinEntry[pinIndex].item, pinIndex );
		            pinIndex = pinIndex + 1;
					/* Need to check and modify  */
		            pinStr += ( keyMap[event.type] - keyMap['ACTION_0']);
				}

			}
			break;

			case 'ACTION_LEFT':
			{
				if( content.pinEntry.length > 0 &&
					 pinIndex > 0 )
				{
					pinIndex = pinIndex - 1;
					content.pinEntry[pinIndex].item = widgetConfig.pwDisplayChar;
					viewobj.updatePIN( content.pinEntry[pinIndex].item, pinIndex );
					pinStr = pinStr.slice(0, pinStr.length - 1);
				}
			}
			break;

			case 'ACTION_OK':
			{
				return	confirm();
			}
			break;

			default:
			{
				/* Invalid case */
				return	undefined;
			}
		}
	};
};


// CISCO CONFIDENTIAL
// Copyright (c) 2013, Cisco Systems, Inc.

/**
 * @class cisco.epg.widget.PinWidgetView.js
 * View for PIN Widget
 */

cisco.epg.widget.pin.PinWidgetView = function ( ctrlContent, presentation ) {
	var presentationObj;

	presentationObj = new cisco.epg.widget.pin.PinPresentation( ctrlContent, presentation.Config);

	/**
	* Triggers the presentation object to display the widget container
	*/
    this.show = function ( ) {
    	if ( presentationObj )
    	{
	        presentationObj.show();
    	}
    };

	/**
	* Triggers the presentation object to hide the widget container
	*/
    this.hide = function ( ) {
    	if ( presentationObj )
    	{
	        presentationObj.hide();
    	}
    };

	/**
	* Triggers the presentation object to remove the widget container
	*/

    this.dispose = function ( ) {
    	if ( presentationObj )
    	{
	        presentationObj.dispose();
    	}
    };


	/**
	* Triggers the presentation object to show the status message
	* @params - statusMessage - Message to be shown
	*/

    this.showStatusMsg = function ( statusMessage ) {
    	if ( presentationObj )
    	{
    		presentationObj.showStatusMsg( statusMessage );
    	}
    };

	/**
	* Triggers the presentation object to insert or remove the PIN entry
	* @params - pinChar - to update the presentation
	* @params - pinIndex - index of the pin
	*/
    this.updatePIN = function ( pinChar, pinIndex ) {
    	if ( presentationObj )
    	{
	        presentationObj.updatePIN( pinChar, pinIndex);
    	}
    };

	/**
	* Triggers the presentation object to clear the PIN entries display
	* @params -  sucessOrFail - to determine to clear the pin entries and to allow the user to enter again
	*/

	this.clearPIN = function ( sucessOrFail ) {
    	if ( presentationObj )
    	{
	        presentationObj.clearPIN( sucessOrFail );
    	}
    };

};

// CISCO CONFIDENTIAL
// Copyright (c) 2013, Cisco Systems, Inc.

/**
 * @class PinPresentation
 */

cisco.epg.widget.pin.PinPresentation = function ( ctrlContent, config, animation ) {

    var centerXPos, centerYPos,presConfig, fragment,
			stringMap = cisco.snowflake.strings;

	/**
	* Aligns the div elements based on the screen
	*/

	var alignElements = function() {
		var	statusDiv	  	= document.querySelector('.' + presConfig.statusContainer + "_div");
	    var	backgroundDiv 	= document.querySelector('.' + presConfig.bgContainer + "_div");
		var	pinEntryDiv	= document.querySelector('.' + presConfig.pinContainer + "_div");
		var	userMsgDiv	= document.querySelector('.' + presConfig.userMsgContainer + "_div");
		var container = document.getElementById(presConfig.container);


        backgroundDiv.style.top = centerYPos + "px";
		pinEntryDiv.style.top = centerYPos - ( pinEntryDiv.offsetHeight / 2 )+ "px";
		pinEntryDiv.style.width = (( pinEntryDiv.children.length -1 + 4 ) * pinEntryDiv.children[0].offsetWidth ) +
									pinEntryDiv.children[Math.floor(pinEntryDiv.children.length/2)].offsetWidth + "px";
		pinEntryDiv.style.left = centerXPos - ( pinEntryDiv.offsetWidth / 2 ) + "px";
		pinEntryDiv.children[0].style.paddingLeft = pinEntryDiv.children[0].offsetWidth * 2 + "px";
		userMsgDiv.style.top = pinEntryDiv.offsetTop - userMsgDiv.offsetHeight - 10 + "px";
		statusDiv.style.top = centerYPos + pinEntryDiv.offsetHeight*2 + "px";

        container.tabIndex = -1;
        container.focus();
	};

	/**
	* Insert the PIN enries to the pin container
	* @params - pinDiv - reference to the container
	* @params - pinLength - length of the pin entries
	*/


	var insertPINEntries = function( pinDiv, pinLength ) {
       var itemDiv;
        for ( var index = 0; index <= pinLength; index++) {
			itemDiv = document.createElement('div');
			if ( index === Math.floor( pinLength / 2 ) )
			{
	            itemDiv.className = presConfig.pinContainer + "Cursor_div";
				itemDiv.innerText = "I";
			}
			else
			{
	            itemDiv.className = presConfig.pinContainer + "Item_div";
				itemDiv.innerText = " ";
			}

			itemDiv.tabIndex = "0";
            pinDiv.appendChild(itemDiv);
        }
	};

	/**
	* Shows the PIN screen contents

	* @params - displayContent - contents of the pin widget controller
	* @params - config - configuration of the parental pin presentation
	* @params - animation - instance of the animatiion class
	*/

    var insertDOMElements = function ( displayContent ) {
        var infoDiv = document.createElement('div');
		var pinEntryDiv = document.createElement('div');
		var titleDiv = document.createElement('div');
		var backgroundDiv = document.createElement('div');
		var	statusDiv = document.createElement('div');
		var	userMsgDiv = document.createElement('div');
		var container = document.getElementById(presConfig.container);

		container.style.visibilty  = "hidden";
		fragment = document.createDocumentFragment();

		if ( !fragment || !pinEntryDiv || !backgroundDiv || !statusDiv )
		{
			return;
		}

		backgroundDiv.id = presConfig.bgContainer + "_div";
		backgroundDiv.className = presConfig.bgContainer + "_div";
        fragment.appendChild(backgroundDiv);

		userMsgDiv.id  = presConfig.userMsgContainer + "_div";
		userMsgDiv.className = presConfig.userMsgContainer + "_div";
		userMsgDiv.innerText = stringMap[displayContent.userMsg];
        fragment.appendChild(userMsgDiv);

		statusDiv.id  = presConfig.statusContainer + "_div";
		statusDiv.className = presConfig.statusContainer + "_div";
		statusDiv.innerText = stringMap[ctrlContent.status] ? stringMap[ctrlContent.status] : "";
        fragment.appendChild(statusDiv);

	    pinEntryDiv.id = presConfig.pinContainer + "_div";
        pinEntryDiv.className = presConfig.pinContainer + "_div";
        fragment.appendChild(pinEntryDiv);
		insertPINEntries( pinEntryDiv, displayContent.pinEntry.length );

        container.appendChild(fragment);
		alignElements();
     };

   	presConfig = config;
	centerXPos = window.innerWidth / 2;
	centerYPos = window.innerHeight / 2;

	insertDOMElements( ctrlContent );

	/**
	* Enables the widget container to display the pin entries
	*/
	this.show = function( ) {
		var container = document.getElementById("parentalpin");

		container.style.visibility = "visible";
	};

	/**
	* Disables the widget container to hide the pin entries
	*/
	this.hide = function( ) {
		var container = document.getElementById("parentalpin");

		container.style.visibility = "hidden";
	};

	/**
	* Removes the contents of the widget container
	*/
	this.dispose = function( ) {
		var container = document.getElementById("parentalpin");

		container.innerText = "";
	};

	/**
	* Shows the status message of controller to user

	* @params - statusMessage - content of the message to be shown
	*/
     this.showStatusMsg = function ( statusMessage ) {
		var	statusDiv	= document.querySelector('.' + presConfig.statusContainer + "_div");

		statusDiv.innerText = stringMap[statusMessage] ? stringMap[statusMessage] : "";
    };


	/*
	* Updates the PIN entries on the screen
	* @params - pinChar - to update the presentation
	* @params - pinIndex - index of the pin
	*/
    this.updatePIN = function ( pinChar, pinIndex) {
		var	pinDiv	= document.querySelector('.' + presConfig.pinContainer + "_div");

		if ( pinIndex >=0 && pinIndex <= pinDiv.children.length )
		{
			if ( pinIndex < Math.floor( pinDiv.children.length /2 ) )
			{
				pinDiv.children[pinIndex].innerText = pinChar;
			}
			else
			{
				pinDiv.children[pinIndex+1].innerText = pinChar;
			}

		}
    };

	/*
	* Clear the PIN entries on the screen
	* @params -  sucessOrFail - to determine to clear the pin entries and to allow the user to enter again
	*/
    this.clearPIN = function ( sucessOrFail ) {
		var	pinDiv	= document.querySelector('.' + presConfig.pinContainer + "_div");

		if ( sucessOrFail === true )
		{
			pinDiv.children[Math.floor( pinDiv.children.length /2 )].innerText = "";
		}
		else
		{
	        for ( var index = 0; index < pinDiv.children.length; index++ ) {
				if ( Math.floor( pinDiv.children.length /2 ) !== index )
				{
					pinDiv.children[index].innerText = "";
				}
       		}
		}

	};

};
