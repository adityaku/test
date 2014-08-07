cisco.extend(window.cisco,{"epg":{"widget":{"listWidget":{"ListWidgetConfig":{"capacity":"undefined","viewClass":"undefined","circular":false,"viewConfig":{"size":"undefined","highlightIndex":"undefined","outerContainer":"undefined","widgetContainer":"undefined","orientation":"horizontal"},"actions":{"NEXT":"ACTION_RIGHT","PREVIOUS":"ACTION_LEFT"}}}}}});
/* CISCO CONFIDENTIAL
 Copyright (c) 2013, Cisco Systems, Inc.
 */
/**
 * This class is responsible for the display and navigation of horizontal list menu.
 */
puremvc.define({
        name: "cisco.epg.widget.listWidget.view.HorizontalListView",
        /**
         * initialize instance variables.
         * @constructor
         * @param config
         */
        constructor: function (config) {
            'use strict';
            this.config = config;
            this.index = null;
            this.focusIndex=null;
            this.horizontalContainer = null;
            this.isShadowRequired =  this.config.hasOwnProperty("isShadowRequired")?this.config.isShadowRequired:true;
            this.cssPrefix = this.config.cssPrefix || "horizontalList";
            this.shadowsContainer = null;
        }
    },
    {
        DEFAULT_WINDOW_SIZE: 8,
        /**
         * @method initialize
         * initializes the view class can be overridden by child class.
         */
        initialize: function () {
            'use strict';
        },
        /**
         * @method show
         * Method which initialises the display of horizontal menu.
         * @param data {Array} data array contains model item which will be used to populate the li elements .
         */
        show: function (data) {
            'use strict';
            var listItem,
                arrayLength, dataIndex, count = 0, targetClass;
            this.windowSize = this.config.visibleItemsCount || this.DEFAULT_WINDOW_SIZE;
            this.focusIndex = Math.ceil(this.windowSize / 2);
            this.model = data;
            this.horizontalContainer = document.getElementById(this.config.widgetContainer);
            this.index = this.config.highlightIndex;
            if (this.isShadowRequired) {
                this.showShadow(document.getElementById(this.config.outerContainer));
            }
            if (this.horizontalContainer) {
                this.horizontalContainer.innerHTML = "";
                this.horizontalContainer.parentNode.removeChild(this.horizontalContainer);
            } else {
                this.horizontalContainer = document.createElement("ul");
                this.horizontalContainer.id = this.config.widgetContainer;
            }
            this.initialize();
            arrayLength = data.length;
            for (dataIndex = 0; dataIndex < arrayLength; dataIndex++) {
                listItem = document.createElement("li");
                if (data[dataIndex]) {
                    count = this.focusIndex + dataIndex - this.index;
                    if (count < 0) {
                        count = 0;
                    }
                    if (count > this.windowSize + 1) {
                        count = this.windowSize + 1;
                    }
                }
                targetClass = this.cssPrefix + "_item_0" + count;
                listItem.className = this.cssPrefix + "Li " + targetClass;

                this.updateListInfo(listItem, data[dataIndex]);
                this.horizontalContainer.appendChild(listItem);
                if (this.focusIndex === count) {
                    this.updateFocusedItem(data[dataIndex], null);
                }
            }
            document.getElementById(this.config.outerContainer).appendChild(this.horizontalContainer);
        },
        /**
         * @method showShadow
         * show left and right shadow on focus item.
         * @private
         * @param container
         */
        showShadow: function (container) {
            'use strict';
            this.shadowsContainer = container.getElementsByClassName("shadows")[0];
            if (!this.shadowsContainer) {
                this.shadowsContainer = document.createElement("div");
                this.shadowsContainer.className = "shadows";
                this.shadowsContainer.innerHTML = '<div  class="shadowLeft">' +
                    '</div>' +
                    '<div  class="shadowRight">' +
                    '</div>';
                container.appendChild(this.shadowsContainer);
            }
        },
        /**
         * @method removeShadow
         * remove left and right shadow from focus item.
         * @private
         */
        removeShadow: function () {
            'use strict';
            if (this.shadowsContainer && this.shadowsContainer.parentNode) {
                this.shadowsContainer.parentNode.removeChild(this.shadowsContainer);
            }
        },
        /**
         * @method updateListInfo
         * populate list item.
         * @param listItem
         * @param data
         */
        updateListInfo: function (listItem, data) {
            'use strict';
        },
        /**
         * @method  updateListOnPrevious
         * update list with new li on right navigation.
         * @private
         * @param item
         */
        updateListOnPrevious: function (item) {
            'use strict';
            this.horizontalContainer.removeChild(this.horizontalContainer.children[this.horizontalContainer.children.length - 1]);
            this.horizontalContainer.insertBefore(item, this.horizontalContainer.children[0]);

        },
        longKeyReleased:function(){
            var focusClass= this.cssPrefix+"FocusItem"
            this.horizontalContainer.children[this.index].classList.add(focusClass);
            if(this.shadowsContainer) {
                this.shadowsContainer.classList.remove("hideContainer");
                this.shadowsContainer.classList.add("showContainer");
            }
        },
        /**
         * @method  fastBackwardMove
         * support long key in backward direction.
         *  @private.
         * @param data
         */
        fastBackwardMove: function (data) {
            'use strict';
            this.previous(data,true);
        },
        /**
         * @method previous
         * Method navigates the list in right direction.
         * @param data is model item which will be used to populate the li element.This li element
         * will be appended at end of list container.
         * @param isScrollFast long key
         */
        previous: function (data,isScrollFast) {
            'use strict';
            this.model.pop();
            this.model.unshift(data);
            var listItem = this.horizontalContainer.lastChild;
            this.updateListInfo(listItem, data);
            this.updateListOnPrevious(listItem);
            this.startAnimation(false,isScrollFast);
        },
        /**
         * @method updateListOnNext
         *  update list when forward animation is requested.
         *  @private
         * @param item
         */
        updateListOnNext: function (item) {
            'use strict';
            this.horizontalContainer.removeChild(this.horizontalContainer.children[0]);
            this.horizontalContainer.appendChild(item);

        },
        /**
         * @method fastForwardMove
         * long key support for forward navigation for non-circular list.
         * @param data
         */
        fastForwardMove: function (data) {
            'use strict';
            this.next(data,true);
        },
        /**
         * @method next
         * Method which handles next action
         * @param data is model item which will be used to populate the li element.This li element
         * will be appended at start of list container.
         * @param isScrollFast long key
         */
        next: function (data,isScrollFast) {
            'use strict';
            var listItem = this.horizontalContainer.firstChild;
            this.model.shift();
            this.model.push(data);
            this.updateListInfo(listItem, data);
            this.updateListOnNext(listItem);
            this.startAnimation(true,isScrollFast);

        },
        /**
         * @method startAnimation
         * method controls the animation in forward and backward direction.
         * @param isNext
         * @param isScrollFast long key
         */
        startAnimation: function (isNext,isScrollFast) {
            'use strict';
            var targetClass, count, size = this.horizontalContainer.children.length, dir, focusInIndex,
                focusOutIndex, currentItem, animationStopped, view = this, dirKey = "", index, shadowParentNode, leftShadow,
                rightShadow;
            if (isNext) {
                focusInIndex = this.focusIndex + 1;
                focusOutIndex = focusInIndex - 1;
                dir = "Left";
                dirKey = "Next";
            } else {
                focusInIndex = this.focusIndex;
                focusOutIndex = focusInIndex + 1;
                dir = "Right";
                dirKey = "Previous";
            }
            animationStopped = function () {
                currentItem.removeEventListener("webkitAnimationEnd", animationStopped);
                view.animationStopCallback(currentItem);
            };
            if(isScrollFast &&  this.shadowsContainer){
                this.shadowsContainer.classList.remove("showContainer");
                this.shadowsContainer.classList.add("hideContainer");
            }
            for (index = 0; index < size; index++) {
                currentItem = this.horizontalContainer.children[index];
                if (!currentItem.innerHTML) {
                    currentItem.className = "horizontalEmptyLi ";
                } else {
                    count = focusInIndex + index - this.index;
                    count = count > 0 ? count : 0;
                    count = count < this.windowSize + 1 ? count : this.windowSize + 1;
                    targetClass = this.cssPrefix + dir + "_item_0" + count;
                    if (count === focusInIndex) {
                        if (this.isShadowRequired && !isScrollFast) {
                            leftShadow = this.shadowsContainer.getElementsByClassName("shadowLeft")[0];
                            rightShadow = this.shadowsContainer.getElementsByClassName("shadowRight")[0];
                            leftShadow.className = "shadowLeft shadowLeft" + dirKey;
                            rightShadow.className = "shadowRight shadowRight" + dirKey;
                            shadowParentNode = leftShadow.parentNode;
                            //code added to restart shadow animation on left and right navigation.
                            shadowParentNode.removeChild(leftShadow);
                            shadowParentNode.removeChild(rightShadow);
                            shadowParentNode.appendChild(leftShadow);
                            shadowParentNode.appendChild(rightShadow);
                        }
                        currentItem.addEventListener("webkitAnimationEnd", animationStopped);
                        targetClass = isScrollFast?targetClass:targetClass + "_focus_in";
                        this.updateFocusedItem(this.model[this.index], isScrollFast);
                    }
                    if (count === focusOutIndex) {
                        targetClass = isScrollFast?targetClass:targetClass + "_focus_out";
                    }
                    this.horizontalContainer.children[index].className = this.cssPrefix + "Li " + targetClass;
                }
            }
        },
        /**
         * @method animationStopCallback
         *  perform task on animation stop call back, can be overridden by child class.
         * @param item
         */
        animationStopCallback: function (item) {
            'use strict';
        },
        /**
         * @method nextPage
         * perform navigation in forward direction for circular list.
         * @private
         * @param data {Array}
         */
        nextPage: function (data) {
            'use strict';
            this.next(data[0],true);
        },
        /**
         * @method  previousPage
         * perform navigation in backward direction for circular list.
         * @private
         * @param data {Array}
         */
        previousPage: function (data) {
            'use strict';
            this.previous(data[0],true);
        },
        /**
         * @method isAnimationInProgress
         * used by list widget. Always returns true as user key events are not ignored in HorizontalListView.
         * @returns {boolean}
         */
        isAnimationInProgress: function () {
            'use strict';
            return false;
        },
        /**
         * @method updateFocusedItem
         * Method updates the focus element.
         * @param data
         * @param isScrollFast {Boolean} Flag to indicate whether fast navigation is being performed or not.
         */
        updateFocusedItem: function (data, isScrollFast) {
            'use strict';
        },
        /**
         * @method focus
         * Method which gives focus to the widgetContainer
         */
        focus: function () {
            'use strict';
            this.horizontalContainer.setAttribute("tabindex", 0);
            this.horizontalContainer.focus();
        },

        /**
         * @method unFocus
         *  Method which removes focus from the widgetContainer
         */
        unFocus: function () {
            'use strict';
            this.horizontalContainer.removeAttribute("tabindex");
            this.horizontalContainer.blur();
        },

        /**
         * @method dispose
         * Method which disposes the elements inside outerContainer
         */
        dispose: function () {
            'use strict';
            if (this.horizontalContainer) {
                this.horizontalContainer.innerHTML = "";
                if(this.horizontalContainer.parentNode) {
                this.horizontalContainer.parentNode.removeChild( this.horizontalContainer);
                }
            }
            this.removeShadow();
            this.config = null;
            this.index = null;
            this.focusIndex = null;
            this.horizontalContainer = null;
            this.isShadowRequired = null;
            this.cssPrefix = null;
            this.shadowsContainer = null;
        },
        /**
         * @method refresh
         * Refresh the displayed list view
         * @param data
         */
        refresh: function (data) {
            'use strict';
            this.show(data);
        },
        /**
         * @method clear
         * clears the list widget and its data.
         */
        clear: function () {
            'use strict';
            if (this.horizontalContainer) {
                this.horizontalContainer.innerHTML = "";
            }
            this.removeShadow();
        },

        /**
         * @method hide
         * clear the DOM
         */
        hide: function () {
            'use strict';
            var parentCont;
            if (this.horizontalContainer) {
                this.horizontalContainer.classList.remove("fadeInContainer");
                this.horizontalContainer.classList.add("fadeOutContainer");
            }
            this.removeShadow();
        }

    });




