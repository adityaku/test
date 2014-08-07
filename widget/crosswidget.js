cisco.extend(window.cisco,{"epg":{"mywidget":{"listwidget":{"widget":{"Class":"cisco.epg.widget.FixFocusListWidget","Obj":null,"Config":{"size":12,"highlight":2}},"statergy":{"Class":"cisco.epg.widget.LinearFillingStrategy","Obj":null,"Config":null},"model":{"Class":"cisco.epg.widget.StaticModel","Obj":null,"Config":null},"view":{"Class":"cisco.epg.widget.ListView","container":"mainMenu1","Obj":null,"Config":null},"presentation":{"Class":"cisco.epg.widget.MenuPresentation","Obj":null,"Config":{"padding":30,"highlight":2,"container":"mainMenu","orientation":"Horizontal"}},"animation":{"Class":"cisco.epg.widget.MenuAnimation","Obj":null,"Config":null}},"subWidgetConfig":{"profile":{"widget":{"Class":"cisco.epg.widget.FixFocusListWidget","Obj":null,"Config":{"size":3,"highlight":1}},"statergy":{"Class":"cisco.epg.widget.LinearFillingStrategy","Obj":null,"Config":null},"model":{"Class":"cisco.epg.widget.StaticModel","Obj":null,"Config":null,"data":"cisco.epg.ProfileItems"},"view":{"Class":"cisco.epg.widget.ListView","container":"profileMenu","Obj":null,"Config":null},"presentation":{"Class":"cisco.epg.widget.ListPresentationVertical","Obj":null,"Config":{"itemHeight":60,"highlight":1,"container":"profileMenu","orientation":"vertical"}},"animation":{"Class":"cisco.epg.widget.MenuAnimation","Obj":null,"Config":{"itemHeight":60}}},"search":{"widget":{"Class":"cisco.epg.widget.FixFocusListWidget","Obj":null,"Config":{"size":4,"highlight":0}},"statergy":{"Class":"cisco.epg.widget.LinearFillingStrategy","Obj":null,"Config":null},"model":{"Class":"cisco.epg.widget.StaticModel","Obj":null,"Config":null,"data":"cisco.epg.SearchItems"},"view":{"Class":"cisco.epg.widget.ListView","container":"searchMenu","Obj":null,"Config":null},"presentation":{"Class":"cisco.epg.widget.ListPresentationVertical","Obj":null,"Config":{"itemHeight":60,"highlight":0,"container":"searchMenu","orientation":"vertical"}},"animation":{"Class":"cisco.epg.widget.MenuAnimation","Obj":null,"Config":{"itemHeight":60}}}}}}});
// CISCO CONFIDENTIAL
// Copyright (c) 2013, Cisco Systems, Inc.

