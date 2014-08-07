cisco.extend(window.cisco,{"epg":{"widget":{"list":{"ListWidgetConfig":{"capacity":"undefined","viewClass":"undefined","circular":false,"viewConfig":{"size":"undefined","highlightIndex":"undefined","outerContainer":"undefined","widgetContainer":"undefined","orientation":"horizontal","template":"defaultListTemplateForHub","highlightStrategy":"cisco.epg.widget.list.strategy.highlight.NullStrategy","alignmentStrategy":"cisco.epg.widget.list.strategy.align.NullStrategy","transformationStrategy":"cisco.epg.widget.list.strategy.transform.NullStrategy","transitionDuration":450,"layoutStrategy":"cisco.epg.widget.list.strategy.layout.NullStrategy","selectionStrategy":"cisco.epg.widget.list.strategy.selection.NullStrategy"},"actions":{"NEXT":"ACTION_RIGHT","PREVIOUS":"ACTION_LEFT"}}}}}});
// CISCO CONFIDENTIAL
// Copyright (c) 2013, Cisco Systems, Inc.

cisco.declare("cisco.epg.widget.list");

cisco.epg.widget.list.ListModel = function(listener) {
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
    this.forwardResAwaited=false;
    this.backwardResAwaited=false;

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
        listener(cisco.epg.widget.list.ListWidget.ITEM_ADDED,
            {index:0, data:array,direction:cisco.epg.widget.list.ListWidget.BACKWARD_DIRECTION});
    };


    this.append = function (array) {
        var position = dataArray.length;
        dataArray = dataArray.concat(array);
        listener(cisco.epg.widget.list.ListWidget.ITEM_ADDED,
            {index:position, data:array,direction:cisco.epg.widget.list.ListWidget.FORWARD_DIRECTION});
    };

    this.removeElementAt = function (index) {
        var element = dataArray.splice(index, 1);
        listener(cisco.epg.widget.list.ListWidget.ITEM_REMOVED,
            {index:index, data:element.pop()});
    };

    this.getSize = function () {
        return dataArray.length;
    };

    this.insertAt = function (index, array) {
        dataArray.splice.apply(dataArray, [index, 0].concat(array));
        listener(cisco.epg.widget.list.ListWidget.ITEM_ADDED,
            {index:index, data:array});
    };

    this.removeAll = function () {
        dataArray = [];
        listener(cisco.epg.widget.list.ListWidget.REMOVED_ALL, null);
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
        listener(cisco.epg.widget.list.ListWidget.ITEM_UPDATED,
            {index:index, data:object});
    };
    /**
     * fetch data
     * @method fetchData
     * @param pageContext
     *
     */

    this.fetchData = function(pageContext){
        listener(cisco.epg.widget.list.ListWidget.NEED_DATA,
            {page: pageContext}
        );
    };
};

// CISCO CONFIDENTIAL
// Copyright (c) 2013, Cisco Systems, Inc.

cisco.declare("cisco.epg.widget.list");

