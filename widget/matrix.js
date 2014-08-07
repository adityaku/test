cisco.extend(window.cisco,{"epg":{"widget":{"matrix":{"MatrixWidgetConstants":{"SHOWN":"SHOWN","FOCUS_GAINED":"FOCUS_GAINED","FOCUS_LOST":"FOCUS_LOST","SELECTION_CHANGE":"SELECTION_CHANGE","AT_END":"AT_END","AT_BEGIN":"AT_BEGIN","ITEM_ADDED":"ITEM_ADDED","ITEM_REMOVED":"ITEM_REMOVED","ITEM_UPDATED":"ITEM_UPDATED","REMOVED_ALL":"REMOVED_ALL","DEFAULT_MARGIN":10}}}}});
/**
 * CISCO CONFIDENTIAL
 * Copyright (c) 2013, Cisco Systems, Inc.
 * @author Saurabh Biswas
 * MatrixView creates the view for matrix  widget for both focusable and nofocusable setting.
 * @module widget
 * @submodule matrix
 * @namespace cisco.epg.widget.matrix
 * @class MatrixView
 * @param {Object} configuration matrix widget configuration json
 */

cisco.declare("cisco.epg.widget.matrix");
cisco.epg.widget.matrix.MatrixView = function (configuration) {
    'use strict';
    /**
     * listeners - holds the custom event listeners to send to widget
     * @type {Object}
     */
    this.listeners = {};
    /**
     * container - holds the view container Object
     * @type {null}
     */

    this.container = null;

    /**
     * config - holds the copy view Config Object
     * @type {JSON}
     */
    this.config = JSON.parse(JSON.stringify(configuration));

    /**
     * styleVal - holds the updated left value for left/right transition
     * @type {Number}
     */
    this.styleVal = 0;

    if (this.config.focusable === undefined) {
        this.config.focusable = true;
    }

    /**
     * focusIndex - holds the current focused index
     * @type {Number}
     */
    this.focusIndex = this.config.highlightedColumnIndex;

    /**
     * indices - holds the copy of data passed to the presentation
     * @type {null}
     */

    this.indices = null;

    if (!this.config.matrixWidgetId) {
        if (!this.config.focusable) {
            this.config.matrixWidgetId = "matrixWidgetNonFocusable";
        }
        else {
            this.config.matrixWidgetId = "matrixWidget";
        }
    }

    if (this.config.focusable) {
        this.defaultContainerStyle = "default-matrix";
        this.defaultFocusedDataStyle = "default-matrix-focused-data";

    } else {
        this.defaultContainerStyle = "default-matrix-nofocus";
    }
    if (this.config.containerStyle === undefined) {
        this.config.containerStyle = "";
    }
    if (this.config.focusedDataStyle === undefined) {
        this.config.focusedDataStyle = "";
    }
    if (this.config.rowStyle === undefined) {
        this.config.rowStyle = "";
    }
    if (this.config.itemStyle === undefined) {
        this.config.itemStyle = "";
    }

    if (this.config.margin === undefined) {
        this.config.margin = 10;
    }

    /**
     *widget container
     * @type {HTMLElement}
     */

    this.parentContainer = document.getElementById(this.config.parentContainer);


    try {
        this.templateItem = cisco.epg.template.TemplateFactory.getTemplate(this.config["itemTemplate"]);
        if (this.config.focusable) {
            this.templateMetaData = cisco.epg.template.TemplateFactory.getTemplate(this.config["focusedItemTemplate"]);
        }
    }
    catch (ex) {
        throw new Error(ex + "template not found");
    }

};
/**
 * return the template contents
 * @method getTemplateItemData
 * @namespace cisco.epg.widget.matrix.MatrixView
 * @param item
 * @returns  string received  from the template function output
 */
cisco.epg.widget.matrix.MatrixView.prototype.getTemplateItemData = function (item) {
    'use strict';
    return this.templateItem.render(item);
};
/**
 * setData is responsible for creating view with data
 * @method setData
 * @namespace cisco.epg.widget.matrix.MatrixView
 * @param data
 */
cisco.epg.widget.matrix.MatrixView.prototype.setData = function (data) {
    'use strict';
    this.createView(data);

};

/**
 * Show the widget
 * @method show
 * @namespace cisco.epg.widget.matrix.MatrixView
 */
cisco.epg.widget.matrix.MatrixView.prototype.show = function () {
    'use strict';
    if (this.container && this.parentContainer) {
        this.container.style.visibility = "visible";
    }
    if (this.metaDataContainer) {
        this.metaDataContainer.style.visibility = "visible";
    }
};

/**
 * Hide the widget
 * @method hide
 * @namespace cisco.epg.widget.matrix.MatrixView
 */
cisco.epg.widget.matrix.MatrixView.prototype.hide = function () {
    'use strict';
    if (this.container && this.parentContainer) {
        this.container.style.visibility = "hidden";
    }
    if (this.metaDataContainer) {
        this.metaDataContainer.style.visibility = "hidden";
    }
};
/**
 * make the non focusable widget to center
 * @method makeNonFocusCenter
 * @namespace cisco.epg.widget.matrix.MatrixView
 */