cisco.epg = cisco.epg || {};
cisco.epg.widget = cisco.epg.widget || {};
cisco.epg.widget.FixFocusListWidget = function () {
    var forwardBuffer , backwardBuffer, strategyObj , viewobj , config, content;
    this.initialize = function (p_config) {
        config = p_config.widget.Config;
        strategyObj = p_config.statergy.Obj;
        viewobj = p_config.view.Obj;
        strategyObj.initialize(config.size, config.highlight, p_config.model, function (data , size) {

            if (data && data.length > 0) {
                if(size){
                config.highlight = config.highlight+ size;
                }
                content = data;
                content[config.highlight]["isFocused"] = true;
                p_config.view.Obj.initialize(content, p_config.presentation, p_config.animation,config.highlight);
            }

        });

    };


    this.previous = function () {
        var l_removedItem;
        if (backwardBuffer.length > 0) {
            content[config.highlight]["isFocused"] = false;
            content.pop();
            content.unshift(backwardBuffer.pop());
            content[config.highlight]["isFocused"] = true;
            viewobj.movePrevious(content[0]);
        } else {
            strategyObj.previous(function (item) {
                if (item != null) {
                    content[config.highlight]["isFocused"] = false;
                    l_removedItem = content.pop();
                    content.unshift(item);
                    content[config.highlight]["isFocused"] = true;
                    viewobj.movePrevious(content[0]);
                } else if (content[config.highlight - 1] && Object.keys(content[config.highlight + 1]).length > 0) {
                    content[config.highlight]["isFocused"] = false;
                    l_removedItem = content.pop();
                    forwardBuffer.push(l_removedItem);
                    content.unshift(item);
                    content[config.highlight]["isFocused"] = true;
                    viewobj.movePrevious(content[0]);
                }

            });

        }


    };
    this.next = function () {
        var l_removedItem;
        if (forwardBuffer.length > 0) {
            content[config.highlight]["isFocused"] = false;
            content.shift();
            content.push(forwardBuffer.pop());
            content[config.highlight]["isFocused"] = true;
            viewobj.moveNext(content[content.length - 1]);
        } else {
            strategyObj.next(function (item) {
                if (item != null) {
                    content[config.highlight]["isFocused"] = false;
                    l_removedItem = content.shift();
                    content.push(item);
                    content[config.highlight]["isFocused"] = true;
                    viewobj.moveNext(content[content.length - 1]);

                } else if (content[config.highlight + 1] && Object.keys(content[config.highlight + 1]).length > 0) {
                    content[config.highlight]["isFocused"] = false;
                    l_removedItem = content.shift();
                    backwardBuffer.push(l_removedItem);
                    content.push(item);
                    content[config.highlight]["isFocused"] = true;
                    viewobj.moveNext(content[content.length - 1]);
                }

            });

        }
    };


    this.getContentArray = function () {
        return content;
    };

    this.getFocussedItem = function () {
        return content[config.highlight];
    };

    this.update = function() {
        viewobj.update();
    };

    this.clear = function () {
        strategyObj = undefined;
        view = undefined;
        isFocused = undefined;
        forwardBuffer = undefined;
        backwardBuffer = undefined;
        config = undefined;
    }

    var constructor = function () {
        isFocused = false;
        content = [];
        forwardBuffer = [];
        backwardBuffer = [];
    }();
}




/**
 * LinearFillingStrategy class for Non  Circular
 * @class cisco.epg.widget.LinearFillingStrategy
 */

cisco.epg.widget = cisco.epg.widget || {};

cisco.epg.widget.LinearFillingStrategy = function () {
    var m_modelObj;
    var index = null;
    var direction = true;
    var next = true;
    var prev = false;
    var size = null;

    this.initialize = function (p_size, highlight, p_model, callback, context) {
        m_modelObj = p_model.Obj;
        var dataArray = [];

        size = p_size;
        var l_configParam = {
            windowSize:size,
            bufferFactor:0
        };
        var preNullCounter = 0;
        var l_size = m_modelObj.hasNext(size);
        for (var i = 0; i < size; i++) {
            var l_data = [];


            try {
                m_modelObj.next(function (data) {
                    if (data) {
                        dataArray.push(data)
                    } else {
                        if(i%2 ==0){
                            dataArray.push(null);
                        } else{
                            preNullCounter++;
                            dataArray.unshift(null);
                        }

                    }
                });
            }
            catch (e) {
                console.log(e);
            }
        }
        index = dataArray.length;
        callback(dataArray,preNullCounter);

    };

    this.next = function (callback) {
        if (direction !== next) {
            if (size == m_modelObj.hasNext(size)) {
                m_modelObj.moveRelative(next, size - 1);
            } else {
                callback(null);
                return;
            }
        }
        direction = next;
        if (m_modelObj.hasNext(1) == 1) {
            m_modelObj.next(function (data) {
                if (data) {
                    callback(data);
                }
            });
        } else {

            callback(null);
        }
    };


    this.previous = function (callback) {
        if (direction !== prev) {
            if (size == m_modelObj.hasPrevious(size)) {
                m_modelObj.moveRelative(prev, size - 1);
            } else {
                callback(null);
                return;
            }
        }
        direction = prev;
        if (m_modelObj.hasPrevious(1) == 1) {
            m_modelObj.previous(function (data) {
                if (data) {
                    callback(data);
                }
            });
        } else {

            callback(null);
        }

    };


}