/* CISCO CONFIDENTIAL
 Copyright (c) 2013, Cisco Systems, Inc.
 */
/**
 * This class is responsible for the display and navigation of vertical list menu.
 */
puremvc.define({
    name: "cisco.epg.widget.listWidget.view.VerticalListView",
    /**
     * @constructor
     * @param config
     */
    constructor: function (config) {
        'use strict';
        this.config = config;
        this.widgetContainer = null;
        /*"bufferLi" is used to remove UI glitch by avoiding DOM manipulation when next animation frame(down key)
         is requested. */
        this.bufferLi = document.createElement('li');
        this.cssPrefix = this.config.cssPrefix || "verticalList_item_0";
    }
}, {

    /**
     * @method isAnimationInProgress
     * Blocks the next animation request is animation is already  in progress. As VerticalListView user key events so
     * this method always returns false.
     * @returns {boolean}
     */
    isAnimationInProgress: function () {
        'use strict';
        return false;
    },
    /**
     * @method show
     *  Displays list content.
     * @param data {Array} data array contains model item which will be used to populate the li elements .
     */
    show: function (data) {
        'use strict';
        this.performShow(data);
    },
    /**
     * @method  next
     * Navigate the list in forward direction.
     * @param item {object} item is model item which will be used to populate the li element.This li element
     * will be appended at end of list container.
     */
    next: function (item) {
        'use strict';
        this.performNext(item);
    },
    /**
     * @method   nextPage
     *  Navigate the list in forward direction when long key is pressed.
     * @param item
     */
    nextPage: function (item) {
        'use strict';
        this.performNext(item[0]);
    },
    /**
     * @method  previous
     * Navigate the list in backward direction.
     * @param item  {object} item is model item which will be used to populate the li element.This li element
     * will be appended at start of list container.
     */
    previous: function (item) {
        'use strict';
        this.performPrevious(item);
    },
    /**
     * @method previousPage
     *  Navigate the list in backward direction when long key is pressed.
     * @param item
     */
    previousPage: function (item) {
        'use strict';
        this.performPrevious(item[0]);
    },
    /**
     * @method focus
     *  focus the widget container.
     */
    focus: function () {
        'use strict';
        this.widgetContainer.setAttribute("tabindex", 0);
        this.widgetContainer.focus();
    },
    /**
     * @method unFocus
     * removes the focus from widget container.
     */
    unFocus: function () {
        'use strict';
        this.widgetContainer.removeAttribute("tabindex");
    },
    /**
     * @method  dispose
     * will be called by list widget when list.dispose is called. Method clears the container and performs cleanup job.
     */
    dispose: function () {
        'use strict';
        if (this.widgetContainer) {
            this.widgetContainer.innerHTML = "";
            if (this.widgetContainer.parentNode) {
                this.widgetContainer.parentNode.removeChild(this.widgetContainer);
            }
        }
        this.widgetContainer = null;
        this.bufferLi = null;
        this.config = null;
        this.cssPrefix = null;
    },
    /**
     * @method refresh
     * @param data
     */
    refresh: function (data) {
        'use strict';
        this.widgetContainer.innerText = "";
        this.show(data);
    },
    /**
     * @method  hide
     */
    hide: function () {
        'use strict';
        if (this.widgetContainer) {
            this.widgetContainer.classList.add("hideContainer");
        }
    },
    /**
     * @method performShow
     * @private
     * @param data
     */
    performShow: function (data) {
        'use strict';
        var li , index, size = data.length, outerContainer, itemIndex, label;
        index = this.config.highlightIndex;
        this.widgetContainer = document.getElementById(this.config.widgetContainer);
        if (!this.widgetContainer) {
            this.widgetContainer = document.createElement('ul');
            this.widgetContainer.id = this.config.widgetContainer;
        }
        this.modelSize = size;
        outerContainer = document.getElementById(this.config.outerContainer);

        for (itemIndex = 0; itemIndex < size; itemIndex++) {
            li = document.createElement('li');
            label = document.createElement("p");
            this.populateText(data[itemIndex], li, label);
            if (itemIndex < this.config.visibleItemsCount) {
                li.className = this.cssPrefix + (itemIndex + 2);
            } else {
                li.className = "verticalList_hiddenItem";
            }
            this.widgetContainer.appendChild(li);
        }
        this.widgetContainer.className = "commonVerticalListWidget";
        outerContainer.appendChild(this.widgetContainer);
    },
    /**
     * @method  populateText
     * method populates the text in given li element.
     * @param data
     * @param li
     * @param label
     */
    populateText: function (data, li, label) {
        'use strict';
    },

    /**
     * @method  removeFistItem
     * removes first item from list.
     * @private
     * @param parentContainer
     */
    removeFistItem: function (parentContainer) {
        'use strict';
        if (parentContainer.children.length > this.modelSize) {
            this.bufferLi = parentContainer.removeChild(parentContainer.children[0]);
        }
    },
    /**
     * @method performNext
     * Navigates the list in forward direction update list item with input data and performs animation .
     * @private
     * @param data
     */
    performNext: function (data) {
        'use strict';
        var li, size, label, itemIndex;
        this.removeFistItem(this.widgetContainer);
        this.widgetContainer.children[this.config.highlightIndex].className = "";
        if (this.bufferLi) {
            li = this.bufferLi;
            this.bufferLi = null;
        } else {
            li = document.createElement('li');
        }
        label = li.getElementsByTagName("p")[0];
        if (!label) {
            label = document.createElement("p");
        }
        this.populateText(data, li, label);
        this.widgetContainer.appendChild(li);
        size = this.widgetContainer.children.length;
        for (itemIndex = 0; itemIndex < size; itemIndex++) {
            if (itemIndex < this.config.visibleItemsCount) {
                this.widgetContainer.children[itemIndex].className = this.cssPrefix + (itemIndex + 1) + "_down";
            } else {
                this.widgetContainer.children[itemIndex].className = "verticalList_hiddenItem";
            }
        }
    },
    /**
     * @method performPrevious
     * Navigates the list in backward direction update list item with input data and performs animation .
     * @private
     * @param data
     */
    performPrevious: function (data) {
        'use strict';
        var li, label, itemIndex, size;
        this.removeFistItem(this.widgetContainer);
        this.widgetContainer.children[this.config.highlightIndex].className = "";
        if (this.bufferLi) {
            li = this.bufferLi;
            this.bufferLi = null;
        } else {
            li = document.createElement('li');
        }
        label = li.getElementsByTagName("p")[0];
        if (!label) {
            label = document.createElement("p");
        }
        this.populateText(data, li, label);
        this.widgetContainer.insertBefore(li, this.widgetContainer.children[0]);
        size = this.widgetContainer.children.length;
        for (itemIndex = 0; itemIndex < size; itemIndex++) {
            if (itemIndex < this.config.visibleItemsCount) {
                this.widgetContainer.children[itemIndex].className = this.cssPrefix + (itemIndex + 1) + "_up";
            } else {
                this.widgetContainer.children[itemIndex].className = "verticalList_hiddenItem";
            }
        }
        this.bufferLi = this.widgetContainer.removeChild(this.widgetContainer.lastChild);
    }

});
// CISCO CONFIDENTIAL
// Copyright (c) 2013, Cisco Systems, Inc.