cisco.epg.widget.list.ListWidget = function (config) {


    var modelIndex = null;
    var listenerArray = {};
    var dataArray = [];
    var isViewCreated = false;
    var isViewShown = false;
    var pageSize = config.viewConfig.pageSize;
    //updating min capacity value to support smooth scroll
    if ((config.viewConfig.size * 4) < config.capacity) {
        config.capacity = config.viewConfig.size * 4;
    }
    //providing option to configure minBufferSize as config option later.
    var minBufferSize = config.viewConfig.size;
    var staticCircularIndexArray = [];
    var isFullContentAvailable = true;
    var staticFocusIndex = config.viewConfig.highlightIndex;
    var model, isLongKeyPressed = false;
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
        var elementId = (config.viewConfig.eventRoot) ? config.viewConfig.eventRoot : config.viewConfig.widgetContainer;
        var eventRoot = document.getElementById(elementId);
        if (eventRoot) {
            eventRoot.addEventListener(event, self.handleEvent, false);
        }
    };

    var removeEventListenerOnDOM = function (self, event) {
        var elementId = (config.viewConfig.eventRoot) ? config.viewConfig.eventRoot : config.viewConfig.widgetContainer;
        var eventRoot = document.getElementById(elementId);
        if (eventRoot) {
            eventRoot.removeEventListener(event, self.handleEvent, false);
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
                //means no null on right
                indices.endIndex = index + (windowSize - (highlightIndex + 1));
                indices.startIndex = indices.endIndex + 1 < modelSize ? indices.endIndex + 1 : modelSize - (indices.endIndex + 1);
            } else {
                //means null on right
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
        var suffixCount;
        var idx;

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
            //            dataArray.push(null);
            if (isFullContentAvailable) {
                staticCircularIndexArray.unshift(null);
                //                staticCircularIndexArray.push(null);
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

    var checkAndFetchData = function (event) {
        var fetch = false, pageContex,
            cloneEvt = JSON.parse(JSON.stringify(event)),
            cloneCtx = cloneEvt.context,
            forward = (cloneCtx.direction === cisco.epg.widget.list.ListWidget.FORWARD_DIRECTION),
            backward = (cloneCtx.direction === cisco.epg.widget.list.ListWidget.BACKWARD_DIRECTION);
        if (cloneCtx.direction) {
            if (forward) {
                var skipIndex = model.getSize() - cloneCtx.modelIndex;
                if (skipIndex < minBufferSize) {
                    cloneCtx.skipIndex = skipIndex;
                    fetch = true;
                }
            } else if (cloneCtx.modelIndex < minBufferSize) {
                cloneCtx.skipIndex = cloneCtx.modelIndex + 1;
                fetch = true;
            }
        }
        if (fetch) {
            var directionFetch = false;
            if ((forward && !model.forwardResAwaited)) {
                model.forwardResAwaited = true;
                directionFetch = true;
            } else if (backward && !model.backwardResAwaited) {
                model.backwardResAwaited = true;
                directionFetch = true;
            }
            if (directionFetch) {
                pageContex = {
                    direction: cloneCtx.direction,
                    item: cloneCtx.fetchItem,
                    count: minBufferSize * 2,
                    skipIndex: cloneCtx.skipIndex,
                    id: cloneEvt.id,
                    data: null,
                    status: null
                }
                model.fetchData(pageContex);
            }
        }
    }

    var notify = function (eventType, context) {
        var event = {
            type: eventType,
            context: context,
            id: config.id
        };
        if (eventType === cisco.epg.widget.list.ListWidget.SELECTION_CHANGE) {
            checkAndFetchData(event);
        }
        if (listenerArray[eventType]) {
            listenerArray[eventType].handleEvent(event);
        }
    };

    var removeItems = function (removeCount, position) {
        var index, i;
        for (i = 0; i < removeCount; i++) {
            index = 0;
            if (position === cisco.epg.widget.list.ListWidget.AT_END) {
                index = model.getSize() - 1;
            }
            model.removeElementAt(index);
        }
    }

    var itemAdded = function (eventContext) {
        var addedIndex = eventContext.index;
        var data = eventContext.data;
        var direction = eventContext.direction;
        var indices = calculateIndex(modelIndex);
        var i, removeCount;

        if (addedIndex <= modelIndex) {
            modelIndex += data.length;
        }
        if (direction === cisco.epg.widget.list.ListWidget.BACKWARD_DIRECTION) {
            if (modelIndex > 3 * minBufferSize) {
                removeCount = 3 * minBufferSize - (modelIndex + 1);
                removeItems(removeCount, cisco.epg.widget.list.ListWidget.AT_BEGIN);
            }
            if ((model.getSize() - config.capacity) > 0) {
                removeCount = model.getSize() - config.capacity;
                removeItems(removeCount, cisco.epg.widget.list.ListWidget.AT_END);
            }
        }

        if(direction === cisco.epg.widget.list.ListWidget.FORWARD_DIRECTION){
            if((model.getSize() - modelIndex) > 3 * minBufferSize){
                removeCount = (model.getSize() - modelIndex) - 3 * minBufferSize;
                removeItems(removeCount, cisco.epg.widget.list.ListWidget.AT_END);
            }
            if (modelIndex > minBufferSize) {
                removeCount = modelIndex - minBufferSize;
                removeItems(removeCount, cisco.epg.widget.list.ListWidget.AT_BEGIN);

            }
        }

        if (isViewCreated && indices.startIndex <= indices.endIndex && indices.startIndex <= addedIndex && addedIndex <= indices.endIndex) {
            prepareData();
            view.refresh(dataArray);
        }
        else if (config.circular === true && isViewCreated && indices.startIndex >= indices.endIndex && ((indices.startIndex <= addedIndex && addedIndex <= model.getSize()) || (0 <= addedIndex && addedIndex <= indices.endIndex))) {
            prepareData();
            view.refresh(dataArray);
        }
        notify(cisco.epg.widget.list.ListWidget.ITEM_ADDED, eventContext);
    };

    var removeAll = function () {
        view.clear();
        modelIndex = null;
        notify(cisco.epg.widget.list.ListWidget.REMOVED_ALL, null);
    };

    var itemRemoved = function (eventContext) {
        var deletedIndex = eventContext.index;
        var indices = calculateIndex(modelIndex);
        if (deletedIndex < modelIndex) {
            modelIndex -= 1;
        }
        if (isViewCreated && indices.startIndex <= indices.endIndex && indices.startIndex <= deletedIndex && deletedIndex <= indices.endIndex) {
            prepareData();
            view.refresh(dataArray);
        } else if (config.circular === true && isViewCreated && indices.startIndex >= indices.endIndex && ((indices.startIndex <= deletedIndex && deletedIndex <= model.getSize()) || (0 <= deletedIndex && deletedIndex <= indices.endIndex))) {
            prepareData();
            view.refresh(dataArray);
        }
        notify(cisco.epg.widget.list.ListWidget.ITEM_REMOVED, eventContext);
    };

    var itemUpdated = function (eventContext) {
        var updatedIndex = eventContext.index;
        var indices = calculateIndex(modelIndex);
        if (isViewCreated && indices.startIndex <= indices.endIndex && indices.startIndex <= updatedIndex && updatedIndex <= indices.endIndex) {
            prepareData();
            view.refresh(dataArray);
        } else if (config.circular === true && isViewCreated && indices.startIndex >= indices.endIndex && ((indices.startIndex <= updatedIndex && updatedIndex <= model.getSize()) || (0 <= updatedIndex && updatedIndex <= indices.endIndex))) {
            prepareData();
            view.refresh(dataArray);
        }
        notify(cisco.epg.widget.list.ListWidget.ITEM_UPDATED, eventContext);
    };

    var needData = function (eventContext) {
        notify(cisco.epg.widget.list.ListWidget.NEED_DATA, eventContext);
    };

    var listener = function (eventType, eventContext) {
        if (modelIndex !== null) {
            switch (eventType) {
                case cisco.epg.widget.list.ListWidget.ITEM_ADDED:
                    itemAdded(eventContext);
                    break;

                case cisco.epg.widget.list.ListWidget.REMOVED_ALL:
                    removeAll(eventContext);
                    break;

                case cisco.epg.widget.list.ListWidget.ITEM_REMOVED:
                    itemRemoved(eventContext);
                    break;

                case cisco.epg.widget.list.ListWidget.ITEM_UPDATED:
                    itemUpdated(eventContext);
                    break;

                case cisco.epg.widget.list.ListWidget.NEED_DATA:
                    needData(eventContext);
                    break;

                default:
                    break;
            }
        }
    };

    model = new cisco.epg.widget.list.ListModel(listener);


    this.getModel = function () {
        return model;
    };
    /**
     * set data in model
     * @method setData
     * @param page -page details
     */
    this.setData = function (page) {
        if (model.getSize() > 0 && page.direction === undefined) {
            model.removeAll();
        }
        if (page.data === null || page.data === undefined) {
            if (page.direction === cisco.epg.widget.list.ListWidget.BACKWARD_DIRECTION) {
                model.backwardResAwaited = false;
            } else {
                model.forwardResAwaited = false;
            }
            return;
        }

        if (page.direction === cisco.epg.widget.list.ListWidget.BACKWARD_DIRECTION) {
            model.prepend(page.data);
            model.backwardResAwaited = false;
        }
        else {
            model.append(page.data);
            model.forwardResAwaited = false;
        }
    };

    this.setSelectedIndex = function (index) {
        modelIndex = index;
        prepareData();
        if (isViewCreated) {
            view.refresh(dataArray);
            notify(cisco.epg.widget.list.ListWidget.SELECTION_CHANGE, {modelIndex: modelIndex, item: model.elementAt(modelIndex)});
        }
    };

    this.show = function () {

        if (!isViewShown) {
            view.show(dataArray);
            isViewCreated = true;
            isViewShown = true;
            notify(cisco.epg.widget.list.ListWidget.SHOWN, {modelIndex:modelIndex,item:model.elementAt(modelIndex)});
        }
    };

    this.addEventListener = function (eventType, handler) {
        listenerArray[eventType] = handler;
    };

    this.getSelectedIndex = function () {
        return modelIndex;
    };

    this.focus = function () {
        view.focus();
        addEventListenerOnDOM(this, config.actions.PREVIOUS);
        addEventListenerOnDOM(this, config.actions.NEXT);
        if (config.actions.SELECTION)
            addEventListenerOnDOM(this, config.actions.SELECTION);
        if (config.actions.LONG_KEY_EVENT) {
            addEventListenerOnDOM(this, config.actions.PREVIOUS + "_LONG");
            addEventListenerOnDOM(this, config.actions.NEXT + "_LONG");
        }
        notify(cisco.epg.widget.list.ListWidget.FOCUS_GAINED, null);
    };

    this.unFocus = function () {
        view.unFocus();
        removeEventListenerOnDOM(this, config.actions.PREVIOUS);
        removeEventListenerOnDOM(this, config.actions.NEXT);
        if (config.actions.SELECTION)
            removeEventListenerOnDOM(this, config.actions.SELECTION);
        if (config.actions.LONG_KEY_EVENT) {
            removeEventListenerOnDOM(this, config.actions.PREVIOUS + "_LONG");
            removeEventListenerOnDOM(this, config.actions.NEXT + "_LONG");
        }
        notify(cisco.epg.widget.list.ListWidget.FOCUS_LOST, null);
    };

    this.hide = function () {
        if (isViewCreated) {
            view.hide();
            isViewShown = false;
            notify(cisco.epg.widget.list.ListWidget.HIDDEN, null);
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
            startIndex: indices.endIndex, //+ 1,
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
                notify(cisco.epg.widget.list.ListWidget.SELECTION_CHANGE, {modelIndex:modelIndex,
                    item:model.elementAt(modelIndex), fetchItem: model.getLastElement(),
                    direction:cisco.epg.widget.list.ListWidget.FORWARD_DIRECTION});
            } else {
                notify(cisco.epg.widget.list.ListWidget.AT_END, null);
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
                    notify(cisco.epg.widget.list.ListWidget.SELECTION_CHANGE, {modelIndex:modelIndex,
                        item:model.elementAt(modelIndex),fetchItem: model.getLastElement(),
                        direction:cisco.epg.widget.list.ListWidget.FORWARD_DIRECTION});
                } else {
                    notify(cisco.epg.widget.list.ListWidget.AT_END, null);
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
                    notify(cisco.epg.widget.list.ListWidget.SELECTION_CHANGE, {modelIndex:modelIndex,
                        item:model.elementAt(modelIndex),fetchItem: model.getLastElement(),
                        direction:cisco.epg.widget.list.ListWidget.FORWARD_DIRECTION});
                }
            }

        }
    };

    var previous = function (isScrollFast) {
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
                notify(cisco.epg.widget.list.ListWidget.SELECTION_CHANGE, {modelIndex:modelIndex,
                    item:model.elementAt(modelIndex), fetchItem: model.getFirstElement(),
                    direction:cisco.epg.widget.list.ListWidget.BACKWARD_DIRECTION});
            } else {
                notify(cisco.epg.widget.list.ListWidget.AT_BEGIN, null);
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
                    notify(cisco.epg.widget.list.ListWidget.SELECTION_CHANGE, {modelIndex:modelIndex,
                        item:model.elementAt(modelIndex),fetchItem: model.getFirstElement(),
                        direction:cisco.epg.widget.list.ListWidget.BACKWARD_DIRECTION});
                } else {
                    notify(cisco.epg.widget.list.ListWidget.AT_BEGIN, null);
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

                        //newModelIndex=newModelIndex>0?newModelIndex1:newModelIndex;
                    } else {
                        view.previous(element);
                    }
                    modelIndex = newModelIndex;
                    notify(cisco.epg.widget.list.ListWidget.SELECTION_CHANGE, {modelIndex:modelIndex,
                        item:model.elementAt(modelIndex),fetchItem: model.getFirstElement(),
                        direction:cisco.epg.widget.list.ListWidget.BACKWARD_DIRECTION});
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

    var selection = function () {
        view.selectItem();
        notify(cisco.epg.widget.list.ListWidget.ITEM_SELECTED, {modelIndex: modelIndex, item: model.elementAt(modelIndex)});
    };

    this.handleEvent = function (event) {
        switch (event.type) {
            case config.actions.NEXT + "_LONG":
                isLongKeyPressed = true;
                if (event.detail.state.toUpperCase() === "RELEASE") {
                    isLongKeyPressed = false;
                    next(false);
                }

                scrollFast(config.actions.NEXT);
                break;
            case config.actions.PREVIOUS + "_LONG":
                isLongKeyPressed = true;
                if (event.detail.state.toUpperCase() === "RELEASE") {
                    isLongKeyPressed = false;
                    previous(false);
                }
                scrollFast(config.actions.PREVIOUS);
                break;
            case config.actions.NEXT:
                next(false);
                break;
            case config.actions.PREVIOUS:
                previous(false);
                break;
            case config.actions.SELECTION:
                selection();
                break;
        }
    };
};