// CISCO CONFIDENTIAL
// Copyright (c) 2013, Cisco Systems, Inc.

/**
 * @class cisco.epg.widget.ListView
 */

cisco.epg.widget.ListView = function (p_config) {
    var presentationObj;


    this.initialize = function (dataArray, p_presentation, p_animation, newHighlight) {
        console.log(dataArray);
        presentationObj = p_presentation.Obj;
        if (presentationObj) {
            p_presentation.Config.highlight = newHighlight;
            presentationObj.initialize(dataArray, p_presentation.Config, p_animation);
        }

    };

    this.moveNext = function (data) {
        presentationObj.next(data);
    };


    this.movePrevious = function (data) {
        presentationObj.previous(data)
    };

    var constructor = (function () {

    }());


}



// CISCO CONFIDENTIAL
// Copyright (c) 2013, Cisco Systems, Inc.

/**
 * @class cisco.epg.widget.MenuAnimation
 */



cisco.epg.widget.MenuAnimation = function () {
    var m_callBack;
    var  targetDiv;

    var animationCallback = function (e) {
        targetDiv.removeEventListener('webkitTransitionEnd', animationCallback);
        m_callBack();
    };
    cisco.epg.widget.MenuAnimation.prototype.moveHorizontal = function (offsetobj, p_targetDiv, callback ) {
         targetDiv = p_targetDiv;

        if (callback) {
            targetDiv.addEventListener('webkitTransitionEnd', animationCallback);
            m_callBack = callback;
        }
      //  targetDiv.style.webkitTransform = "translate3d("+offsetobj.x + "px,"+offsetobj.y +"px,"+offsetobj.z+"px)";
        targetDiv.style.left=   offsetobj.x+"px"
    };

    cisco.epg.widget.MenuAnimation.prototype.moveVertical = function(offsetobj, p_targetDiv, callback , itemHeight, dir){
         targetDiv = p_targetDiv;

        if (callback) {
            targetDiv.addEventListener('webkitTransitionEnd', animationCallback);
            m_callBack = callback;
        }

        targetDiv.style.top = targetDiv.offsetTop + (itemHeight *dir ) + "px";
    }
}



// CISCO CONFIDENTIAL
// Copyright (c) 2013, Cisco Systems, Inc.

/**
 * @class cisco.epg.widget.MenuPresentation
 */