cisco.epg.widget.matrix.MatrixView.prototype.makeNonFocusCenter = function () {
    'use strict';
    var centerPos = Math.ceil(window.innerWidth / 2);
    var itemContainer = document.getElementById(this.config.matrixWidgetId);
    var items = itemContainer.childNodes[0].childNodes;
    var offsetElemIndex = Math.floor(this.config.columnCount / 2);
    itemContainer.style.left = (centerPos - (items[offsetElemIndex].offsetLeft +
        (items[offsetElemIndex].offsetWidth) / 2)) + "px";
};
/**
 * create dom element based on parameter passed
 * @method createElement
 * @namespace cisco.epg.widget.matrix.MatrixView
 * @param elemnt -element type
 * @param id
 * @param className
 * @return {*|HTMLElement}
 */
cisco.epg.widget.matrix.MatrixView.prototype.createElement = function (elemnt, id, className) {
    'use strict';
    var elem = document.createElement(elemnt);
    if (id) {
        elem.id = id;
    }
    if (className) {
        elem.className = className;
    }
    return elem;
};
/**
 * Create the view for matrix widget based on data passed.
 * @method createView
 * @namespace cisco.epg.widget.matrix.MatrixView
 * @param data {Array}
 */

cisco.epg.widget.matrix.MatrixView.prototype.createView = function (data) {
    'use strict';
    this.indices = data.slice(0);
    this.createContainer();
    this.createFragment(data);
    this.appendDOM();
    if (this.config.focusable) {
        this.setClass();
        this.bringCenter();
        this.updateFocusedItem();
    }
    else {
        this.makeNonFocusCenter();
    }

};

/**
 * Create container elements to hold the list
 * @method createContainer
 * @namespace cisco.epg.widget.matrix.MatrixView
 * @private
 */
cisco.epg.widget.matrix.MatrixView.prototype.createContainer = function () {
    'use strict';
    var containerStyle = this.defaultContainerStyle + " " + this.config.containerStyle ,
        focusedDataContainerStyle = this.defaultFocusedDataStyle + " " + this.config.focusedDataStyle;
    this.container = this.createElement("div", this.config.matrixWidgetId, containerStyle);
    if (this.config.focusable) {
        this.metaDataContainer = this.createElement("div", this.config.matrixWidgetId + "_FocusedData",
            focusedDataContainerStyle);
    }
};

/**
 * Create the DOM fragments
 * @method createFragment
 * @namespace cisco.epg.widget.matrix.MatrixView
 * @param data {Array}
 * @private
 */

cisco.epg.widget.matrix.MatrixView.prototype.createFragment = function (data) {
    'use strict';
    var fragment, i, arrayLength, j, liTag, liLength, ulTag;

    fragment = document.createDocumentFragment();
    arrayLength = data.length;

    for (i = 0; i < arrayLength; i++) {
        ulTag = this.createElement("ul", null, this.config.rowStyle + i);
        ulTag.style.width = this.config.columnCount * this.config.listWidth + 'px';
        liLength = data[i].length;
        for (j = 0; j < liLength; j++) {
            liTag = this.createElement("li", null, this.config.itemStyle);
            if (data[i][j]) {
                liTag.innerHTML = this.createItem({item:data[i][j], config:this.config});
            }
            ulTag.appendChild(liTag);
        }
        fragment.appendChild(ulTag);
    }
    this.container.appendChild(fragment);
};
/**
 * creates the template item
 * @method createItem
 * @namespace cisco.epg.widget.matrix.MatrixView
 * @param item {Object}
 * @returns  string received from template item function
 */

cisco.epg.widget.matrix.MatrixView.prototype.createItem = function (item) {
    'use strict';
    return this.templateItem.render(item);
};

/**
 * Method to append the elements to DOM
 * @method appendDOM
 * @namespace cisco.epg.widget.matrix.MatrixView
 * @private
 */

cisco.epg.widget.matrix.MatrixView.prototype.appendDOM = function () {
    'use strict';
    var widgetHolder;
    widgetHolder = this.parentContainer;
    widgetHolder.appendChild(this.container);
    if (this.config.focusable) {
        widgetHolder.appendChild(this.metaDataContainer);
    }
};

/**
 * adds the custom event listeners
 * @method addEventListener
 * @param type
 * @param instance
 */
cisco.epg.widget.matrix.MatrixView.prototype.addEventListener = function (type, instance) {
    this.listeners[type] = instance;
};
/**
 *  Navigate to left
 *  @method left
 *  @namespace cisco.epg.widget.matrix.MatrixView
 *  @param isScrollFast
 */

cisco.epg.widget.matrix.MatrixView.prototype.left = function (isScrollFast) {
    'use strict';
    this.focusIndex -= 1;
    this.removeFocus();
    this.updateFocusedItem();
    this.setOffset(true);
    if (!isScrollFast) {
        this.setClass();
    }
};

/**
 *  Navigate to right
 *  @method right
 *  @namespace cisco.epg.widget.matrix.MatrixView
 *  @param isScrollFast
 */

cisco.epg.widget.matrix.MatrixView.prototype.right = function (isScrollFast) {
    'use strict';
    this.focusIndex += 1;
    this.removeFocus();
    this.updateFocusedItem();
    this.setOffset(false);
    if (!isScrollFast) {
        this.setClass();
    }
};

/**
 * set the class on long key release
 * @method longKeyReleased
 */
cisco.epg.widget.matrix.MatrixView.prototype.longKeyReleased = function () {
    'use strict';
    this.setClass();
};

/**
 * Set the left or right offset on selection change.
 * @method setOffset
 * @namespace cisco.epg.widget.matrix.MatrixView
 * @param left boolean
 * @private
 */