cisco.epg = cisco.epg || {};
cisco.epg.widget = cisco.epg.widget || {};
cisco.epg.widget.listWidget = cisco.epg.widget.listWidget || {};

cisco.epg.widget.listWidget.ListModel = function(listener) {
    var dataArray = [];

    var compare_data = function (obj1, obj2) {
        var isSame = false;
        if ((typeof obj2) !== "object") {
            return (obj1 === obj2);
        }
        else if (obj2) {
            for (var prop in obj2) {
                if (!compare_data(obj1[prop], obj2[prop])) {
                    return false;
                }
            }
            isSame = true;
        }
        return isSame;
    };

    this.elements = function (startIndex, count) {
        var subArray = dataArray.slice(startIndex, startIndex + count);
        return subArray;
    };


    this.elementAt = function (index) {
        return  dataArray[index];
    };

    this.getFirstElement = function () {
        return dataArray[0];
    };

    this.getLastElement = function () {
        return dataArray[dataArray.length - 1];
    };

    this.prepend = function (array) {
        dataArray = array.concat(dataArray);
        listener(cisco.epg.widget.listWidget.ListWidget.ITEM_ADDED,
            {index:0, data:array});
    };


    this.append = function (array) {
        var position = dataArray.length;
        dataArray = dataArray.concat(array);
        listener(cisco.epg.widget.listWidget.ListWidget.ITEM_ADDED,
            {index:position, data:array});
    };

    this.removeElementAt = function (index) {
        var element = dataArray.splice(index, 1);
        var removedItem = element.pop();
        listener(cisco.epg.widget.listWidget.ListWidget.ITEM_REMOVED,
            {index:index, data:removedItem});
        return removedItem;
    };

    this.getSize = function () {
        return dataArray.length;
    };

    this.insertAt = function (index, array) {
        dataArray.splice.apply(dataArray, [index, 0].concat(array));
        listener(cisco.epg.widget.listWidget.ListWidget.ITEM_ADDED,
            {index:index, data:array});
    };

    this.removeAll = function () {
        dataArray = [];
        listener(cisco.epg.widget.listWidget.ListWidget.REMOVED_ALL, null);
    };

    this.indexOf = function (dataItem) {

        for(var len=0; len<dataArray.length; len+=1){
            var isEqual = compare_data(dataArray[len],dataItem);
            if(isEqual){
                return len;
            }
        }
        return -1;
    };



    this.replace = function (index, object) {
        dataArray[index] = object;
        listener(cisco.epg.widget.listWidget.ListWidget.ITEM_UPDATED,
            {index:index, data:object});
    };

};