cisco.epg.widget.MenuPresentation = function () {

    var newOffset , centerXPos    , animationObj, config;


    this.initialize = function (dataArrray, p_config, animation) {
        animationObj = animation.Obj;
        config = p_config;
        var index = config.highlight;
        var tempInd = config.highlight;
        var fragment = document.createDocumentFragment();
        var div = document.createElement("div");
        div.className =  config.container ;
        div.id =  config.container ;
        var ul = document.createElement('ul');
        ul.id = config.container + "_ul";
        ul.className = config.container + "_ul";
        div.appendChild(ul)
        fragment.appendChild(div);
        for (var i = 0; i < dataArrray.length; i++) {
            var li = document.createElement('li');
            li.className = config.container + "_li";
            if(dataArrray[i]){
            li.innerText = dataArrray[i].label;
            }
            ul.appendChild(li);
        }

        document.getElementById("mainmenuContainer").appendChild(fragment);
        fragment = null;
        var menuItems = document.querySelector("." + config.container + "_ul").children;
        menuItems[config.highlight].classList.toggle("highlight");
//        menuItems[config.highlight].className = menuItems[config.highlight].className + " highlight";
        if (config.orientation == "Horizontal") {
            for (var i = 0; i < menuItems.length; i++) {
                console.log(menuItems[index]);
                if (index < menuItems.length) {
                    if (index == config.highlight) {
                        if (menuItems[index].style.left === "" && menuItems[index + 1].style.left === "") {
                            menuItems[index].style.left = Math.floor(centerXPos - ( menuItems[index].offsetWidth / 2)) + "px";
                        } else {
                            menuItems[index].style.left = menuItems[index + 1].offsetLeft - (menuItems[index].offsetWidth + config.padding) + "px";
                        }
                    } else {
                        if (menuItems[index].style.left === "") {
                            menuItems[index].style.left = menuItems[index - 1].offsetLeft + menuItems[index - 1].offsetWidth + config.padding + "px";
                        }
                    }

                } else {
                    if (menuItems[tempInd - 1].style.left === "") {
                        menuItems[tempInd - 1].style.left = menuItems[tempInd].offsetLeft - (menuItems[tempInd - 1].offsetWidth + config.padding) + "px";
                    }
                    tempInd--;
                }
                index++;
            }
        } else if (config.orientation == "vertical") {
            var topval = 50;
            for (var i = 0; i < menuItems.length; i++) {
                menuItems[i].style.top = topval * i + "px";
            }
            alignCenter();
        }
        //alignCenter();

    };

    var alignCenter = function () {

        var elementCenter = document.querySelector("#" + config.container + "_ul").offsetLeft +(document.querySelector("#" + config.container + "_ul").offsetWidth /2);
        elementCenter = centerXPos - elementCenter ;
        document.querySelector("#" + config.container + "_ul").style.left = elementCenter + "px";
    };

    this.previous = function (data) {
        var original = document.getElementById(config.container + "_ul");
        var clone = original.cloneNode(true);
        var li = document.createElement('li');
        li.className = config.container + "_li";

        if (data) {
            li.innerText = data.label;
        }
        var left = original.firstChild.offsetLeft;
        clone.insertBefore(li, clone.firstChild);
        original.parentNode.replaceChild(clone, original);
        li.style.left = left - li.offsetWidth - config.padding + "px";
        var displayWidth = document.getElementById(config.container + "_ul").offsetWidth;
        var elements = document.querySelectorAll('.' + config.container + "_li");
        var elementCenter = elements[config.highlight].offsetLeft + ((elements[config.highlight].offsetWidth) / 2);
        newOffset = (centerXPos) - elementCenter;
        var pixVal = {
            x:newOffset,
            y:0,
            z:0
        }
        var targetDiv = document.getElementById(config.container + "_ul")
        targetDiv.childNodes[config.highlight+1].classList.toggle("highlight");
        targetDiv.childNodes[config.highlight].classList.toggle("highlight");

        animationObj.moveHorizontal (pixVal, targetDiv, animationEndPreviousCallBack)
        original = null;

    };

    var animationEndPreviousCallBack = function () {
        var original = document.getElementById(config.container + "_ul");
        var clone = original.cloneNode(true);
        clone.removeChild(clone.lastChild);
        original.parentNode.replaceChild(clone, original);
        original = null ;
    };

    var animationEndNextCallBack = function () {
        var original = document.getElementById(config.container + "_ul");
        var clone = original.cloneNode(true);
        clone.removeChild(clone.firstChild);
        original.parentNode.replaceChild(clone, original);
        original =   null;
    }
    this.next = function (data) {
        var original = document.getElementById(config.container + "_ul");
        var clone = original.cloneNode(true);
        var li = document.createElement('li');
        li.className = config.container + "_li";
        li.style.left = original.lastChild.offsetLeft + original.lastChild.offsetWidth + config.padding + "px";
        if (data) {
            li.innerText = data.label;
        }
        clone.appendChild(li);
        original.parentNode.replaceChild(clone, original);
        var displayWidth = document.getElementById(config.container + "_ul").offsetWidth;
        var elements = document.querySelectorAll('.' + config.container + "_li");
        var elementCenter = elements[config.highlight + 1].offsetLeft + ((elements[config.highlight + 1].offsetWidth /*- config.padding*/) / 2);
        newOffset = (centerXPos) - elementCenter;
        var pixVal = {
            x:newOffset,
            y:0,
            z:0
        }
        var targetDiv = document.getElementById(config.container + "_ul");
        targetDiv.childNodes[config.highlight].classList.toggle("highlight");
        targetDiv.childNodes[config.highlight+1].classList.toggle("highlight");
        animationObj.moveHorizontal (pixVal, targetDiv, animationEndNextCallBack) ;
        original = null;

    };

    var constructor = (function () {
        centerXPos = window.innerWidth / 2;
    }())

}
// CISCO CONFIDENTIAL
// Copyright (c) 2013, Cisco Systems, Inc.