cisco.epg.widget.matrix.MatrixView.prototype.setOffset = function (left) {
    'use strict';
    var rowTag, value;
    rowTag = this.container.children[this.config.highlightedRowIndex];

    if (left) {
        value = this.config.listWidth + this.styleVal;
        rowTag.style.webkitTransform = 'translate3d(' + value + 'px,0,0)';
        this.styleVal += this.config.listWidth;
    }
    else {
        value = this.config.listWidth - this.styleVal;
        rowTag.style.webkitTransform = 'translate3d(' + (-value) + 'px,0,0)';
        this.styleVal -= this.config.listWidth;
    }
};

/**
 * Set className on selection change.
 * @method setClass
 * @namespace cisco.epg.widget.matrix.MatrixView
 * @private
 */

cisco.epg.widget.matrix.MatrixView.prototype.setClass = function () {
    'use strict';
    var focusedItem = this.container.children[this.config.highlightedRowIndex].children[this.focusIndex], cb, that = this;
    if (this.config.itemStyle) {
        focusedItem.classList.add(this.config.itemStyle);
    }
    focusedItem.classList.add('selected');
    cb = function () {
        focusedItem.removeEventListener('webkitTransitionEnd', cb);
        that.listeners['ANIMATION_END'].handleEvent({type:'ANIMATION_END'});
    };
    focusedItem.addEventListener('webkitTransitionEnd', cb);
};

/**
 * Navigates one row up.
 * @method up
 * @namespace cisco.epg.widget.matrix.MatrixView
 * @param data
 */

cisco.epg.widget.matrix.MatrixView.prototype.up = function (data) {
    'use strict';
    this.performVerticalNavigation("UP", data);
};

/**
 * Navigates one row down
 * @method down
 * @namespace cisco.epg.widget.matrix.MatrixView
 * @param data
 */

cisco.epg.widget.matrix.MatrixView.prototype.down = function (data) {
    'use strict';
    this.performVerticalNavigation("DOWN", data);
};
/**
 * perform Up/Down navigation
 * @method performVerticalNavigation
 * @namespace cisco.epg.widget.matrix.MatrixView
 * @param direction
 * @param data
 * @private
 */
cisco.epg.widget.matrix.MatrixView.prototype.performVerticalNavigation = function (direction, data) {
    'use strict';
    var ulTag, that = this;
    that.removeFocus();
    this.focusIndex = this.config.highlightedColumnIndex;
    this.container.children[this.config.highlightedRowIndex].style.webkitTransform = 'translate3d(0,0,0)';
    this.styleVal = 0;
    this.metaDataContainer.style.visibility = 'hidden';
    if (direction === "UP") {
        this.indices.pop();
        this.indices.unshift(data);
        ulTag = this.getUpdateList(data,this.container.lastChild);
        this.container.insertBefore(ulTag, this.container.firstChild);
    }
    else {
        this.indices.shift();
        this.indices.push(data);
        ulTag = this.getUpdateList(data,this.container.firstChild);
        this.container.appendChild(ulTag);
    }
    for (var i = 0; i < this.container.children.length; i++) {
        this.container.children[i].className = this.config.rowStyle + ' ' + this.config.rowStyle + '_' + direction + '_' + i;
    }
    var callback = function () {
        that.container.children[0].removeEventListener('webkitAnimationEnd', callback);
        if (!document.querySelector('selected')) {
            that.setClass();
            that.updateFocusedItem();
        }
    };
    var cb = function(){
        that.container.children[that.config.highlightedRowIndex].children[that.focusIndex].removeEventListener('webkitTransitionEnd',cb);
        that.listeners['ANIMATION_END'].handleEvent({type:'ANIMATION_END'});
    };
    this.container.children[0].addEventListener('webkitAnimationEnd', callback);
    this.container.children[this.config.highlightedRowIndex].children[this.focusIndex].addEventListener('webkitTransitionEnd',cb);
};

/**
 * update the new UL element to be created
 * @method getUpdateList
 * @param array
 * @param ulTag
 * @return {HTMLElement}
 */
cisco.epg.widget.matrix.MatrixView.prototype.getUpdateList = function (array, ulTag) {
    'use strict';
    var liTag, arrayLength, i;
    ulTag.className = this.config.rowStyle;
    arrayLength = array.length;
    for (i = 0; i < arrayLength; i++) {
        liTag = ulTag.children[i];
        if (array[i] !== null) {
            liTag.innerHTML = this.createItem({item:array[i], config:this.config});
        } else {
            liTag.innerHTML = '';
        }
    }
    return ulTag;
};

/**
 *  Focus the DOM
 *  @method focus
 *  @namespace cisco.epg.widget.matrix.MatrixView
 */

cisco.epg.widget.matrix.MatrixView.prototype.focus = function () {
    'use strict';
    this.parentContainer.setAttribute("tabindex", 0);
    this.parentContainer.focus();
};
/**
 *  unFocus the DOM
 *  @method unFocus
 *  @namespace cisco.epg.widget.matrix.MatrixView
 */

cisco.epg.widget.matrix.MatrixView.prototype.unFocus = function () {
    'use strict';
    this.parentContainer.removeAttribute("tabindex");
    this.parentContainer.blur();
};

/**
 * Make the list items to the center of the page
 * @method bringCenter
 * @namespace cisco.epg.widget.matrix.MatrixView
 * @private
 */