cisco.epg.widget.list.ListWidget.SHOWN = "SHOWN";
cisco.epg.widget.list.ListWidget.HIDDEN = "HIDDEN";
cisco.epg.widget.list.ListWidget.FOCUS_GAINED = "FOCUS_GAINED";
cisco.epg.widget.list.ListWidget.FOCUS_LOST = "FOCUS_LOST";
cisco.epg.widget.list.ListWidget.SELECTION_CHANGE = "SELECTION_CHANGE";
cisco.epg.widget.list.ListWidget.AT_END = "AT_END";
cisco.epg.widget.list.ListWidget.AT_BEGIN = "AT_BEGIN";

cisco.epg.widget.list.ListWidget.ITEM_SELECTED = 'ITEM_SELECTED';

cisco.epg.widget.list.ListWidget.ITEM_ADDED = "ITEM_ADDED";
cisco.epg.widget.list.ListWidget.ITEM_REMOVED = "ITEM_REMOVED";
cisco.epg.widget.list.ListWidget.ITEM_UPDATED = "ITEM_UPDATED";
cisco.epg.widget.list.ListWidget.REMOVED_ALL = "REMOVED_ALL";
cisco.epg.widget.list.ListWidget.NEED_DATA = "NEED_DATA";
cisco.epg.widget.list.ListWidget.FORWARD_DIRECTION = "FORWARD";
cisco.epg.widget.list.ListWidget.BACKWARD_DIRECTION = "BACKWARD";
cisco.epg.widget.list.ListWidget.DATA_UNAVAILABLE = "DataUnavailable";

