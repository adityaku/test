cisco.epg = cisco.epg || {};
cisco.epg.widget = cisco.epg.widget || {};
cisco.epg.widget.matix = cisco.epg.widget.matix || {};
cisco.epg.widget.matix.MatrixView = function (config) {
    var presentationObj = new (eval(config.presentation))(config);
    this.show = function () {
        presentationObj.show();
    };
    this.dispose = function () {
        presentationObj.dispose();
    };
    this.hide = function () {
        presentationObj.hide();
    };

    this.setData = function (dataArray) {
        presentationObj.createView(dataArray);
    };

    this.left = function (data) {
        presentationObj.left(data);
    };

    this.right = function (data) {
        presentationObj.right(data);
    };

    this.up = function (array) {
        presentationObj.up(array);
    };
    this.down = function (array) {
        presentationObj.down(array);
    };
    this.focus = function (array) {
        presentationObj.focus();
    };
    this.unFocus = function (array) {
        if (presentationObj.unFocus) {
            presentationObj.unFocus();
        }
    };
};

cisco.epg.widget.matix.MatrixWidgetModel = function(config,listener) {

    var modelIndex = null;
    var matrixArray = [];
    var focusedRowIndex = 0;
var appendArray = function (dataArray) {
        var lastRow = matrixArray[matrixArray.length - 1];
        matrixArray[matrixArray.length - 1] = lastRow.concat(dataArray.splice(0, config.columnCount - lastRow.length));
        while (dataArray.length > 0) {
            matrixArray.push(dataArray.splice(0, config.columnCount));
            focusedRowIndex = focusedRowIndex-1;
            matrixArray.shift();
        }
    };

    var prependArray = function (dataArray) {
        var firstRow = matrixArray[0];
        matrixArray[0] = dataArray.splice(-1 * ( config.columnCount - firstRow.length), config.columnCount - firstRow.length).concat(firstRow);
        while (dataArray.length > 0) {
            matrixArray.unshift(dataArray.splice(-1 * config.columnCount, config.columnCount));
            focusedRowIndex = focusedRowIndex + 1;
            matrixArray.pop();
        }
    } ;


    var createInitialArray = function (dataArray) {
        var startOfFocusedRow = modelIndex - config.highlightedColumnIndex;
        var endOfFocusedRow = startOfFocusedRow + config.columnCount;
        startOfFocusedRow = startOfFocusedRow < 0 ? 0 : startOfFocusedRow;
        matrixArray.push(dataArray.slice(startOfFocusedRow, endOfFocusedRow));
        var tempStartOfRow = startOfFocusedRow;
        var tempEndOfRow = null;
        while (true) {
            tempStartOfRow = tempStartOfRow - config.columnCount;
            tempEndOfRow = tempStartOfRow + config.columnCount;
            if (tempStartOfRow <= 0 - config.columnCount) {
                break;
            } else {
                if (tempStartOfRow < 0){
                    tempStartOfRow = 0;
                }
            }
            matrixArray.unshift(dataArray.slice(tempStartOfRow, tempEndOfRow));
            focusedRowIndex+=1;
        }

        tempStartOfRow = endOfFocusedRow;
        while (true) {
            tempEndOfRow = tempStartOfRow + config.columnCount;
            if (tempEndOfRow > dataArray.length + config.columnCount - 1) {
                break;
            } else {
                if (tempEndOfRow >= dataArray.length){
                    tempEndOfRow = dataArray.length;
                }
            }
            matrixArray.push(dataArray.slice(tempStartOfRow, tempEndOfRow));
            tempStartOfRow = tempStartOfRow + config.columnCount;
        }
    };

    this.setSelectedIndex = function (index) {
        modelIndex = index;
    };

    this.setData = function (locator, dataArray) {
        switch (locator) {
            case "INIT":
                createInitialArray(dataArray);
                break;
            case "PREVIOUS":
                prependArray(dataArray);
                listener("DATA_ADDED",null);
                break;

            case "NEXT":
                appendArray(dataArray);
                listener("DATA_ADDED",null);
                break;
            default :
                break;

        }
        return focusedRowIndex;
    };

    this.getData = function (startRowIndex, endRowIndex) {
        var ret = [];
        if (startRowIndex >= 0) {
            ret = matrixArray.slice(startRowIndex, endRowIndex + 1);
        }
        return ret;
    } ;

    this.getDataAtIndex = function (rowIndex, columnIndex) {
        return matrixArray[rowIndex][columnIndex];
    };
    this.resetData = function(){
        matrixArray = [];
        focusedRowIndex = 0;
    }

};
cisco.epg.widget.matix.MatrixWidget = function(config) {
    var modelListener = function (type, context) {
        switch (type) {
            case "FOCUSED_ROW_INDEX_CHANGE":
                break;
            default:
                break;
        }
    };
    var model = new cisco.epg.widget.matix.MatrixWidgetModel(config, function (type, context) {
        modelListener(type, context);
    });

    var view =new cisco.epg.widget.matix.MatrixView(config);
    var currentRowCount = config.rowCount;
    var modelIndex = null;
    var modelFocusRowIdx = null;
    var indices = [];
    var listenerArray = {};
    var bufferedRowOffset = config.highlightedRowIndex;
    var currentColumnIndex = null;
    
    var notify = function (eventType, context) {
        var eventObj = {};
        eventObj.type = eventType;
        eventObj.context = context;
        if (listenerArray && listenerArray[eventType]) {
            listenerArray[eventType].handleEvent(eventObj);
        }
    };

    this.show = function () {
        view.show();
        notify("SHOWN",null);
    };
    this.dispose = function () {
        view.dispose();
        notify("DISPOSE",null);
    };

    this.setData = function (locator, dataArray) {

        if (config.highlightedColumnIndex >= config.columnCount) {
            throw new Error(" column highlight Index can not be greater the column count");
        }

        if (config.highlightedRowIndex >= config.rowCount) {
            throw new Error(" row highlight Index can not be greater the row count");
        }

        modelFocusRowIdx = model.setData(locator, dataArray);
        if (locator === "INIT") {
            if (dataArray.length - 1 < modelIndex) {
                throw new Error("invalid model Index set");
            }
            var startRowIndex = modelFocusRowIdx - config.highlightedRowIndex;
            var endRowIndex = startRowIndex + config.rowCount - 1;
            startRowIndex = startRowIndex < 0 ? 0 : startRowIndex;
            var dataArraySet = model.getData(startRowIndex, endRowIndex);
            dataArray = this.arrangeInitData(dataArraySet);
            currentColumnIndex = indices[config.highlightedRowIndex];
            view.setData(dataArray);
        } /*else if (locator === "NEXT") {

        }*/
    };

    this.handleEvent = function (event) {
        var newStartRowIndex,dataArray,arrangedData,l_focusRowCount,l_prevFocusRowCount;
        switch (event) {
            case "LEFT":
                if (model.getDataAtIndex(modelFocusRowIdx, currentColumnIndex - 1) != null) {
                    currentColumnIndex-=1;
                    view.left(model.getDataAtIndex(modelFocusRowIdx, currentColumnIndex));
                    modelIndex-=1;
                    notify("SELECTION_CHANGE", null);
                } else {
                    notify("AT_BEGIN_COLUMN", null);
                }

                break;
            case "RIGHT":
                if (model.getDataAtIndex(modelFocusRowIdx, currentColumnIndex + 1) != null) {
                    currentColumnIndex+=1;
                    view.right(model.getDataAtIndex(modelFocusRowIdx, currentColumnIndex));
                    modelIndex+=1;
                    notify("SELECTION_CHANGE", null);
                } else {
                    notify("AT_END_COLUMN", null);
                }
                break;
            case "UP":
                newStartRowIndex = modelFocusRowIdx - config.highlightedRowIndex - 1;
                dataArray = model.getData(newStartRowIndex, newStartRowIndex);
                if (dataArray.length > 0) {
                    bufferedRowOffset = bufferedRowOffset > config.highlightedRowIndex ? bufferedRowOffset - 1 : bufferedRowOffset;
                    arrangedData = this.arrangeData(dataArray[0]);
                    dataArray = arrangedData.data;
                    modelFocusRowIdx-=1;
                    indices.unshift(arrangedData.index);
                    indices.pop();
                    view.up(dataArray);
                    l_focusRowCount = model.getData(modelFocusRowIdx,modelFocusRowIdx)[0].length;
                    modelIndex = modelIndex - currentColumnIndex - (l_focusRowCount - indices[config.highlightedRowIndex ]);
                    currentColumnIndex = indices[config.highlightedRowIndex];
                    notify("SELECTION_CHANGE", null);
                } else {
                    if (bufferedRowOffset - 1 >= 0) {
                        modelFocusRowIdx-=1;
                        dataArray = (this.arrangeData([])).data;
                        indices.unshift(null);
                        indices.pop();
                        bufferedRowOffset-=1;
                        l_focusRowCount = model.getData(modelFocusRowIdx,modelFocusRowIdx)[0].length;
                        modelIndex = modelIndex - currentColumnIndex - (l_focusRowCount - indices[config.highlightedRowIndex ]);
                        view.up(dataArray);
                        currentColumnIndex = indices[config.highlightedRowIndex];
                        notify("SELECTION_CHANGE", null);
                    } else {
                        notify("AT_BEGIN_ROW", null);
                    }

                }
                break;
            case "DOWN":
                newStartRowIndex = (modelFocusRowIdx + 1) - config.highlightedRowIndex;
                var newEndRowIndex = newStartRowIndex + config.rowCount - 1;
                dataArray = model.getData(newEndRowIndex, newEndRowIndex);
                if (dataArray.length > 0) {
                    currentRowCount = currentRowCount < config.rowCount ? currentRowCount + 1 : currentRowCount;
                    bufferedRowOffset = bufferedRowOffset < config.highlightedRowIndex ? bufferedRowOffset + 1 : bufferedRowOffset;
                    arrangedData = this.arrangeData(dataArray[0]);
                    dataArray = arrangedData.data;
                    modelFocusRowIdx+=1;
                    indices.push(arrangedData.index);
                    indices.shift();
                    view.down(dataArray);
                    l_prevFocusRowCount = model.getData(modelFocusRowIdx - 1,modelFocusRowIdx - 1)[0].length;
                    modelIndex = modelIndex + (l_prevFocusRowCount - currentColumnIndex) +  indices[config.highlightedRowIndex ];
                    currentColumnIndex = indices[config.highlightedRowIndex];
                    notify("SELECTION_CHANGE", null);
                } else {
                    if (bufferedRowOffset + 1 < currentRowCount) {
                        modelFocusRowIdx+=1;
                        dataArray = (this.arrangeData([])).data;
                        bufferedRowOffset+=1;
                        indices.push(null);
                        indices.shift();
                        view.down(dataArray);
                        l_prevFocusRowCount = model.getData(modelFocusRowIdx - 1,modelFocusRowIdx - 1)[0].length;
                        modelIndex = modelIndex + (l_prevFocusRowCount - currentColumnIndex) +  indices[config.highlightedRowIndex];
                        currentColumnIndex = indices[config.highlightedRowIndex];
                        notify("SELECTION_CHANGE", null);
                    } else {
                        notify("AT_END_ROW", null);
                    }
                }
                break;
            default:
                break;
        }
    };

    this.getSelectedItem = function () {
        return model.getDataAtIndex(modelFocusRowIdx, currentColumnIndex);
    };

    this.getFocusIndex = function(){
        return modelIndex;
    };

    this.setSelectedIndex = function (index) {
        modelIndex = index;
        model.setSelectedIndex(index);
    };

    this.addEventListener = function (eventType, listener) {
        listenerArray[eventType] = listener;
    };

    this.focus = function () {
        view.focus();
        notify("FOCUS_GAINED", null);
    };

    this.unFocus = function () {
        view.unFocus();
        notify("FOCUS_LOST", null);
    };

    this.isVisible = function () {
        return view.isVisible();
    };
    this.arrangeInitData = function (data) {
        var ret = data,i= 0,j= 0,k;
        for (i; i < data.length; i+=1) {
            indices[i] = config.highlightedColumnIndex;
        }
        var arrangedData = (this.arrangeData(ret[0]));
        ret[0] = arrangedData.data;
        indices[0] = arrangedData.index;

        if(ret.length - 1 !== 0){
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

    this.arrangeData = function (data) {
        var ret = {},i= 0,j;
        ret.data = data;
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
        }else{
            ret.index = config.highlightedColumnIndex;
        }
        return ret;
    };

    this.hide = function () {
        view.hide();
        notify("HIDDEN",null);
    };
    this.resetData = function(){
        model.resetData();
        currentRowCount = config.rowCount;
        modelIndex = null;
        modelFocusRowIdx = null;
        indices = [];
        bufferedRowOffset = config.highlightedRowIndex;
        currentColumnIndex = null;
    }
};