cisco.epg.widget.matrix.MatrixView.prototype.bringCenter = function () {
    'use strict';
    var li, menuItems, matrixWidget, arrayLength,
        posOffset = 0;
    matrixWidget = this.container;
    menuItems = matrixWidget.children[this.config.highlightedRowIndex].children;
    arrayLength = this.config.highlightedColumnIndex;
    for (li = 0; li < arrayLength; li++) {
        posOffset += (menuItems[li].clientWidth + (2 * this.config.margin));
    }
    posOffset += (menuItems[this.config.highlightedColumnIndex].clientWidth + (2 * this.config.margin)) / 2;
    matrixWidget.style.left = (parseInt(matrixWidget.clientWidth) / 2 - posOffset) + "px";
};


/**
 * Removes the focus of an selected content
 * @method removeFocus
 * @namespace cisco.epg.widget.matrix.MatrixView
 * @private
 */

cisco.epg.widget.matrix.MatrixView.prototype.removeFocus = function () {
    'use strict';
    var selectedNode = document.querySelector(".selected"), metaDataContainer;
    if (selectedNode) {
        selectedNode.classList.remove('selected');
    }
    metaDataContainer = document.getElementById('metaDataContainer');
    metaDataContainer.classList.remove('metaDataFadeIn');
    metaDataContainer.classList.add('metaDataFadeOut');
};

/**
 * This method will update the meta data contents on focus
 * @method updateFocusedItem
 * @namespace cisco.epg.widget.matrix.MatrixView
 * @private
 */
cisco.epg.widget.matrix.MatrixView.prototype.updateFocusedItem = function () {
    'use strict';
    var focusedItem, metaDataContainer;
    this.metaDataContainer.style.visibility = 'visible';
    focusedItem = this.indices[this.config.highlightedRowIndex][this.focusIndex];
    this.metaDataContainer.innerHTML = this.templateMetaData.render({item:focusedItem, config:this.config});
    metaDataContainer = document.getElementById('metaDataContainer');
    metaDataContainer.classList.remove('metaDataFadeOut');
    metaDataContainer.classList.add('metaDataFadeIn');
};

/**
 * This method which clear the DOM
 * @method dispose
 * @namespace cisco.epg.widget.matrix.MatrixView
 */

cisco.epg.widget.matrix.MatrixView.prototype.dispose = function () {
    'use strict';
    if (this.parentContainer) {
        if (this.container) {
            this.parentContainer.removeChild(this.container);
        }
        if (this.metaDataContainer) {
            this.parentContainer.removeChild(this.metaDataContainer);
        }
    }
    this.container = null;
    this.parentContainer = null;
    this.metaDataContainer = null;
    this.indices = null;
    this.focusIndex = null;
    this.styleVal = null;
};
/**
 * CISCO CONFIDENTIAL
 * Copyright (c) 2013, Cisco Systems, Inc.
 * @author Saurabh Biswas
 * MatrixModel serves as model for holding data for  both focusable and nofocusable setting.
 * @module widget
 * @submodule matrix
 * @namespace cisco.epg.widget.matrix
 * @class MatrixModel
 * @param  configuration {JSON Object} matrix widget configuration json
 * @param  listener {Object} callback to update the model events
 */