/**
 * CISCO CONFIDENTIAL
 * Copyright (c) 2013, Cisco Systems, Inc.
 * @author Varun Grover
 */

cisco.declare("cisco.epg.widget.list");

/**
 * Generic presentation class for the  List Widget {cisco.epg.widget.list.ListWidget}
 * @namespace cisco.epg.widget.list
 * @class ListView
 * @constructor
 * @param viewConfig {Object} configuration
 */
cisco.epg.widget.list.ListView = function (viewConfig) {

    /**
     * @private
     * @ignore
     */
    var getConfig = function(configKey) {
        var config = viewConfig[configKey] || cisco.epg.widget.list.ListWidgetConfig.viewConfig[configKey];
        return (new Function("return "+ config))();
    };

    /**
     * @private
     * @ignore
     */
    var currentIndex = viewConfig.highlightIndex;

    /**
     * @private
     * @ignore
     */
    var templateItemRenderer = cisco.epg.template.TemplateFactory.getTemplate(viewConfig["template"]);

    /**
     * @private
     * @ignore
     */
    var itemLayoutStrategy = getConfig("layoutStrategy").call(this, viewConfig);

    /**
     * @private
     * @ignore
     */
    var highlightStrategy = getConfig("highlightStrategy").call(this, viewConfig);

    /**
     * @private
     * @ignore
     */
    var alignmentStrategy =  getConfig("alignmentStrategy").call(this, viewConfig);

    /**
     * @private
     * @ignore
     */
    var listNodeTransformationStrategy = getConfig("transformationStrategy").call(this, viewConfig);

    /**
     * @private
     * @ignore
     */
    var selectionStrategy = getConfig("selectionStrategy").call(this, viewConfig);

    /**
     * @private
     * @ignore
     */
    var createListItemNode = function(itemData, index, isHighlightNeeded) {
        var listItemNode = document.createElement("li");
        listItemNode.className = viewConfig.orientation;
        if(isHighlightNeeded===true) {
            highlightStrategy.highlight(listItemNode, index);
        } else {
            highlightStrategy.unhighlight(listItemNode, index);
        }
        listItemNode.innerHTML =  templateItemRenderer.render({item:itemData, config: viewConfig});
        var styles =  itemLayoutStrategy.getPreRenderPositionStyles(index);
        cisco.applyStyles(listItemNode, styles);
        return listItemNode;
    };

    /**
     * @private
     * @ignore
     */
    var ensureInitialAlignment = function(itemIndex){
        var offsets = alignmentStrategy.getInitialOffsetsForAlignment(outerContainer, widgetContainer.children[itemIndex], itemIndex);
        cisco.applyStyles(widgetContainer, offsets);
    };

    /**
     * @private
     * @ignore
     */
    var actionTransitionDuration = getConfig("transitionDuration");

    /**
     * @private
     * @ignore
     */
    var outerContainer = document.getElementById(viewConfig.outerContainer);

    /**
     * @private
     * @ignore
     */
    var emptyWidgetContainer = function() {
        widgetContainer.innerHTML='';
    }

    /**
     * @private
     * @ignore
     */
    var getWidgetContainer = function() {
        var widgetContainer = document.getElementById(viewConfig.widgetContainer);
        if(widgetContainer) {
            //already a list populated and constructor invoked again
            //we empty the existing the list and re-render with fresh data
            outerContainer.removeChild(widgetContainer);
            emptyWidgetContainer();
        } else {
            widgetContainer = document.createElement('ul');
        }
        return widgetContainer;
    };
    /**
     * @private
     * @ignore
     */
    var widgetContainer = getWidgetContainer();
    widgetContainer.id = viewConfig.widgetContainer;

    /**
     * @private
     * @ignore
     */
    var hasRendered = function() {
        var ul = document.getElementById(viewConfig.widgetContainer);
        return (ul && ul.children.length>0);
    };

    /**
     * @private
     * @ignore
     */
    var hasOpacity = function() {
        return widgetContainer.style.opacity!=="0";
    };

    /**
     * @private
     * @ignore
     */
    var toggleOpacity = function(flag) {
        var opacityLevel = (flag===true)?1:0;
        widgetContainer.style.opacity = opacityLevel;
    };

    /**
     * <p class="pre">
     * renders the list using the list of data items provided. The following is the chain of actions that are performed
     *  - iteratively appends the "new" data items to the (initially empty) DOM (ul node) (any prerender positioning needed is performed during this step)
     *      -- please note that the template specified in the configuration is invoked to populate each list item node
     *  - this DOM (ul node) is then appended to the outerContainer (id specified in the config)
     *  - layout strategy is invoked so that any necessary post-render positioning of the li nodes can be performed
     *  - alignment strategy is invoked to ensure that the default selected node is appropriately aligned w.r.t. to the container
     * </p>
     * @method show
     * @param dataArray {Array} list of data items
     */
    this.show = function (dataArray) {
        toggleOpacity(true);
        if(hasRendered()) return;
        for (var i = 0; i < dataArray.length; i++) {
            widgetContainer.appendChild(createListItemNode(dataArray[i], i, i===viewConfig.highlightIndex));
        }
        outerContainer.appendChild(widgetContainer);
        itemLayoutStrategy.applyPostRenderingPositioning(widgetContainer, viewConfig.highlightIndex);
        ensureInitialAlignment(viewConfig.highlightIndex);
    };

    /**
     * <p class="pre">
     * performs the following actions to respond to a "ACTION_NEXT" invocation
     *  - appends the "new" data item to the list (any prerender positioning needed is performed during this step)
     *      -- please note that the template specified in the configuration is invoked to populate this list item node
     *  - removes the first data item from the list
     *  - ensures that the highlight is set to the nextSibling of the currently selected element
     *  - invokes the appropriate strategies before and after the DOM operation. Here is the sequence
     *      -- transformation strategy is invoked to ensure it is "ready" for the DOM operations
     *      -- highlight strategy is invoked to unhighlight the current item
     *      -- the DOM operations are performed
     *      -- highlight stratey is invoked to highlight the next item
     *      -- layout strategy is invoked to ensure any necessary tweaks to the positioning of the items can be done
     *      -- transformation strategy is invoked so that any animation on the list can now be performed
     * </p>
     * @method show
     * @param item {Object} data item representing the "new" item
     */
    this.next = function (item) {
        listNodeTransformationStrategy.onBeforeNavigationAction(widgetContainer, "NEXT");
        highlightStrategy.unhighlight(widgetContainer.children[viewConfig.highlightIndex], viewConfig.highlightIndex);

        //TODO: visibility to be set to hidden apriori
        var length = widgetContainer.children.length;
        widgetContainer.appendChild(createListItemNode(item, length), length);
        widgetContainer.removeChild(widgetContainer.children[0]);

        highlightStrategy.highlight(widgetContainer.children[viewConfig.highlightIndex], viewConfig.highlightIndex);
        itemLayoutStrategy.applyPostRenderingPositioning(widgetContainer, viewConfig.highlightIndex);
        listNodeTransformationStrategy.onAfterNavigationAction(widgetContainer, viewConfig.highlightIndex, "NEXT");
    };

    /**
     * <p class="pre">
     * performs the following actions to respond to a "ACTION_PREV" invocation
     *  - prepends the "new" data item to the list (any prerender positioning needed is performed during this step)
     *      -- please note that the template specified in the configuration is invoked to populate this list item node
     *  - removes the last data item from the list
     *  - ensures that the highlight is set to the previousSibling of the currently selected element
     *  - invokes the appropriate strategies before and after the DOM operation. Here is the sequence
     *      -- transformation strategy is invoked to ensure it is "ready" for the DOM operations
     *      -- highlight strategy is invoked to unhighlight the current item
     *      -- the DOM operations are performed
     *      -- highlight stratey is invoked to highlight the previous item
     *      -- layout strategy is invoked to ensure any necessary tweaks to the positioning of the items can be done
     *      -- transformation strategy is invoked so that any animation on the list can now be performed
     * </p>
     * @method show
     * @param item {Object} data item representing the "new" item
     */
    this.previous = function (item) {
        listNodeTransformationStrategy.onBeforeNavigationAction(widgetContainer, "PREVIOUS");
        highlightStrategy.unhighlight(widgetContainer.children[viewConfig.highlightIndex], viewConfig.highlightIndex);

        widgetContainer.insertBefore(createListItemNode(item, 0), widgetContainer.firstChild);
        widgetContainer.removeChild(widgetContainer.lastChild);

        highlightStrategy.highlight(widgetContainer.children[viewConfig.highlightIndex], viewConfig.highlightIndex);
        itemLayoutStrategy.applyPostRenderingPositioning(widgetContainer, viewConfig.highlightIndex);
        listNodeTransformationStrategy.onAfterNavigationAction(widgetContainer, viewConfig.highlightIndex, "PREVIOUS");
    };

    /**
     * sets the focus to the widget container DOM so that it can receive the key events
     * @method focus
     */
    this.focus = function () {
        widgetContainer.setAttribute("tabindex", 0);
        widgetContainer.focus();
    };

    /**
     * removes the focus from the widget container DOM so that it can no longer receive the key events
     * @method unfocus
     */
    this.unFocus = function () {
        widgetContainer.removeAttribute("tabindex");
        widgetContainer.blur();
    };

    /**
     * removes the list widget DOM (ul node). this method is invoked as a part of the unloading of the particular screen.
     * @method dispose
     */
    this.dispose = function(){
        var  myChildNode =  cisco('#'+viewConfig.widgetContainer);
        myChildNode.parentNode.removeChild(myChildNode);
        widgetContainer = null;
    };

    /**
     * sets the focus to the widget container DOM so that it can receive the key events
     * @method focus
     */
    this.focus = function () {
        widgetContainer.setAttribute("tabindex", 0);
        widgetContainer.focus();
    };

    /**
     * hides the widget container DOM
     * @method hide
     */
    this.hide = function() {
        toggleOpacity(false);
    };

    /**
     * returns true if the widget container DOM has rendered and has opacity
     * @method isShown
     */
    this.isShown = function() {
        return hasRendered() && hasOpacity();
    };

    /**
     * empties the widget container DOM
     * @method isShown
     */
    this.clear = function() {
        emptyWidgetContainer();
    };

    this.nextPage = function (items) {
        this.refresh(items);
    };

    this.previousPage = function (items) {
        this.refresh(items);
    };

    //TODO
    this.refresh = function(dataArray) {};

    //TODO
    this.isAnimationInProgress = function() {
        return false;
    };

    /**
     * Invokes the defined strategy's selection methods
     * @method selectItem
     */
    this.selectItem = function(){
        selectionStrategy.beforeSelection();
        selectionStrategy.afterSelection();

    };
};
/**
 * CISCO CONFIDENTIAL
 * Copyright (c) 2013, Cisco Systems, Inc.
 * @author Varun Grover
 */