/**
 * An Inteface for data retrieval.
 *
 * @class Model
 * @param p_paramObj
 *            {Object} json structure which contains following parameters.
 *            size - Window size
 *            highlight    - Highlight position
 *            buffer - Buffer count
 *
 * @constructor
 */
cisco.epg.widget.StaticModel = function () {
    var m_scrCallback , m_index , m_data;

    this.setData = function (p_data, p_callback) {
        if (p_data && p_data.length > 0) {
            m_data = p_data;
        }
        if (p_callback) {
            m_scrCallback = p_callback;
        }

    };


    /**
     * returns available item counts in forward dierction.
     *
     * @method hasNext
     * @param {Integer}
     * @return {Integer} returns available items count.
     */
    this.hasNext = function (p_count) {
        var l_index = m_index;
        var l_count = null;
        if (l_index + p_count < m_data.length) {
            l_count = p_count;
        } else {
            l_count = (m_data.length - 1) - l_index;
        }
        return l_count;
    };

    /**
     * returns available item counts in backward dierction.
     *
     * @method hasPrevious
     * @param {Integer}
     * @return {Integer} returns available items count.
     */
    this.hasPrevious = function (p_count) {
        var l_index = m_index;
        var l_count = null;
        if (l_index - p_count < 0) {
            l_count = l_index;
        } else {
            l_count = p_count;
        }
        return l_count;
    };
    /**
     * fetch data from begin of list.
     *
     * @method gotoBegin
     */
    this.toBegin = function (p_callback) {
    };
    /**
     * fetch data from end of the list.
     *
     * @method gotoEnd
     */
    this.toEnd = function (p_callback) {
    };

    /**
     * returns next item if available else return undefined.Responsible to
     * retrieve the next chunk of data and maintain the buffer count.
     *
     * @method next
     * @param {Object}
     *            call back function
     */
    this.next = function (p_callback) {
        var l_newIndex = m_index + 1;
        if (l_newIndex < 0 || l_newIndex >= m_data.length) {
            p_callback(null);
        } else {
            var l_nextElement = m_data[l_newIndex];
            m_index++;
            p_callback(l_nextElement);
        }
    };
    /**
     * returns previous item if available else return undefined.Responsible
     * to retrieve the next chunk of data and maintain the buffer count.
     *
     * @method previous
     * @param {Object}
     *            call back function
     */
    this.previous = function (p_callback) {
        var l_newIndex = m_index - 1;
        if (l_newIndex < 0 || l_newIndex >= m_data.length) {
            p_callback(null);
        } else {
            var l_prevElement = m_data[l_newIndex];
            m_index--;
            p_callback(l_prevElement);
        }
    };

    this.moveRelative = function (p_direction, p_position) {
        var l_direction = p_direction ? 1 : -1;
        var l_newIndex = m_index + (l_direction * p_position);
        l_newIndex = m_index == -1 ? l_newIndex + 1 : l_newIndex;
        if (l_newIndex >= 0 && l_newIndex < m_data.length) {
            m_index = l_newIndex;
        } else {
            throw new Error("index Out Of Bound");
        }

    };

    this.getContext = function () {
        var l_context = {};
        l_context.modelIndex = m_index;
        l_context.data = m_data;
        return l_context;
    };


    var constructor = (function () {
        m_index = -1;
        m_data = [];
    }());

}


// CISCO CONFIDENTIAL
// Copyright (c) 2013, Cisco Systems, Inc.

/**
 * @class cisco.epg.widget.ListPresentationVertical.
 */