cisco.declare("cisco.epg.widget.matrix");
cisco.epg.widget.matrix.MatrixModel = function(configuration, listener){

    var modelIndex = null,
        matrixData = [],
        focusedRowIndex = 0,
        config = JSON.parse(JSON.stringify(configuration)),
        constants = cisco.epg.widget.matrix.MatrixWidgetConstants;

    var appendArray = function(data){ 'use strict';
        var newDataLength = data.length;
        var count = 0;
        var lastRow = matrixData[matrixData.length - 1];
        matrixData[matrixData.length - 1] = lastRow.concat(data.splice(0, config.columnCount - lastRow.length));
        while(data.length > 0){
            matrixData.push(data.splice(0, config.columnCount));
            count++;
        }
        listener("DATA_APPENDED", {dataLen: newDataLength, rowsAdded: count});
    };

    var prependArray = function(data){ 'use strict';
        var newDataLength = data.length;
        var count = 0;
        var firstRow = matrixData[0];
        matrixData[0] = data.splice(-1 * ( config.columnCount - firstRow.length),
            config.columnCount - firstRow.length).concat(firstRow);
        while(data.length > 0){
            matrixData.unshift(data.splice(-1 * config.columnCount, config.columnCount));
            count++;
        }
        listener("DATA_PREPENDED", {dataLen: newDataLength, rowsAdded: count});
    };

    var createInitialArray = function(data){ 'use strict';
        var startOfFocusedRow = modelIndex - config.highlightedColumnIndex,
            endOfFocusedRow = startOfFocusedRow + config.columnCount;
        startOfFocusedRow = startOfFocusedRow < 0 ? 0 : startOfFocusedRow;
        matrixData.push(data.slice(startOfFocusedRow, endOfFocusedRow));
        var tempStartOfRow = startOfFocusedRow;
        var tempEndOfRow = null;
        while(true){
            tempStartOfRow = tempStartOfRow - config.columnCount;
            tempEndOfRow = tempStartOfRow + config.columnCount;
            if(tempStartOfRow <= 0 - config.columnCount){
                break;
            }
            else{
                if(tempStartOfRow < 0){
                    tempStartOfRow = 0;
                }
            }
            matrixData.unshift(data.slice(tempStartOfRow, tempEndOfRow));
            focusedRowIndex += 1;
        }

        tempStartOfRow = endOfFocusedRow;
        while(true){
            tempEndOfRow = tempStartOfRow + config.columnCount;
            if(tempEndOfRow > data.length + config.columnCount - 1){
                break;
            }
            else{
                if(tempEndOfRow >= data.length){
                    tempEndOfRow = data.length;
                }
            }
            matrixData.push(data.slice(tempStartOfRow, tempEndOfRow));
            tempStartOfRow = tempStartOfRow + config.columnCount;
        }
    };

    var modifyData = function(type, rowIndex, colIndex, object){ 'use strict';
        var linearData = [], i;
        var rows = matrixData.length;
        for(i = 0; i < rows; i++){
            linearData=linearData.concat(matrixData[i]);
        }
        var elemPos = null;
        if(rowIndex === 0){
            elemPos = config.column
        }
        else{
            elemPos = (rowIndex * config.column) + colIndex;
        }

        if(linearData[elemPos] !== undefined || linearData[elemPos] !== null){
            if(type === "ADD"){
                linearData.splice(elemPos, 0, object);
            }
            else{
                linearData.splice(elemPos, 1);
            }
            matrixData = [];
            createInitialArray(linearData);
        }
    };

    var compare = function(obj1, obj2){ 'use strict';
        var isSame = false;
        if((typeof obj2) !== "object"){
            return (obj1 === obj2);
        }
        else if(typeof obj2 === "string"){
            return (obj1.toString() === obj2.toString())
        }
        else if(obj2){
            for(var prop in obj2){
                if(!compare(obj1[prop], obj2[prop])){
                    return false;
                }
            }
            isSame = true;
        }
        return isSame;
    };

    /**
     * set data in INIT,PREVIOUS or NEXT position in model
     * if no direction is given then, it is assumed to be NEXT.
     * Internally,if matrixData array is empty, it will invoke INIT
     * @method setData
     * @param data {Array}
     * @param direction[Default NEXT]
     */
    this.setData = function(data,direction){ 'use strict';
        if(direction===undefined){
            direction="NEXT";
        }
        if(this.getAll().length===0){
            direction="INIT";
        }
        switch(direction){
            case "INIT":
                createInitialArray(data);
                break;
            case "PREVIOUS":
                prependArray(data);
                break;
            case "NEXT":
                appendArray(data);
                break;
            default :
                break;

        }
    };
    /**
     * set selected index in model
     * @method setData
     * @param index
     */
    this.setSelectedIndex = function(index){ 'use strict';
        modelIndex = index;
    };
    /**
     * Get selected index
     * @method getSelectedIndex
     * @return  selected index
     */
    this.getSelectedIndex = function(){ 'use strict';
        return modelIndex;
    };
    /**
     * set focus row index
     * @method setFocusedRowIndex
     * @param focusRowIndex
     */

    this.setFocusedRowIndex = function(focusRowIndex){ 'use strict';
        this.focusedRowIndex = focusRowIndex;
    };
    /**
     * get focus row index
     * @method getFocusedRowIndex
     * @return {number} focus row index
     */
    this.getFocusedRowIndex = function(){ 'use strict';
        return focusedRowIndex;
    };
    /**
     * get model data from start to end row index
     * @method getData
     * @param startRowIndex
     * @param endRowIndex
     * @return {Array}
     */
    this.getData = function(startRowIndex, endRowIndex){ 'use strict';
        var ret = [];
        if(startRowIndex >= 0){
            ret = matrixData.slice(startRowIndex, endRowIndex + 1);
        }
        return ret;
    };

    /**
     * get matrix data at [rowIndex, columnIndex]
     * @method elementAt
     * @param rowIndex
     * @param columnIndex
     * @return {matrix item} matrix item at specified position
     */
    this.elementAt = function(rowIndex, columnIndex){ 'use strict';
        return matrixData[rowIndex][columnIndex];
    };
    /**
     * get elements from startRowIndex to end row index
     * @method elements
     * @param startRowIndex
     * @param endRowIndex
     * @return {Array}
     */
    this.elements = function(startRowIndex, endRowIndex){ 'use strict';
        var ret = [], i;
        for(i = 0; i <= (endRowIndex - startRowIndex); i++){
            ret.push(matrixData[startRowIndex]);
            startRowIndex++;
        }
        return ret;
    };
    /**
     * get first elem in matrix model
     * @method getFirstElement
     * @return first elem
     */
    this.getFirstElement = function(){ 'use strict';
        var elem = null;
        if(matrixData.length !== 0){
            elem = matrixData[0][0];
        }
        return elem;
    };
    /**
     * get last elem in model
     * @method getLastElement
     * @return elem
     */
    this.getLastElement = function(){ 'use strict';
        var lastRow = matrixData.length - 1;
        return matrixData[lastRow][matrixData[lastRow].length - 1];
    };
    /**
     * no of elements in the model
     * @method getSize
     * @return {number}
     */
    this.getSize = function(){ 'use strict';
        var size = 0, i, j;
        for(i = 0; i < matrixData.length; i++){
            for(j = 0; j < matrixData[i].length; j++){
                size++;
            }
        }
        return size;
    };
    /**
     * get index of passed item in model
     * @method indexOf
     * @param item
     * @returns {"row": index, "column": index}
     */
    this.indexOf = function(item){ 'use strict';
        var i, j, index = -1;
        var rows = matrixData.length;
        for(i = 0; i < rows; i++){
            for(j = 0; j < matrixData[i].length; j++){

                if(compare(item, matrixData[i][j])){
                    index = {"row": i, "column": j};
                    break;
                }
            }
        }
        return index;
    };
    /**
     * insert object at particular index
     * @method insertAt
     * @param rowIndex
     * @param colIndex
     * @param object
     */
    this.insertAt = function(rowIndex, colIndex, object){ 'use strict';
        modifyData("ADD", rowIndex, colIndex, object);

    };
    /**
     * remove elements from particular index
     * @method removeElementAt
     * @param rowIndex
     * @param colIndex
     */
    this.removeElementAt = function(rowIndex, colIndex){ 'use strict';
        modifyData("REMOVE", rowIndex, colIndex);
    };
    /**
     * Removes rows data from the model uses splice
     * @method removeRows
     * @param startRowIndex
     * @param howmany no of rows to be deleted
     */
    this.removeRows=function(startRowIndex,howmany){
        var removedRows= matrixData.splice(startRowIndex,howmany);
        listener("DATA_REMOVED", { rowsRemoved: removedRows.length});
    }

    /**
     * replace object at particular index
     * @method replace
     * @param rowIndex
     * @param colIndex
     * @param object
     */
    this.replace = function(rowIndex, colIndex, object){ 'use strict';
        var lastRowIndex = matrixData.length - 1;
        if(rowIndex <= lastRowIndex && colIndex <= config.columnCount){
            matrixData[rowIndex][colIndex] = object;
        }
    };

    /**
     * removes all data in model
     * @method removeAll
     */
    this.removeAll = function(){ 'use strict';
        matrixData = [];
    };
    /**
     * get all data from model
     * @method getAll
     * @returns {Array}
     */
    this.getAll = function(){ 'use strict';
        return matrixData;
    };

};


 /**
 * CISCO CONFIDENTIAL
 * Copyright (c) 2013, Cisco Systems, Inc.
 * MatrixWidget acts as  controller/facade  for matrix.
 * @author Saurabh Biswas
 * @module widget
 * @submodule matrix
 * @namespace cisco.epg.widget.matrix
 * @class MatrixWidget
 * @param  configuration {JSON Object} matrix widget configuration json
 */