cisco.declare("cisco.epg.widget.list.strategy.highlight");

/**
 * Null object implementation of the highlight strategy
 * @namespace cisco.epg.widget.list.strategy.highlight
 * @class NullStrategy
 * @param viewConfig {Object} view configuration
 * @return {Object} an object that represents an instance of this strategy
 */
cisco.epg.widget.list.strategy.highlight.NullStrategy = function(viewConfig){
    return {
        /**
         * highlights the provided list item node
         * @method highlight
         * @param listItemNode {HTMLElement} reference of the list item node that needs to be highlighted
         * @param itemIndex {Number} index of the list item node in the children collection of the parent node
         */
        highlight: function(listItemNode, itemIndex) {},

        /**
         * removes the highlight from the provided list item node
         * @method unhighlight
         * @param listItemNode {HTMLElement} reference of the list item node that needs to be unhighlighted
         * @param itemIndex {Number} index of the list item node in the children collection of the parent node
         */
        unhighlight: function(listItemNode, itemIndex) {}
    }
};

/**
 * CISCO CONFIDENTIAL
 * Copyright (c) 2013, Cisco Systems, Inc.
 * @author Varun Grover
 */

cisco.declare("cisco.epg.widget.list.strategy.highlight");

/**
 * Concrete implementation of the highlight strategy. Toggles the font-weight inline style to (un)highlight.
 * @namespace cisco.epg.widget.list.strategy.highlight
 * @class FontWeightStrategy
 */