cisco.epg.widget.ListPresentationVertical = function () {

    var newOffset , centerXPos    , animationObj, config, animationConfig;


    this.initialize = function (dataArrray, p_config, animation) {
        animationObj = animation.Obj;
        animationConfig = animation.Config;
        config = p_config;
        var index = config.highlight;
        var tempInd = config.highlight;
        var fragment = document.createDocumentFragment();
        var div = document.createElement("div");
        div.className =  config.container ;
        div.id =  config.container ;
        var ul = document.createElement('ul');
        ul.id = config.container + "_ul";
        ul.className = config.container + "_ul";
        div.appendChild(ul)
        fragment.appendChild(div);
        for (var i = 0; i < dataArrray.length; i++) {
            var li = document.createElement('li');
            li.className = config.container + "_li";
            if(dataArrray[i]){
                li.innerText = dataArrray[i].label;
            }
            ul.appendChild(li);
        }

        document.getElementById("mainmenuContainer").appendChild(fragment);
	fragment=null;
        var menuItems = document.querySelector("." + config.container + "_ul").children;
            var topval = config.itemHeight;
            for (var i = 0; i < menuItems.length; i++) {
                menuItems[i].style.top = topval * i + "px";
            }



    };



    this.previous = function (data) {
        var directionPrevious = 1;
        var original = document.getElementById(config.container + "_ul");
        var clone = original.cloneNode(true);
        var li = document.createElement('li');
        li.className = config.container + "_li";

        if (data) {
            li.innerText = data.label;
        }
        var top = original.firstChild.offsetTop;
        clone.insertBefore(li, clone.firstChild);
        original.parentNode.replaceChild(clone, original);
        li.style.top = top - config.itemHeight + "px";
        newOffset =  document.getElementById(config.container + "_ul").firstChild.offsetTop + config.itemHeight;
        var pixVal = {
            x:0,
            y:newOffset,
            z:0
        }
        var targetDiv = document.getElementById(config.container + "_ul")
        animationObj.moveVertical(pixVal, targetDiv, animationEndPreviousCallBack, animationConfig.itemHeight, directionPrevious);
	original=null;
    };

    var animationEndPreviousCallBack = function () {
        var original = document.getElementById(config.container + "_ul");
        var clone = original.cloneNode(true);
        clone.removeChild(clone.lastChild);
        original.parentNode.replaceChild(clone, original);
	original=null;
    };

    var animationEndNextCallBack = function () {
        var original = document.getElementById(config.container + "_ul");
        var clone = original.cloneNode(true);
        clone.removeChild(clone.firstChild);
        original.parentNode.replaceChild(clone, original);
	original=null;
    }
    this.next = function (data) {
        var directionNext = -1;
        var original = document.getElementById(config.container + "_ul");
        var clone = original.cloneNode(true);
        var li = document.createElement('li');
        li.className = config.container + "_li";
        li.style.top = original.lastChild.offsetTop + config.itemHeight + "px";
        if (data) {
            li.innerText = data.label;
        }
        clone.appendChild(li);
        original.parentNode.replaceChild(clone, original);
         newOffset = document.getElementById(config.container + "_ul").firstChild.offsetTop - config.itemHeight;
        var pixVal = {
            x:0,
            y:newOffset,
            z:0
        }
        var targetDiv = document.getElementById(config.container + "_ul" )
        animationObj.moveVertical(pixVal, targetDiv, animationEndNextCallBack ,animationConfig.itemHeight, directionNext);
	original=null;
    };

    var constructor = (function () {
        centerXPos = window.innerWidth / 2;
    }())

}
// CISCO CONFIDENTIAL
// Copyright (c) 2013, Cisco Systems, Inc.

//cisco.epg.widgets = cisco.epg.widgets || {};
if (!cisco.epg.widget.widgetFactory) {
    cisco.epg.widget.widgetFactory = (function () {

        var config;

        var createWidget = function (p_config) {
            config = JSON.stringify(p_config);
            config = JSON.parse(config);
            for (var key in config) {
                if (config[key].Class) {
	                config[key].Obj = new (eval(config[key].Class));
                }
            }
            return config;
        }
        return{
            createWidget:createWidget
        }
    }());
}