cisco.declare("cisco.epg.widget.matrix");

cisco.epg.widget.matrix.MatrixWidget = function(configuration) { 'use strict';
    var config=JSON.parse(JSON.stringify(configuration));
    if(config.isFocusableWidget === true){
        if(config.highlightedColumnIndex >= config.columnCount){
            throw new Error(" column highlight Index can not be greater the column count");
        }

        if(config.highlightedRowIndex >= config.rowCount){
            throw new Error(" row highlight Index can not be greater the row count");
        }
    }
    var view = null;
    if(config.viewClass){
        view = new (eval(config.viewClass))(config);
    }
    else{
        throw new Error(" viewClass, mandatory config option missing");
    }
    for (var i = 0; i < config.animationEvents.length; i++) {
        view.addEventListener(config.animationEvents[i], this);
    }
    var currentRowCount = config.rowCount;
    var modelIndex = null;
    var modelFocusRowIdx = null;
    var indices = [];
    var listenerArray = {};
    var bufferedRowOffset = config.highlightedRowIndex;
    var currentColumnIndex = null;
    var dataPrepended=null;
    var isAnimationProgress = true;
    
    var notify = function (eventType, context) { 'use strict';
        var eventObj = {};
        eventObj.type = eventType;
        eventObj.context = context;
        if (listenerArray && listenerArray[eventType]) {
            listenerArray[eventType].handleEvent(eventObj);
        }
    };

    var modelListener = function (type, context) { 'use strict';
        if(type==="DATA_PREPENDED"){
            modelFocusRowIdx=modelFocusRowIdx+context.rowsAdded;
        }else if(type==="DATA_REMOVED"){
            modelFocusRowIdx=modelFocusRowIdx-context.rowsRemoved;
        }
    };
    var model = new cisco.epg.widget.matrix.MatrixModel(config, function (type, context) {
        modelListener(type, context);
    });
    var next = function(isScrollFast){
        if (model.elementAt(modelFocusRowIdx, currentColumnIndex + 1) != null) {
            currentColumnIndex += 1;
            view.right(isScrollFast);
            modelIndex += 1;
            notify("SELECTION_CHANGE", null);
        } else {
            notify("AT_END_COLUMN", null);
        }
    };

    var previous = function(isScrollFast){
        if (model.elementAt(modelFocusRowIdx, currentColumnIndex - 1) != null) {
            currentColumnIndex -= 1;
            view.left(isScrollFast);
            modelIndex -= 1;
            notify("SELECTION_CHANGE", null);
        } else {
            notify("AT_BEGIN_COLUMN", null);
        }
    };

    var scrollFast = function (direction) {
        switch (direction) {
            case config.actions.NEXT:
                next(true);
                break;
            case config.actions.PREVIOUS:
                previous(true);
                break;
        }
    };

    /**
     * arrange the data for view as per matrix widget
     * @method arrangeData
     * @param data
     * @returns arranged data
     * @private
     */

    this.arrangeData = function (data) { 'use strict';
        var ret = {'data': data, 'index': config.highlightedColumnIndex}, i = 0, j;
        if (data.length !== config.columnCount) {
            var highlightPosRatio = (config.highlightedColumnIndex + 1) / config.columnCount;
            var focusedItemIdxInData = (data.length - 1) * highlightPosRatio;
            var selectedIdx = Math.floor(focusedItemIdxInData);
            selectedIdx = selectedIdx < 0 ? 0 : selectedIdx;
            ret.index = selectedIdx;
            ret.data = data.slice(0);
            for (i; i < config.highlightedColumnIndex - selectedIdx; i+=1) {
                ret.data.unshift(null);
            }
            for (j = ret.data.length; j < config.columnCount; j+=1) {
                ret.data.push(null);
            }
        }
        return ret;
    };
    /**
     * Arrange the initial data
     * @method arrangeInitData
     * @param data
     * @returns arranged data
     * @private
     */
    this.arrangeInitData = function (data) { 'use strict';
        var ret = data,i= 0,j= 0,k;
        for (i; i < data.length; i+=1) {
            indices[i] = config.highlightedColumnIndex;
        }
        var arrangedData = this.arrangeData(ret[0]);
        ret[0] = arrangedData.data;
        indices[0] = arrangedData.index;

        if(ret.length !== 1){
            arrangedData = (this.arrangeData(ret[ret.length - 1]));
            ret[ret.length - 1] = arrangedData.data;
            indices[indices.length - 1] = arrangedData.index;
        }
        if (ret.length !== config.rowCount) {
            ret = data.slice(0);
            for (j; j < config.highlightedRowIndex - modelFocusRowIdx; j+=1) {
                ret.unshift(this.arrangeData([]).data);
                indices.unshift(null);
                bufferedRowOffset-=1;
            }
            for (k = ret.length; k < config.rowCount; k+=1) {
                ret.push(this.arrangeData([]).data);
                indices.push(null);
            }
            currentRowCount = data.length;
        }
        modelIndex = modelIndex + (indices[config.highlightedRowIndex] - config.highlightedColumnIndex);
        return ret;
    };
    /**
     * Set the model
     * @method setModel
     * @param currModel
     */
    this.setModel=function(currModel){
        model=currModel;
    }
    /**
     * get model
     * @method getModel
     * @returns {cisco.epg.widget.matrix.MatrixModel}
     */
    this.getModel=function(){
        return model;
    }
    /**
     * Dispose the view
     * @method dispose
     */
    this.dispose = function () {
        view.dispose();
        view=null;
        model=null;
        notify("DISPOSE",null);
    };
    /**
     * Show the view
     * @method show
     */
    this.show = function () {
        'use strict';
        document.getElementById(config.parentContainer).setAttribute("tabindex", 0);
        document.getElementById(config.parentContainer).focus();
        view.show();
       notify("SHOWN", null);
    };
    /**
     * Append data in model
     * @method  append
     * @param data {array}
     */
    this.append=function(data){ 'use strict';
        var direction="NEXT";
        if(model.getAll().length===0){
            direction="INIT";
        }
        this.setData(data,direction);
    }
    /**
     * prepend data in model
     * @method prepend
     * @param data
     */
    this.prepend=function(data){ 'use strict';
        var direction="PREVIOUS";
        if(model.getAll().length===0){
            direction="INIT";
        }
        this.setData(data,direction);
    }
    /**
     * set data in INIT,PREVIOUS or NEXT position in model
     * if no direction is given then, it is assumed to be NEXT.
     * Internally,if matrixData array is empty, it will invoke INIT
     * @method setData
     * @param dataArray
     * @param direction[Default NEXT]
     */
    this.setData = function(dataArray,direction){ 'use strict';
        if(direction===undefined){
            direction="NEXT";
        }
        if(model.getAll().length===0){
            direction="INIT";
        }
        model.setData(dataArray,direction);
        if(direction === "INIT"){
            modelFocusRowIdx = model.getFocusedRowIndex();
            if(dataArray.length - 1 < modelIndex){
                throw new Error("invalid model Index set");
            }
            var startRowIndex = modelFocusRowIdx - config.highlightedRowIndex;
            var endRowIndex = startRowIndex + config.rowCount - 1;
            startRowIndex = startRowIndex < 0 ? 0 : startRowIndex;
            var dataArraySet = model.getData(startRowIndex, endRowIndex);
            dataArray = this.arrangeInitData(dataArraySet);
            currentColumnIndex = indices[config.highlightedRowIndex];
            view.setData(dataArray);
        }
    };

    /**
     * Handle UP,DOWN,LEFT AND RIGHT event
     * @method handleEvent
     * @param event
     */
    this.handleEvent = function (event) { 'use strict';
        var newStartRowIndex,dataArray,arrangedData,focusRowCount,prevFocusRowCount;
        switch (event.type) {
            case "ANIMATION_END":
                isAnimationProgress = true;
                break;
            case "ACTION_LEFT_LONG":
                if (event.detail.state.toUpperCase() === "RELEASE") {
                    view.longKeyReleased();
                } else {
                    scrollFast(config.actions.PREVIOUS);
                }
                break;
            case "ACTION_RIGHT_LONG":
                if (event.detail.state.toUpperCase() === "RELEASE") {
                    view.longKeyReleased();
                } else {
                    scrollFast(config.actions.NEXT);
                }
                break;
            case "ACTION_LEFT":
                previous();
                break;
            case "ACTION_RIGHT":
                next();
                break;
            case "ACTION_UP":
            case "ACTION_UP_LONG":
                if (isAnimationProgress) {
                newStartRowIndex = modelFocusRowIdx - config.highlightedRowIndex - 1;
                dataArray = model.getData(newStartRowIndex, newStartRowIndex);
                if (dataArray.length > 0) {
                        isAnimationProgress = false;
                    bufferedRowOffset = bufferedRowOffset > config.highlightedRowIndex ? bufferedRowOffset - 1 : bufferedRowOffset;
                    arrangedData = this.arrangeData(dataArray[0]);
                    dataArray = arrangedData.data;
                    modelFocusRowIdx-=1;
                    indices.unshift(arrangedData.index);
                        indices.pop();
                        view.up(dataArray);
                        focusRowCount = model.getData(modelFocusRowIdx, modelFocusRowIdx)[0].length;
                        modelIndex = modelIndex - currentColumnIndex - (focusRowCount - indices[config.highlightedRowIndex ]);
                        currentColumnIndex = indices[config.highlightedRowIndex];
                        notify("SELECTION_CHANGE", null);
                    } else {
                        if (bufferedRowOffset - 1 >= 0) {
                            isAnimationProgress = false;
                            modelFocusRowIdx -= 1;
                            dataArray = (this.arrangeData([])).data;
                            indices.unshift(null);
                            indices.pop();
                            bufferedRowOffset -= 1;
                            focusRowCount = model.getData(modelFocusRowIdx, modelFocusRowIdx)[0].length;
                            modelIndex = modelIndex - currentColumnIndex - (focusRowCount - indices[config.highlightedRowIndex ]);
                            view.up(dataArray);
                            currentColumnIndex = indices[config.highlightedRowIndex];
                            notify("SELECTION_CHANGE", null);
                        } else {
                            notify("AT_BEGIN_ROW", null);
                        }

                    }
                }
                break;
            case "ACTION_DOWN":
            case "ACTION_DOWN_LONG":
                if (isAnimationProgress) {
                    newStartRowIndex = (modelFocusRowIdx + 1) - config.highlightedRowIndex;
                    var newEndRowIndex = newStartRowIndex + config.rowCount - 1;
                    dataArray = model.getData(newEndRowIndex, newEndRowIndex);
                    if (dataArray.length > 0) {
                        isAnimationProgress = false;
                        currentRowCount = currentRowCount < config.rowCount ? currentRowCount + 1 : currentRowCount;
                        bufferedRowOffset = bufferedRowOffset < config.highlightedRowIndex ? bufferedRowOffset + 1 : bufferedRowOffset;
                        arrangedData = this.arrangeData(dataArray[0]);
                        dataArray = arrangedData.data;
                        modelFocusRowIdx += 1;
                        indices.push(arrangedData.index);
                        indices.shift();
                        view.down(dataArray);
                        prevFocusRowCount = model.getData(modelFocusRowIdx - 1, modelFocusRowIdx - 1)[0].length;
                        modelIndex = modelIndex + (prevFocusRowCount - currentColumnIndex) + indices[config.highlightedRowIndex ];
                        currentColumnIndex = indices[config.highlightedRowIndex];
                        notify("SELECTION_CHANGE", null);
                    } else {
                        if (bufferedRowOffset + 1 < currentRowCount) {
                            isAnimationProgress = false;
                            modelFocusRowIdx += 1;
                            dataArray = (this.arrangeData([])).data;
                            bufferedRowOffset += 1;
                            indices.push(null);
                            indices.shift();
                            view.down(dataArray);
                            prevFocusRowCount = model.getData(modelFocusRowIdx - 1, modelFocusRowIdx - 1)[0].length;
                            modelIndex = modelIndex + (prevFocusRowCount - currentColumnIndex) + indices[config.highlightedRowIndex];
                            currentColumnIndex = indices[config.highlightedRowIndex];
                            notify("SELECTION_CHANGE", null);
                        } else {
                            notify("AT_END_ROW", null);
                        }
                    }
                }
                break;
            default:
                break;
        }
    };
    /**
     * Get the current selected Item from model
     * @method getSelectedItem
     * @returns {matrixData}
     */
    this.getSelectedItem = function () { 'use strict';
        return model.elementAt(modelFocusRowIdx, currentColumnIndex);
    };
    /**
     * modify the model focus row index
     * @method modifyModelFocusRowIdx
     * @param delta could be positive or negative based on addition/removal of rows
     */
    this.modifyModelFocusRowIdx=function(delta){
        modelFocusRowIdx=modelFocusRowIdx+delta;
    };
    /**
     * removes row[s] from the model
     * @method removeRows
     * @param startRowIndex
     * @param howmany
     */

    this.removeRows=function(startRowIndex,howmany){
       model.removeRows(startRowIndex,howmany);
    };
    /**
     * get focus item index
     * @method getFocusIndex
     * @returns  focus item index
     */
    this.getFocusIndex = function(){ 'use strict';
        return modelIndex;
    };
    /**
     * set selected index in model
     * @method setSelectedIndex
     * @param index
     */
    this.setSelectedIndex = function (index) { 'use strict';
        modelIndex = index;
        model.setSelectedIndex(index);
    };
    /**
     * Add Event Listener
     * @method addEventListener
     * @param eventType
     * @param listener
     */
    this.addEventListener = function (eventType, listener) { 'use strict';
        listenerArray[eventType] = listener;
    };
    /**
     * remove Event Listener
     * @method removeEventListener
     * @param eventType
     */
    this.removeEventListener = function (eventType) { 'use strict';
        delete listenerArray[eventType];
    };
    /**
     * focus the view
     * @method focus
     */
    this.focus = function () { 'use strict';
        view.focus();
        notify("FOCUS_GAINED", null);
    };
    /**
     * unFocus the view
     * @method unFocus
     */
    this.unFocus = function () { 'use strict';
        view.unFocus();
        notify("FOCUS_LOST", null);
    };
    /**
     * hide the view
     * @method hide
     */
    this.hide = function(){ 'use strict';
        view.hide();
        notify("HIDDEN", null);
    };
};