cisco.epg.widget.list.strategy.highlight.FontWeightStrategy = function(viewConfig){
    return {
        highlight: function(listItemNode) {
            listItemNode.style.fontWeight = 'bold';
        },
        unhighlight: function(listItemNode) {
            listItemNode.style.fontWeight = 'normal';
        }
    }
};

/**
 * CISCO CONFIDENTIAL
 * Copyright (c) 2013, Cisco Systems, Inc.
 * @author Varun Grover
 */

cisco.declare("cisco.epg.widget.list.strategy.highlight");

/**
 * Concrete implementation of the highlight strategy. Toggles the css classname(s) to (un)highlight.
 * @namespace cisco.epg.widget.list.strategy.highlight
 * @class ToggleClassNameStrategy
 */
cisco.epg.widget.list.strategy.highlight.ToggleClassNameStrategy = function(viewConfig) {
    var classNames = [].concat(viewConfig.highlightConfig.highlightClassName);

    /**
     * This shim is needed because adding/removing multiple classes to/from classList does not seem to be supported in EPG
     * @private
     * @ignore
     */
    var l_multiClassAddRemoveShim = function(listItemNode, arr, methodName) {
        arr.forEach(function(className){
            listItemNode.classList[methodName](className);
        });
    }

    return {
        highlight: function(listItemNode) {
            l_multiClassAddRemoveShim(listItemNode, classNames, "add");
        },
        unhighlight: function(listItemNode) {
            l_multiClassAddRemoveShim(listItemNode, classNames, "remove");
        }
    };
};

/**
 * CISCO CONFIDENTIAL
 * Copyright (c) 2013, Cisco Systems, Inc.
 * @author Varun Grover
 */

cisco.declare("cisco.epg.widget.list.strategy.highlight");

/**
 * Concrete implementation of the highlight strategy. Swaps css classname(s) with other classname(s) to (un)highlight.
 * @namespace cisco.epg.widget.list.strategy.highlight
 * @class SwapClassNameStrategy
 */
cisco.epg.widget.list.strategy.highlight.SwapClassNameStrategy = function(viewConfig) {
    var unhighlightClassName = [].concat(viewConfig.highlightConfig.unhighlightClassName);
    var highlightClassName = [].concat(viewConfig.highlightConfig.highlightClassName);

    /**
     * This shim is needed because adding/removing multiple classes to/from classList does not seem to be supported in EPG
     * @private
     * @ignore
     */
    var multiClassAddRemoveShim = function(listItemNode, arr, methodName) {
        arr.forEach(function(className){
            listItemNode.classList[methodName](className);
        });
    }

    return {
        highlight: function(listItemNode) {
            multiClassAddRemoveShim(listItemNode, unhighlightClassName, "remove");
            multiClassAddRemoveShim(listItemNode, highlightClassName, "add");
        },
        unhighlight: function(listItemNode) {
            multiClassAddRemoveShim(listItemNode, highlightClassName, "remove");
            multiClassAddRemoveShim(listItemNode, unhighlightClassName, "add");
        }
    };
};

/**
 * CISCO CONFIDENTIAL
 * Copyright (c) 2013, Cisco Systems, Inc.
 * @author Varun Grover
 */

cisco.declare("cisco.epg.widget.list.strategy.transform");

/**
 * Null object implementation of the transform strategy
 * @namespace cisco.epg.widget.list.strategy.transform
 * @class NullStrategy
 * @param viewConfig {Object} view configuration
 * @return {Object} an object that represents an instance of this strategy
 */
cisco.epg.widget.list.strategy.transform.NullStrategy = function(viewConfig){
        return {
            /**
             * performs any sequence of steps necessary to be 'ready' for the navigation action
             * e.g., setting the transition duration to zero
             * @method onBeforeNavigationAction
             * @param widgetContainer {HTMLElement} reference of the list node DOM (ul)
             * @param actionName {String} navigation action name - "NEXT" or "PREVIOUS"
             */
            onBeforeNavigationAction: function(widgetContainer, actionName) {},

            /**
             * performs any sequence of steps necessary to animate the list node to an appropriate target visual state after the DOM manipulation (append and remove) is done
             * e.g., restoring the transition duration and then setting new position top/left values in the style object of the list node (ul)
             * @method onAfterNavigationAction
             * @param widgetContainer {HTMLElement} reference of the list node DOM (ul)
             * @param p_highlightIndex {number} index of the current highlighted list item node
             * @param actionName {String} navigation action name - "NEXT" or "PREVIOUS" that resulted in the DON manipulation
             */
            onAfterNavigationAction: function(widgetContainer, hightlightIndex, actionName) {},

            isAnimationInProgress: function() {
                return false;
            }
        };
};