// CISCO CONFIDENTIAL
// Copyright (c) 2013, Cisco Systems, Inc.

cisco.epg = cisco.epg || {};
cisco.epg.widget = cisco.epg.widget || {};
cisco.epg.widget.listWidget = cisco.epg.widget.listWidget || {};
cisco.epg.widget.listWidget.ListWidget = function (config) {


    var modelIndex = null;
    var listenerArray = {};
    var dataArray = [];
    var isViewCreated = false;
    var isViewShown = false;
    var pageSize = config.viewConfig.pageSize;
    var staticCircularIndexArray = [];
    var isFullContentAvailable = true;
    var staticFocusIndex = config.viewConfig.highlightIndex;
    var model, isLongKeyPressed = false, cornerFlag = false, MIN_ITEM_COUNT = 1;
    this.animationStoped = function (isNext) {
        if (isLongKeyPressed) {
            if (isNext) {
                scrollFast(config.actions.NEXT);
            } else {
                scrollFast(config.actions.PREVIOUS);
            }
        }
    };
    var view = eval("new " + config.viewClass + "(config.viewConfig,this.animationStoped)");

    var addEventListenerOnDOM = function (self, event) {
        var widgetContainer = document.getElementById(config.viewConfig.widgetContainer);
        if (widgetContainer) {
            widgetContainer.addEventListener(event, self.handleEvent, false);
        }
    };

    var removeEventListenerOnDOM = function (self, event) {
        var widgetContainer = document.getElementById(config.viewConfig.widgetContainer);
        if (widgetContainer) {
            widgetContainer.removeEventListener(event, self.handleEvent, false);
        }

    };

    var calculateNonCircularIndex = function (index) {
        var indices = {
            startIndex: null,
            endIndex: null
        };
        indices.startIndex = index - config.viewConfig.highlightIndex;
        indices.endIndex = indices.startIndex + (config.viewConfig.size - 1);
        return indices;

    };

    var calculateCircularIndex = function (index) {
        var indices = {
            startIndex: null,
            endIndex: null
        };
        var modelSize = model.getSize();
        var windowSize = config.viewConfig.size;
        var highlightIndex = config.viewConfig.highlightIndex;
        if (modelSize >= windowSize) {
            var indicesOffset = (windowSize - 1) - highlightIndex + index;
            indices.startIndex = index - highlightIndex < 0 ? modelSize + (index - highlightIndex) : index - highlightIndex;
            indices.endIndex = indicesOffset > (modelSize - 1) ? indicesOffset - modelSize : indicesOffset;
        } else {
            if ((windowSize - 1) - highlightIndex <= (modelSize - 1) - index) {
                indices.endIndex = index + (windowSize - (highlightIndex + 1));
                indices.startIndex = indices.endIndex + 1 < modelSize ? indices.endIndex + 1 : modelSize - (indices.endIndex + 1);
            } else {
                indices.startIndex = index - highlightIndex;
                if (indices.startIndex <= 0) {
                    indices.endIndex = indices.startIndex + modelSize;
                } else {
                    indices.endIndex = indices.startIndex - 1;
                }
            }
        }
        return indices;
    };


    var calculateIndex = function (index) {
        var indices = {
            startIndex: null,
            endIndex: null
        };
        if (config.circular === false) {
            indices = calculateNonCircularIndex(index);
        } else {
            indices = calculateCircularIndex(index);
        }
        return indices;
    };

    var getArrayForIndices = function (startIndex, count) {
        var indicesArray = [];
        for (var i = 0; i < count; i += 1) {
            indicesArray.push(startIndex += 1);
        }
        return indicesArray;
    };

    var prepareDataNonCircular = function (indices) {
        dataArray = [];
        var suffixCount;
        for (; indices.startIndex < 0; indices.startIndex += 1) {
            dataArray.push(null);
        }
        dataArray = dataArray.concat(model.elements(indices.startIndex, indices.endIndex - indices.startIndex + 1));

        if (dataArray.length < config.viewConfig.size) {
            suffixCount = config.viewConfig.size - dataArray.length;
            for (var idx = 0; idx < suffixCount; idx += 1) {
                dataArray.push(null);
            }
        }
    };

    var prepareDataCircular = function (indices) {
        dataArray = [];
        var suffixCount, idx;
        var modelSize = model.getSize();
        var windowSize = config.viewConfig.size;
        var highlightIndex = config.viewConfig.highlightIndex;

        for (; indices.startIndex < 0; indices.startIndex += 1) {
            dataArray.push(null);
            if (isFullContentAvailable) {
                staticCircularIndexArray.push(null);
            }
        }

        if (indices.startIndex > indices.endIndex) {
            dataArray = dataArray.concat(model.elements(indices.startIndex, (model.getSize()) - indices.startIndex));
            dataArray = dataArray.concat(model.elements(0, indices.endIndex + 1));
            if (isFullContentAvailable) {
                staticCircularIndexArray = staticCircularIndexArray.concat(getArrayForIndices(indices.startIndex, (model.getSize()) - indices.startIndex));
                staticCircularIndexArray = staticCircularIndexArray.concat(getArrayForIndices(0, indices.endIndex + 1));
            }
        } else {
            dataArray = dataArray.concat(model.elements(indices.startIndex, indices.endIndex - indices.startIndex + 1));
        }

        suffixCount = (windowSize - 1) - highlightIndex - (modelSize - 1) - modelIndex;
        for (idx = 0; idx < suffixCount; idx += 1) {
            dataArray.unshift(null);
            if (isFullContentAvailable) {
                staticCircularIndexArray.unshift(null);
            }
        }

        if (dataArray.length < config.viewConfig.size) {
            suffixCount = config.viewConfig.size - dataArray.length;
            for (idx = 0; idx < suffixCount; idx += 1) {
                dataArray.push(null);
                if (isFullContentAvailable) {
                    staticCircularIndexArray.push(null);
                }
            }
        }
    };

    var prepareData = function () {
        isFullContentAvailable = false;
        var indices = calculateIndex(modelIndex);
        if (config.circular === false) {
            prepareDataNonCircular(indices);
        } else {
            isFullContentAvailable = config.viewConfig.size > model.getSize() ? true : false;
            prepareDataCircular(indices);
        }
    };

    var notify = function (eventType, context) {
        var event = {};
        event.type = eventType;
        event.context = context;
        event.id = config.id;
        if (listenerArray[eventType]) {
            listenerArray[eventType].handleEvent(event);
        }
    };

    var itemAdded = function (eventContext) {
        var indices = calculateIndex(modelIndex);
        var addedIndex = eventContext.index;
        var data = eventContext.data;
        if ((model.getSize() >= config.viewConfig.size) && indices.startIndex < addedIndex && indices.endIndex > addedIndex) {
            if (addedIndex < modelIndex) {
                modelIndex++;
            }
            prepareData();
            view.refresh(dataArray);
        } else if (indices.startIndex == addedIndex) {
            modelIndex++;
            prepareData();
            view.refresh(dataArray);
        } else if (indices.endIndex == addedIndex) {
            prepareData();
            view.refresh(dataArray);
        } else if ((model.getSize() != config.viewConfig.size) && (indices.startIndex > addedIndex || indices.endIndex < addedIndex)) {
            if (addedIndex < modelIndex) {
                modelIndex++;
            }
        }
        notify(cisco.epg.widget.listWidget.ListWidget.ITEM_ADDED, eventContext);
    };

    var removeAll = function () {
        view.clear();
        modelIndex = null;
        notify(cisco.epg.widget.listWidget.ListWidget.REMOVED_ALL, null);
    };

    var itemRemoved = function (eventContext) {
        var deletedIndex = eventContext.index;
        var indices = calculateIndex(modelIndex);
        if ((model.getSize() >= config.viewConfig.size) && indices.startIndex < deletedIndex && indices.endIndex > deletedIndex) {
            if (deletedIndex < modelIndex) {
                modelIndex--;
            }
            prepareData();
            view.refresh(dataArray);
        } else if (indices.startIndex == deletedIndex) {
            modelIndex--;
            prepareData();
            view.refresh(dataArray);
        } else if (indices.endIndex == deletedIndex) {
            prepareData();
            view.refresh(dataArray);
        } else if ((model.getSize() != config.viewConfig.size) && (indices.startIndex > deletedIndex || indices.endIndex < deletedIndex)) {
            if (deletedIndex < modelIndex) {
                modelIndex--;
            }
        }
        notify(cisco.epg.widget.listWidget.ListWidget.ITEM_REMOVED, eventContext);
    };

    var itemUpdated = function (eventContext) {
        if (isViewCreated && view.update) {
            var updatedModelIndex = eventContext.index;
            var indices = calculateIndex(modelIndex);
            var updateIndex;
            if (indices.startIndex <= indices.endIndex && indices.startIndex <= updatedModelIndex && updatedModelIndex <= indices.endIndex) {
                updateIndex = updatedModelIndex - indices.startIndex;
                view.update(updateIndex, eventContext.data);
            } else if (config.circular === true && indices.startIndex >= indices.endIndex) {
                if (indices.startIndex <= updatedModelIndex) {
                    updateIndex = updatedModelIndex - indices.startIndex;
                    view.update(updateIndex, eventContext.data);
                } else if (updatedModelIndex <= indices.endIndex) {
                    updateIndex = ( model.getSize() - indices.startIndex) + updatedModelIndex;
                    view.update(updateIndex, eventContext.data);
                }
            }
        } else if (isViewCreated && view.refresh) {
            //TODO : This code is for backward compatibility once all the screens view supports update method we can remove this code
            var updatedIndex = eventContext.index;
            var indices = calculateIndex(modelIndex);
            if (isViewCreated && indices.startIndex <= indices.endIndex && indices.startIndex <= updatedIndex && updatedIndex <= indices.endIndex) {
                prepareData();
                view.refresh(dataArray);
            } else if (config.circular === true && isViewCreated && indices.startIndex >= indices.endIndex && ((indices.startIndex <= updatedIndex && updatedIndex <= model.getSize()) || (0 <= updatedIndex && updatedIndex <= indices.endIndex))) {
                prepareData();
                view.refresh(dataArray);
            }
        }
        notify(cisco.epg.widget.listWidget.ListWidget.ITEM_UPDATED, eventContext);
    };

    var listener = function (eventType, eventContext) {
        if (modelIndex !== null) {
            switch (eventType) {
                case cisco.epg.widget.listWidget.ListWidget.ITEM_ADDED:
                    itemAdded(eventContext);
                    break;

                case cisco.epg.widget.listWidget.ListWidget.REMOVED_ALL:
                    removeAll(eventContext);
                    break;

                case cisco.epg.widget.listWidget.ListWidget.ITEM_REMOVED:
                    itemRemoved(eventContext);
                    break;

                case cisco.epg.widget.listWidget.ListWidget.ITEM_UPDATED:
                    itemUpdated(eventContext);
                    break;

                default:
                    break;
            }
        }
    };

    model = new cisco.epg.widget.listWidget.ListModel(listener);


    this.getModel = function () {
        return model;
    };

    this.setSelectedIndex = function (index) {
        modelIndex = index;
        prepareData();
        if (isViewCreated) {
            view.refresh(dataArray);
            notify(cisco.epg.widget.listWidget.ListWidget.SELECTION_CHANGE, model.elementAt(modelIndex));
        }
    };

    this.show = function () {

        if (!isViewShown) {
            view.show(dataArray);
            isViewCreated = true;
            isViewShown = true;
            notify(cisco.epg.widget.listWidget.ListWidget.SHOWN, model.elementAt(modelIndex));
        }
    };

    this.addEventListener = function (eventType, handler) {
        listenerArray[eventType] = handler;
    };

    this.removeEventListener = function (eventType, handler) {
        delete listenerArray[eventType];
    };

    this.getSelectedIndex = function () {
        return modelIndex;
    };

    this.focus = function () {
        view.focus();
        addEventListenerOnDOM(this, config.actions.PREVIOUS);
        addEventListenerOnDOM(this, config.actions.NEXT);
        if (config.actions.LONG_KEY_EVENT) {
            addEventListenerOnDOM(this, config.actions.PREVIOUS + "_LONG");
            addEventListenerOnDOM(this, config.actions.NEXT + "_LONG");

        }
        notify(cisco.epg.widget.listWidget.ListWidget.FOCUS_GAINED, null);
    };

    this.unFocus = function () {
        view.unFocus();
        removeEventListenerOnDOM(this, config.actions.PREVIOUS);
        removeEventListenerOnDOM(this, config.actions.NEXT);
        if (config.actions.LONG_KEY_EVENT) {
            removeEventListenerOnDOM(this, config.actions.PREVIOUS + "_LONG");
            removeEventListenerOnDOM(this, config.actions.NEXT + "_LONG");
        }
        notify(cisco.epg.widget.listWidget.ListWidget.FOCUS_LOST, null);
    };

    this.hide = function () {
        if (isViewCreated) {
            view.hide();
            isViewShown = false;
            notify(cisco.epg.widget.listWidget.ListWidget.HIDDEN, null);
        }
    };

    this.dispose = function () {
        model = null;
        removeEventListenerOnDOM(this, config.actions.PREVIOUS);
        removeEventListenerOnDOM(this, config.actions.NEXT);
        if (config.actions.LONG_KEY_EVENT) {
            removeEventListenerOnDOM(this, config.actions.PREVIOUS + "_LONG");
            removeEventListenerOnDOM(this, config.actions.NEXT + "_LONG");
        }
        view.dispose();
        isViewCreated = false;
        isViewShown = false;
        view = null;
    };

    var getNextPageData = function (newModelIndex, indices, isNext) {
        var nextIndices = calculateIndex(newModelIndex + pageSize);
        var indices = {
            startIndex: indices.endIndex,
            endIndex: nextIndices.endIndex - 1
        };
        var dataArrayPage = [];
        if (indices.startIndex > indices.endIndex) {

            dataArrayPage = dataArrayPage.concat(model.elements(indices.startIndex, (model.getSize()) - indices.startIndex));
            dataArrayPage = dataArrayPage.concat(model.elements(0, indices.endIndex + 1));

        } else {
            dataArrayPage = dataArrayPage.concat(model.elements(indices.startIndex, (indices.endIndex - indices.startIndex) + 1));
        }
        return dataArrayPage;
    };

    var getPreviousPageData = function (newModelIndex, indices, isNext) {
        var nextIndices = calculateIndex(newModelIndex - pageSize);
        var indices = {
            startIndex: indices.startIndex,
            endIndex: nextIndices.startIndex + 1
        };
        var dataArrayPage = [];
        if (indices.startIndex < indices.endIndex) {

            dataArrayPage = dataArrayPage.concat(model.elements(indices.endIndex, (model.getSize()) - indices.endIndex));
            dataArrayPage = dataArrayPage.concat(model.elements(0, indices.startIndex + 1));

        } else {
            dataArrayPage = dataArrayPage.concat(model.elements(indices.endIndex, (indices.startIndex - indices.endIndex) + 1));
        }

        return dataArrayPage;
    };

    var next = function (isScrollFast) {
        if (model && model.getSize() <= MIN_ITEM_COUNT) {
            notify(cisco.epg.widget.listWidget.ListWidget.AT_END, null);
            return;
        }
        if (view && view.isAnimationInProgress && view.isAnimationInProgress()) {
            return;
        }
        if (config.circular === false) {
            var indices = calculateIndex(modelIndex + 1);
            var element = model.elementAt(indices.endIndex);
            element = (element !== undefined) ? element : null;
            if (model.elementAt(modelIndex + 1) !== undefined) {
                if (isScrollFast) {
                    view.fastForwardMove(element);
                } else {
                    view.next(element);
                }
                modelIndex += 1;
                cornerFlag = false;
                notify(cisco.epg.widget.listWidget.ListWidget.SELECTION_CHANGE, model.elementAt(modelIndex));
            } else {
                if (isLongKeyPressed && view && view.longKeyReleased && model.getSize() > 1 && !cornerFlag) {
                    view.longKeyReleased();
                }
                cornerFlag = true;
                notify(cisco.epg.widget.listWidget.ListWidget.AT_END, null);
            }

        } else {
            if (isFullContentAvailable) {
                var nextDataIndex = staticFocusIndex + (config.viewConfig.size - config.viewConfig.highlightIndex);
                var absoluteNextMdlIndex = staticCircularIndexArray[nextDataIndex];
                var element = absoluteNextMdlIndex !== undefined && model.elementAt(absoluteNextMdlIndex) !== undefined ? model.elementAt(absoluteNextMdlIndex) : null;
                if (model.elementAt(staticCircularIndexArray[staticFocusIndex + 1]) !== undefined) {
                    if (isScrollFast) {
                        view.getNextPageData(element);
                    } else {
                        view.next(element);
                    }
                    staticFocusIndex = staticFocusIndex + 1;
                    modelIndex = staticCircularIndexArray[staticFocusIndex];
                    notify(cisco.epg.widget.listWidget.ListWidget.SELECTION_CHANGE, model.elementAt(modelIndex));
                } else {
                    notify(cisco.epg.widget.listWidget.ListWidget.AT_END, null);
                }
            } else {
                var newModelIndex = modelIndex + 1 < model.getSize() ? modelIndex + 1 : 0;
                var indices = calculateIndex(newModelIndex);
                var element = model.elementAt(indices.endIndex);
                if (model.elementAt(newModelIndex) !== undefined) {
                    if (isScrollFast) {
                        var dataArrayPage = getNextPageData(newModelIndex, indices, true);
                        view.nextPage(dataArrayPage);
                        newModelIndex = modelIndex + pageSize < model.getSize() ? modelIndex + pageSize : (modelIndex + pageSize - model.getSize());
                    } else {
                        view.next(element);
                    }
                    modelIndex = newModelIndex;
                    notify(cisco.epg.widget.listWidget.ListWidget.SELECTION_CHANGE, model.elementAt(modelIndex));
                }
            }

        }
    };

    var previous = function (isScrollFast) {
        if (model && model.getSize() <= MIN_ITEM_COUNT) {
            notify(cisco.epg.widget.listWidget.ListWidget.AT_BEGIN, null);
            return;
        }
        if (view && view.isAnimationInProgress && view.isAnimationInProgress()) {
            return;
        }
        if (config.circular === false) {
            var indices = calculateIndex(modelIndex - 1);
            var element = model.elementAt(indices.startIndex);
            element = (element !== undefined) ? element : null;
            if (model.elementAt(modelIndex - 1) !== undefined) {
                if (isScrollFast) {
                    view.fastBackwardMove(element);
                } else {
                    view.previous(element);
                }
                modelIndex -= 1;
                cornerFlag = false;
                notify(cisco.epg.widget.listWidget.ListWidget.SELECTION_CHANGE, model.elementAt(modelIndex));
            } else {
                if (isLongKeyPressed && view && view.longKeyReleased && model.getSize() > 1 && !cornerFlag) {
                    view.longKeyReleased();
                }
                cornerFlag = true;
                notify(cisco.epg.widget.listWidget.ListWidget.AT_BEGIN, null);
            }
        } else {
            if (isFullContentAvailable) {
                var prevDataIndex = staticFocusIndex - (config.viewConfig.highlightIndex + 1);
                var absolutePrevMdlIndex = staticCircularIndexArray[prevDataIndex];
                var element = absolutePrevMdlIndex !== undefined && model.elementAt(absolutePrevMdlIndex) !== undefined ? model.elementAt(absolutePrevMdlIndex) : null;
                if (model.elementAt(staticCircularIndexArray[staticFocusIndex - 1]) !== undefined) {
                    if (isScrollFast) {
                        view.previousPage(element);
                    } else {
                        view.previous(element);
                    }
                    staticFocusIndex = staticFocusIndex - 1;
                    modelIndex = staticCircularIndexArray[staticFocusIndex];
                    notify(cisco.epg.widget.listWidget.ListWidget.SELECTION_CHANGE, model.elementAt(modelIndex));
                } else {
                    notify(cisco.epg.widget.listWidget.ListWidget.AT_BEGIN, null);
                }
            } else {
                var newModelIndex = modelIndex - 1 < 0 ? model.getSize() - 1 : modelIndex - 1;
                var indices = calculateIndex(newModelIndex);
                var element = model.elementAt(indices.startIndex);
                if (model.elementAt(newModelIndex) !== undefined) {
                    if (isScrollFast) {
                        var dataArrayPage = getPreviousPageData(newModelIndex, indices);
                        view.previousPage(dataArrayPage);
                        newModelIndex = modelIndex - pageSize >= 0 ? modelIndex - pageSize : (model.getSize() + modelIndex - pageSize );
                    } else {
                        view.previous(element);
                    }
                    modelIndex = newModelIndex;
                    notify(cisco.epg.widget.listWidget.ListWidget.SELECTION_CHANGE, model.elementAt(modelIndex));
                }
            }

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


    this.handleEvent = function (event) {
        switch (event.type) {
            case config.actions.NEXT + "_LONG":
                isLongKeyPressed = true;
                if (event.detail.state.toUpperCase() === "RELEASE") {
                    isLongKeyPressed = false;
                    if (view && view.longKeyReleased && model.getSize() > 1 && !cornerFlag) {
                        view.longKeyReleased()
                    }
                } else {
                    scrollFast(config.actions.NEXT);
                }
                break;
            case config.actions.PREVIOUS + "_LONG":
                isLongKeyPressed = true;
                if (event.detail.state.toUpperCase() === "RELEASE") {
                    isLongKeyPressed = false;
                    if (view && view.longKeyReleased && model.getSize() > 1 && !cornerFlag) {
                        view.longKeyReleased()
                    }
                } else {
                    scrollFast(config.actions.PREVIOUS);
                }
                break;
            case config.actions.NEXT:
                next(false);
                break;
            case config.actions.PREVIOUS:
                previous(false);
                break;
        }
    };

}
;


cisco.epg.widget.listWidget.ListWidget.SHOWN = "SHOWN";
cisco.epg.widget.listWidget.ListWidget.HIDDEN = "HIDDEN";
cisco.epg.widget.listWidget.ListWidget.FOCUS_GAINED = "FOCUS_GAINED";
cisco.epg.widget.listWidget.ListWidget.FOCUS_LOST = "FOCUS_LOST";
cisco.epg.widget.listWidget.ListWidget.SELECTION_CHANGE = "SELECTION_CHANGE";
cisco.epg.widget.listWidget.ListWidget.AT_END = "AT_END";
cisco.epg.widget.listWidget.ListWidget.AT_BEGIN = "AT_BEGIN";

cisco.epg.widget.listWidget.ListWidget.ITEM_ADDED = "ITEM_ADDED";
cisco.epg.widget.listWidget.ListWidget.ITEM_REMOVED = "ITEM_REMOVED";
cisco.epg.widget.listWidget.ListWidget.ITEM_UPDATED = "ITEM_UPDATED";
cisco.epg.widget.listWidget.ListWidget.REMOVED_ALL = "REMOVED_ALL";