/**
 * CISCO CONFIDENTIAL
 * Copyright (c) 2013, Cisco Systems, Inc.
 * @author Varun Grover
 */

cisco.declare("cisco.epg.widget.list.strategy.transform");

/**
 * Concrete implementation of the transform strategy. Computes and applies "left"-based positioning on the list node to achieve the animation effect on navigation.
 * @namespace cisco.epg.widget.list.strategy.transform
 * @class TransitionPropertyLeftStrategy
 */
cisco.epg.widget.list.strategy.transform.TransitionPropertyLeftStrategy = function(viewConfig){

    var lastInvoked=0;
    var marginLeft = 0, marginRight = 0;

    /**
     * @private
     * @ignore
     */
    var setMarginVariables = function(listNode) {
        var listItemNode = listNode.children[0];
        if (listItemNode) {
            marginLeft = marginLeft || parseInt(window.getComputedStyle(listItemNode).marginLeft);
            marginRight = marginRight || parseInt(window.getComputedStyle(listItemNode).marginRight);
        } else {
            console.log("navigation transformation attempted on an empty list");
        }
    };

    return {
        onBeforeNavigationAction: function(listNode, actionName) {
            setMarginVariables(listNode)
            listNode.style.webkitTransitionDuration = "0ms";
        },
        //TODO: rename to onNavigationAction
        onAfterNavigationAction: function(listNode, actionName) {

            var nextIndexStep = (actionName==="NEXT")? 1 : -1;
            var targetIndex = viewConfig.highlightIndex + nextIndexStep;

            var highlightedItem = listNode.children[targetIndex], parentContainer = listNode.parentNode;
            var existingLeftOffset = parseInt(highlightedItem.offsetLeft);
            if(!existingLeftOffset || isNaN(existingLeftOffset)) existingLeftOffset=0;

            existingLeftOffset = -(existingLeftOffset + highlightedItem.clientWidth / 2) + parentContainer.clientWidth / 2 ;

            lastInvoked = Date.now();
            listNode.style.webkitTransitionDuration = viewConfig.transitionDuration + 'ms';

            listNode.style.left = existingLeftOffset + nextIndexStep*((listNode.children[targetIndex].clientWidth / 2) + marginLeft + marginRight + (listNode.children[viewConfig.highlightIndex].clientWidth / 2) ) + "px";
        },
        isAnimationInProgress: function() {
            return Date.now() - lastInvoked < 15; //15ms to compensate for the low resolution of Date implementation
        }
    };
};

/**
 * CISCO CONFIDENTIAL
 * Copyright (c) 2013, Cisco Systems, Inc.
 * @author Varun Grover
 */

cisco.declare("cisco.epg.widget.list.strategy.transform");

/**
 * Concrete implementation of the transform strategy. Computes and applies "top"-based positioning on the list node to achieve the animation effect on navigation.
 * @namespace cisco.epg.widget.list.strategy.transform
 * @class TransitionPropertyTopStrategy
 */
cisco.epg.widget.list.strategy.transform.TransitionPropertyTopStrategy = function(viewConfig){

    var lastInvoked=0;
    var marginTop = 0, marginBottom = 0;

    /**
     * @private
     * @ignore
     */
    var setMarginVariables = function(p_listNode) {
        var l_listItemNode = p_listNode.children[0];
        if (l_listItemNode) {
            marginTop = marginTop || parseInt(window.getComputedStyle(l_listItemNode).marginTop);
            marginBottom = marginBottom || parseInt(window.getComputedStyle(l_listItemNode).marginBottom);
        } else {
            console.log("navigation transformation attempted on an empty list");
        }
    };

    return {
        onBeforeNavigationAction: function(listNode, actionName) {
            setMarginVariables(listNode)
            listNode.style.webkitTransitionDuration = "0ms";
        },
        onAfterNavigationAction: function(listNode, actionName) {

            lastInvoked = Date.now();

            listNode.style.webkitTransitionDuration = viewConfig.transitionDuration + 'ms';
            var existingTopOffset = parseInt(listNode.style.top);
            if(!existingTopOffset || isNaN(existingTopOffset)) existingTopOffset=0;
            var l_nextIndexStep = (actionName==="NEXT")? -1 : 1;
            if(actionName==="NEXT") {
                listNode.style.top = existingTopOffset + l_nextIndexStep*(listNode.children[viewConfig.highlightIndex + 1].offsetHeight) + "px";
            } else{
                listNode.style.top = existingTopOffset + l_nextIndexStep*((listNode.children[viewConfig.highlightIndex + 1].clientHeight / 2) + marginTop + marginBottom + (listNode.children[viewConfig.highlightIndex].clientHeight / 2) ) + "px";
            }

        },
        isAnimationInProgress: function() {
            return Date.now() - lastInvoked < 15; //15ms to compensate for the low resolution of Date implementation
        }
    };
};

/**
 * CISCO CONFIDENTIAL
 * Copyright (c) 2013, Cisco Systems, Inc.
 * @author Varun Grover
 */

cisco.declare("cisco.epg.widget.list.strategy.align");

/**
 * Null object implementation of the alignment strategy
 * @namespace cisco.epg.widget.list.strategy.align
 * @class NullStrategy
 * @param viewConfig {Object} view configuration
 * @return {Object} an object that represents an instance of this strategy
 */
cisco.epg.widget.list.strategy.align.NullStrategy = function(viewConfig){
    return {
        /**
         * computes and returns the offset values needed for ensuring that the list node (ul) is aligned properly within the outerContainer
         * @method getInitialOffsetsForAlignment
         * @param outerContainer {HTMLElement} reference of the outerContainer node
         * @param item{HTMLElement} reference of the list item node representing the selected item
         * @param itemIndex {number} the index of the selected item
         * @return {Object} the concrete implementation of this strategy should return the values for top/left to be set into the style object of the list node (ul)
         */
        getInitialOffsetsForAlignment: function(outerContainer, item, itemIndex) {
            return {};
        }
    };
};

/**
 * CISCO CONFIDENTIAL
 * Copyright (c) 2013, Cisco Systems, Inc.
 * @author Varun Grover
 */

cisco.declare("cisco.epg.widget.list.strategy.align");

/**
 * Concrete implementation of the alignment strategy. Adjusts the list offset values to ensure that the highlighted item is always in the center of the parent container.
 * @namespace cisco.epg.widget.list.strategy.align
 * @class HighlightedItemInCenterStrategy
 */
cisco.epg.widget.list.strategy.align.HighlightedItemInCenterStrategy = function(viewConfig){
    return {
        getInitialOffsetsForAlignment: function(parentContainer, highlightedItem, itemIndex) {
            var existingLeftOffset = parseInt(highlightedItem.offsetLeft);
            if(!existingLeftOffset || isNaN(existingLeftOffset)) existingLeftOffset=0;
            return {
                left: -(existingLeftOffset + highlightedItem.clientWidth / 2) + parentContainer.clientWidth / 2 + "px"
            };
        }
    };
};

/**
 * CISCO CONFIDENTIAL
 * Copyright (c) 2013, Cisco Systems, Inc.
 * @author Varun Grover
 */

cisco.declare("cisco.epg.widget.list.strategy.layout");

/**
 * Null object implementation of the layout strategy
 * @namespace cisco.epg.widget.list.strategy.layout
 * @class NullStrategy
 * @param viewConfig {Object} view configuration
 * @return {Object} an object that represents an instance of this strategy
 */
cisco.epg.widget.list.strategy.layout.NullStrategy = function(viewConfig){
    return {
        /**
         * computes and returns the position styles (top/left) that need to be applied on the list item node located at the provided item index
         * @method getPreRenderPositionStyles
         * @param itemIndex {number} index of the list item node inside the list node
         */
        getPreRenderPositionStyles: function(itemIndex) {
            return {};
        },

        /**
         * computes and returns the position styles (top/left) that need to be applied on the list item node located at the provided item index
         * @method applyPostRenderingPositioning
         * @param widgetContainer {HTMLElement} reference of the list item node that needs to be highlighted
         * @param highlightIndex {number} index of the current highlighted list item node inside the list node
         */
        applyPostRenderingPositioning: function(widgetContainer, highlightIndex) {}
    }
};

/**
 * CISCO CONFIDENTIAL
 * Copyright (c) 2013, Cisco Systems, Inc.
 * @author Varun Grover
 */

cisco.declare("cisco.epg.widget.list.strategy.layout");

/**
 * Concrete implementation of the layout strategy. Applies post-rendering "top"-based positioning based on the clientHeight of the previous items and index of the current item.
 * @namespace cisco.epg.widget.list.strategy.layout
 * @class ItemPositionedVerticalStrategy
 */
cisco.epg.widget.list.strategy.layout.ItemPositionedVerticalStrategy = function(viewConfig) {

    var curTop=0;

    return {
        getPreRenderPositionStyles: function(itemIndex) {
            var i = (itemIndex==viewConfig.size)? itemIndex+1 : itemIndex;
            var top = i * viewConfig.itemHeight
            if(itemIndex>viewConfig.highlightIndex) {
                top += viewConfig.layoutConfig.subMenuHeight;
            }
            return {
                top: top + 'px'
            };
        },
        applyPostRenderingPositioning: function(listNode, currentItemIndex) {}
    }
};

/**
 * CISCO CONFIDENTIAL
 * Copyright (c) 2013, Cisco Systems, Inc.
 * @author Varun Grover
 */

cisco.declare("cisco.epg.widget.list.strategy.layout");

/**
 * Concrete implementation of the layout strategy. Applies pre-render "top"-based positioning based on the index of the item.
 * @namespace cisco.epg.widget.list.strategy.layout
 * @class FixedHeightItemPositionedVerticalStrategy
 */
cisco.epg.widget.list.strategy.layout.FixedHeightItemPositionedVerticalStrategy = function(viewConfig) {
    return {
        getPreRenderPositionStyles: function(itemIndex) {
            return {
                top: (viewConfig.layoutConfig.itemHeight + viewConfig.layoutConfig.verticalOffset)*itemIndex + "px"
            };
        },
        applyPostRenderingPositioning: function(listNode) {} /*empty method*/
    }
};

/**
 * CISCO CONFIDENTIAL
 * Copyright (c) 2013, Cisco Systems, Inc.
 * @author Varun Grover
 */

cisco.declare("cisco.epg.widget.list.strategy.layout");

/**
 * Concrete implementation of the layout strategy. Applies pre-render "left"-based positioning based on the index of the item.
 * @namespace cisco.epg.widget.list.strategy.layout
 * @class FixedWidthItemPositionedHorizontalStrategy
 */
cisco.epg.widget.list.strategy.layout.FixedWidthItemPositionedHorizontalStrategy = function(viewConfig) {
    return {
        getPreRenderPositionStyles: function(itemIndex) {
            return {
                left: (viewConfig.layoutConfig.itemWidth + viewConfig.layoutConfig.horizontalOffset)*itemIndex + "px"
            };
        },
        applyPostRenderingPositioning: function(listNode) {}
    };
};

/**
 * CISCO CONFIDENTIAL
 * Copyright (c) 2013, Cisco Systems, Inc.
 * @author Gaurav Behere
 */


/**
 * Null object implementation of the selection strategy
 * @namespace cisco.epg.widget.list.strategy.selection
 * @class NullStrategy
 * @param viewConfig {Object} view configuration
 * @return {Object} an object that represents an instance of this strategy
 */

cisco.declare("cisco.epg.widget.list.strategy.selection");
cisco.epg.widget.list.strategy.selection.NullStrategy = function(){
    return{
        beforeSelection: function () {},
        afterSelection: function () {}
    }
};