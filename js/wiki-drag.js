;WikiDragger = (function(win,doc,undefined){
  var DRAGGER_CONTAINER_REF_ATTR = 'data-dragger-container';
      DRAGGING_WRAP_CLASS = 'dragging-wrap',
      DRAGGER_ITEM_CLASS = 'dragger-item';
  var COMPONENT_DASHED_CLASS = 'component-dashed';
      COMPONENT_CONTAINER_CLASS = 'component-container',
      COMPONENT_MENU_CLASS = 'component-menu',
      COMPONENT_BODY_CLASS = 'component-body';
      
  var helpers = (function(){
    var addEvent = (function(){
      if(typeof document.addEventListener === 'function'){
        return function(node, type, handler, useCapture){
          var type = type.replace(/^on/, '');
          node.addEventListener(type, handler, !!useCapture);
        }
      }else if(typeof document.attachEvent === 'function'){
        return function(node, type, handler){
          var type = 'on' + type.replace(/^on/, '');
          node.attachEvent(type, handler);
        }
      }else{
        return function(node, type, handler){
          var type = 'on' + type.replace(/^on/, '');
          node[type] = handler;
        }
      }
    })();
    
    var trim = function(str){
      return str.replace(/^\s+/g,'').replace(/\s+$/g,'');
    };
    
    var hasClass = function(node, cls){
      var classStr = '',
          cls = ' ' + trim(cls) + ' ';
      if(node && node.nodeType === 1){
        classStr = " " + node.className + " ";
      }
      return classStr.indexOf(cls) > -1;
    };
    
    var removeClass = function(node, cls){
      var classStr, i, len, tmp, result;
      cls = trim(cls);
      if(!!cls && !!node && node.nodeType === 1){
        result = [];
        classStr = node.className.split(/\s+/);
        for(i = 0, len = classStr.length; i < len; i++){
          tmp = classStr[i];
          if(tmp && tmp != cls){
            result.push(tmp);
          }
        }
        node.className = result.join(' ');
      }
    };
    
    var addClass = function(node, cls){
      if(!hasClass(node, cls)){
        node.className = node.className + " " + trim(cls);
      }
    }
    
    var getEventTarget = function(e){
      var et = e || window.event;
      return et.target || et.srcElement;
    };
    
    var getEvent = function(e){
      return e || window.event;
    };
    
    var getNode = function(ele) {
      if(!ele) return ele;
      return typeof ele == 'string' ? doc.getElementById(ele) : ele.nodeName ? ele : ele[0];
    };
    
    var getNodePosition = function(ele) {
      ele = getNode(ele);
      var t = ele.offsetTop;
      var l = ele.offsetLeft;
      while ( ele = ele.offsetParent) {
        t += ele.offsetTop;
        l += ele.offsetLeft;
      }
      return {
        top : t,
        left : l
      };
    };
    
    var getNodeSize = function(ele) {
      return {
        width : ele.offsetWidth,
        height : ele.offsetHeight
      };
    };
    
    var getNodeInfo = function(ele){  
      var nodePosition = getNodePosition(ele);
      var nodeSize = getNodeSize(ele);
      return {
        startX : nodePosition.left,
        endX : nodePosition.left + nodeSize.width,
        startY : nodePosition.top,
        endY : nodePosition.top + nodeSize.height
      };
    };
    
    var getMousePosition = function(e) {
      e = e || window.event;
      return {
        x : e.clientX + doc.body.scrollLeft + doc.documentElement.scrollLeft,
        y : e.clientY + doc.body.scrollTop + doc.documentElement.scrollTop
      }
    };
    
    return {
      addEvent : addEvent,
      getEventTarget : getEventTarget,
      getEvent : getEvent,
      trim : trim,
      hasClass : hasClass,
      addClass : addClass,
      removeClass : removeClass,
      getNode : getNode,
      getNodePosition : getNodePosition,
      getNodeSize : getNodeSize,
      getNodeInfo : getNodeInfo,
      getMousePosition : getMousePosition
    };
  })();
  
  /**
   * 用来生产组件
   * 调用方式ComponentFactory.create(Component);
   */
  var ComponentFactory = (function(){
     var ComponentFactory = {};
     var components = {};
     
     var appendComponentMenu = function(componentMenu){
       var menuRemove = doc.createElement('span');
       var menuDragger = doc.createElement('span');
       menuRemove.title = '移除';
       menuRemove.className = 'sys-menu glyphicon glyphicon-remove pull-right';
       menuDragger.title = '拖动';
       menuDragger.className = 'sys-menu glyphicon glyphicon-move pull-right';
       helpers.addClass(componentMenu, 'clearfix');
       componentMenu.appendChild(menuRemove);
       componentMenu.appendChild(menuDragger);
     };
     
     /**
      * 生产组件
      * @param object componentId 组件class的唯一标识
      * @return object component 组件实例 
      */
     var create = function(componentId){
       var componentWrap = doc.createElement('div');
       var componentBody = doc.createElement('div');
       var componentMenu = doc.createElement('div');
       var component = components[componentId].create();
       componentWrap.className = COMPONENT_CONTAINER_CLASS;
       componentBody.className = COMPONENT_BODY_CLASS;
       componentMenu.className = COMPONENT_MENU_CLASS;
       componentBody.appendChild(component);
       appendComponentMenu(componentMenu);
       componentWrap.appendChild(componentMenu);
       componentWrap.appendChild(componentBody);
       return componentWrap;
     };
     
     /**
      * 载入组件
      * @param object coms 组件类数组
      * 组件类必须提供可访问的唯一标识属性id和创建组件实例接口create
      */
     var loadComponents = function(coms){
       var i, len, component;
       if(len = coms.length){
         for(i = 0; i < len; i++){
           component = coms[i];
           components[component.id] = component;
         }
       }   
     };
     
     ComponentFactory.create = create;
     ComponentFactory.loadComponents = loadComponents;
     return ComponentFactory;
  })();
  
  var Dragger = (function(){ 
    var Dragger = function(options){
      this.currentItem = null;
      this.isMoving = false;
      this.showModel = true;
      this.dashedNode = null;
      this.dashedNodeInContainer = null;
      this.dashedNodeInContainerPosition = null;
      this.isFrommenu = true;
      this.dropContainer = helpers.getNode(options.dropContainer) || doc.body; 
      this.draggerableClass = options.draggerableClass || DRAGGER_ITEM_CLASS;
      this.draggerContainerRefAttr = options.draggerContainerRefAttr || DRAGGER_CONTAINER_REF_ATTR; 
      this.dropableClass = options.dropableClass || 'drop-container';
      
      this.draggingOffsetX = options.draggingOffsetX || 5;
      this.draggingOffsetY = options.draggingOffsetY || 5;
    };
    
    var appendChild = function(parent, child, baseNode, position){
      if(position === "before"){
        if (baseNode){
          parent.insertBefore(child, baseNode);
        } else {
          var firstItem = parent.firstChild;
          while(firstItem){
            if (firstItem.nodeType === 1){
              break;
            }
            firstItem = firstItem.nextSibling;
          }
          if(null != firstItem){
            parent.insertBefore(child, firstItem);
          }else{
            parent.appendChild(child);
          }
        }
      }else{
        if(baseNode){
          var nextItem = baseNode.nextElementSibling || baseNode.nextSibling;
          while(nextItem){
            if (nextItem.nodeType === 1) {
              break;
            }
            nextItem = nextItem.nextSibling;
          }
          if(null != nextItem){
            parent.insertBefore(child, nextItem);
          }else{
            parent.appendChild(child);
          }
        }else{
          parent.appendChild(child);
        }
      }
    };
    
    /**
     * 判断当前的鼠标所在的点是否在container元素里面
     */
    var isInContainer = function(x, y, container){
      return container.startX <= x && container.endX >= x && container.startY <= y && container.endY >= y;
    };
    
    /**
     * 获取插入的位置
     * @param object 插入容器
     * @param y 鼠标所在点在y轴的位置
     */
    var getInsertPosition = function(y, container){
       if((container.startY + container.endY) / 2 >= y){
          return "before";
       }else{
          return "after";
       }
    };
    
    /**
     * 获取最近能插入的祖先组件
     */
    var getParentComponentContainer = function(parent, component){
      var root = this.dropContainer;
      var prev = null, baseNode = null;
      while(parent){
        if(this.canBeChild(component, parent) || root == parent){
          baseNode = prev;
          break;
        }
        prev = parent;
        parent = parent.parentNode;
      }
      return {
        parent: parent,
        baseNode: baseNode
      };
    }
    
    /**
     * @param number x 鼠标所在X轴位置
     * @param number y 鼠标所在Y轴位置
     * @param object 鼠标所在的组件容器
     * @return object container：带插入位置的父容器；baseNode：带插入位置的参考节点；position：带插入位置相对参考节点的位置
     * container object, baseNode object, position string(before|after)
     */
    var findInsertPosition = function(x, y, mouseoncomponent, mouseon){
      var container = mouseoncomponent.parentNode;
      var baseNode = mouseoncomponent;
      var position = "after";
      var parentContainer = null;
      if(this.dropContainer == mouseoncomponent){
        container = mouseoncomponent;
        baseNode = null;
      }else{
        var containerTmp = getParentComponentContainer.call(this, mouseon, this.dashedNode.firstChild);
        container = containerTmp.parent;
        if(container != mouseoncomponent.parentNode){
          baseNode = containerTmp.baseNode;
        }
        if(baseNode){
          position = getInsertPosition(y, helpers.getNodeInfo(baseNode));
        }
      }
      return {
        container : container,
        baseNode : baseNode,
        position : position
      }
    };
    
    /**
     * 判断是否在元素时候包含在dashedContainerNode容器里
     */
    var isInDashedNodeInContainer = function(mouseon, dashedNodeInContainer){
      while(mouseon){
        if(mouseon === dashedNodeInContainer){
          return true;
        }
        mouseon = mouseon.parentNode;
      }
      return false;
    }
    
    /**
     * 实时更新dropcontainer的视图
     */
    var updateContainerView = function(e){
      var currentItemType = this.getComponentType(this.dashedNode.firstChild);
      var mouseon = helpers.getEventTarget(e);
      var mousepos = helpers.getMousePosition(e);
      var mouseoncomponent = mouseon;
      var oldPosition =  this.dashedNodeInContainerPosition, newPosition;
      while(mouseoncomponent){
        if(mouseoncomponent == this.dropContainer || helpers.hasClass(mouseoncomponent, COMPONENT_CONTAINER_CLASS)){
          break;
        }
        mouseoncomponent = mouseoncomponent.parentNode;
      }
      if(mouseoncomponent == this.dashedNode.firstChild || isInDashedNodeInContainer(mouseon, this.dashedNodeInContainer)){
        return
      };
      if(mouseoncomponent == null){
        if(this.dashedNodeInContainer && this.dashedNodeInContainer.parentNode){
          this.dashedNodeInContainer.parentNode.removeChild(this.dashedNodeInContainer);
        }
        return;
      }
      if(mouseoncomponent == this.dashedNodeInContainer){
        return;
      }
      if(!this.dashedNodeInContainer){
        if(!this.isFrommenu){
          this.dashedNodeInContainer = this.currentItem;
        }else{
          this.dashedNodeInContainer = this.dashedNode.firstChild.cloneNode(true);
        }
        helpers.addClass(this.dashedNodeInContainer, COMPONENT_DASHED_CLASS);
      }
      newPosition = findInsertPosition.call(this, mousepos.x, mousepos.y, mouseoncomponent, mouseon);
      newPosition.component = this.dashedNode;
      if(!oldPosition ||  newPosition.component != oldPosition.component || newPosition.container != oldPosition.container || newPosition.position != oldPosition.position || newPosition.baseNode != oldPosition.baseNode){
        appendChild(newPosition.container, this.dashedNodeInContainer, newPosition.baseNode, newPosition.position);
        this.dashedNodeInContainerPosition = newPosition;
      }
    };
    
    /**
     * 获取整个可拽托的容器，即含有draggerableClass的node节点
     * @param object target 触发mousedown事件的节点
     */
    var getDraggingContainer = function(target){
      var containerPath = target.getAttribute(this.draggerContainerRefAttr);
      if(containerPath){
         var path = containerPath.split('.');
         for(var i = 0; i< path.length; i++){
           target = target.parentNode;
         } 
      }
      return target;
    };
    
    /**
     *调整预览节点的位置 
     * @param object 触发拽托时鼠标点击事件对象,或者鼠标移动时的事件对象 
     */
    var positionDashedNode = function(e){
      var mousePos = helpers.getMousePosition(e);
      var dashedNodeStyle = this.dashedNode.style;
      dashedNodeStyle.position = 'absolute';
      dashedNodeStyle.left = (+mousePos.x + this.draggingOffsetX) + 'px';
      dashedNodeStyle.top = (+mousePos.y + this.draggingOffsetY) + 'px';
      dashedNodeStyle.width = '280px';
      dashedNodeStyle.height = 'auto';   
    };
    
    /**
     * 鼠标左键按下，准备开始拖动,onstart事件
     * @param object target 待拽托的元素
     */
    var onstart = function(e,target){
      this.currentItem = target;
      this.isMoving = true;
      this.onstart(target);
    };
    
    /**
     * 鼠标拖动元素，触发ondrag事件
     */
    var ondrag = function(e){
      this.dashedNode = this.getDashedNode(this.currentItem);
      document.body.appendChild(this.dashedNode);
      positionDashedNode.call(this, e);
      updateContainerView.call(this, e);
      this.ondrag(this.dashedNode, this.dropContainer, e);
    };
    
    /**
     * 鼠标释放，被拽托的元素，即将在页面渲染
     */
    var ondrop = function(e){
      this.isMoving = false;
      helpers.removeClass(this.dashedNodeInContainer, COMPONENT_DASHED_CLASS);
      this.dashedNodeInContainer = null;
      this.ondrop(this.dashedNode, this.dropContainer, e);
      if(this.dashedNode){
        this.dashedNode.parentNode.removeChild(this.dashedNode);
      }
      this.currentItem = null;
      this.dashedNode = null;
    };
    
    var bindEvent = function(dragger){
      var movingTimer = null;
      helpers.addEvent(doc,'onmousedown',function(e){
        var target = helpers.getEventTarget(e);
        target = getDraggingContainer.call(dragger, target);
        if(helpers.hasClass(target, dragger.draggerableClass)){
          onstart.call(dragger, e, target);
        }
      }, false);
      helpers.addEvent(doc,'onmousemove',function(e){
        if(dragger.isMoving){
          clearTimeout(movingTimer);
          movingTimer = setTimeout(function(){
            ondrag.call(dragger, e);
          },0);
        }
      }, false);
      helpers.addEvent(doc,'onmouseup',function(e){
        var target;
        if(dragger.isMoving){
          clearTimeout(movingTimer);
          ondrop.call(dragger, e);
        }
      }, false);
      helpers.addEvent(doc, 'dragstart', function(e) {
        if(dragger.isMoving){
          e = e || win.event;
          if (e.preventDefault) {
            e.preventDefault();
            e.stopPropagation();
          }
          return e.returnValue = false;
        }
      }, false);
      helpers.addEvent(doc, 'selectstart', function(e) {
        if(dragger.isMoving){
          e = e || win.event;
          if (e.preventDefault) {
            e.preventDefault();
            e.stopPropagation();
          }
          return e.returnValue = false;
        }
      }, false);
      
      helpers.addEvent(dragger.dropContainer, 'click', function(e){
        dragger.onclick(helpers.getEventTarget(e));
      }, false);
      
      helpers.addEvent(dragger.dropContainer, 'dblclick', function(e){
        dragger.ondblclick(helpers.getEventTarget(e));
      }, false);
    };
    
    var init = function(options){ 
      var dragger = new Dragger(options);
      bindEvent(dragger);
      return dragger;
    };
    
    Dragger.init = init;
    
    Dragger.prototype.onstart = function(target){};
    Dragger.prototype.ondrag = function(dashedNode, dropContainer){};
    Dragger.prototype.ondrop = function(dashedNode, dropContainer){};
    
    Dragger.prototype.getDashedNode = function(target){ return target;};
    Dragger.prototype.getDropedNode = function(){ return this.dashedNode;};
    Dragger.prototype.getComponentType = function(component){ return "component"};
    Dragger.prototype.canBeChild = function(child, father){ return false };
    
    Dragger.prototype.onclick = function(target){}
    Dragger.prototype.ondblclick = function(target){}
    return Dragger;
  })();
  
  /**
   * @param object target 选择的菜单栏的组件
   * @return object 根据选择的组件，生成组件拖拽时的预览节点
   */
  var createDashedNode = function(target){
     var draggingWrap = doc.createElement('div');
     var componentRef;
     if(!helpers.hasClass(target, COMPONENT_CONTAINER_CLASS)){
       componentRef = target.getAttribute(this.componentRefAttr);
       target = ComponentFactory.create(componentRef);
       target.setAttribute(this.componentRefAttr,componentRef);
       helpers.addClass(target, this.dragger.draggerableClass);
       target.firstChild.lastChild.setAttribute(this.dragger.draggerContainerRefAttr,'p.p');
     }else{
       target = target.cloneNode(true);
     }
     draggingWrap.className = DRAGGING_WRAP_CLASS;
     draggingWrap.appendChild(target);
     return draggingWrap;
  };
  
  /**
   * 分发dropcontainer容器的click事件
   * @param object target 事件的发生者
   * @param object targetInComponent target所在的组件
   */
   var dispathClickEvent = function(target, targetInComponent){
     if(doc.activeElement){
       doc.activeElement.contentEditable = false;
       target.onblur = null;
     }
     if(this.isDlgEditing){
       return false;
     }
     if(helpers.hasClass(target, 'glyphicon-remove')){
       return targetInComponent.parentNode.removeChild(targetInComponent);
     }
     if(target != this.dragger.dropContainer){
       if(target == targetInComponent || target == targetInComponent.firstChild || target == targetInComponent.lastChild){
         return false; 
       }
       if(target.nodeName.toUpperCase() === 'TD'){
         target = target.parentNode.parentNode.parentNode;
       }
       target.contentEditable = true;
       target.focus();
       target.onblur = function(){ target.contentEditable = false;}
       doc.activeElement = target;
     }
   };
   
   /**
   * 分发dropcontainer容器的dblclick事件
   * @param object target 事件的发生者
   * @param object targetInComponent target所在的组件
   */
   var dispathDBLClickEvent = function(target, targetInComponent){
     if(helpers.hasClass(target, 'sys-menu')){
       return false;
     }
     if(doc.activeElement){
       doc.activeElement.contentEditable = false;
       doc.activeElement.blur();
     }
     if(target != this.dragger.dropContainer){
       this.isDlgEditing = true;
       this.oneditindlg(targetInComponent);
     }
   };
  
  /**
   * 来自dropContainer容器的节点不需要重新创建
   * 新加入dropContainer的节点需要创建
   */
  var bindEvent = function(wikiDragger){
    var dragger = wikiDragger.dragger;
    dragger.ondrag = function(){
      helpers.addClass(this.dropContainer,'moving');
    };
    dragger.ondrop = function(){
      helpers.removeClass(this.dropContainer,'moving');
    };
    dragger.getDashedNode = function(target){
      if(this.dashedNode) return this.dashedNode;
      if(helpers.hasClass(target, COMPONENT_CONTAINER_CLASS)){
        this.isFrommenu = false;
      }else{
        this.isFrommenu = true;
      }
      return createDashedNode.call(wikiDragger, target);
    };
    dragger.getDropedNode = function(){
      if(this.isFrommenu){
        return this.dashedNode.firstChild;
      }else{
        return this.currentItem;
      }
    };
    dragger.getComponentType = function(component){
      return component.getAttribute(wikiDragger.componentRefAttr);
    };
    dragger.canBeChild = function(child, father){
      var parentComponent = null, childReg = father.getAttribute(wikiDragger.childComponentsAttr);
      if(childReg){
        childReg = ',' + childReg + ',';
        if(childReg.indexOf("," + child.getAttribute(wikiDragger.componentRefAttr) + ",") > -1){
          return true;
        }
      }
      return false
    };
    dragger.onclick = function(target){
      var targetIncomponent = target;
      while(targetIncomponent && targetIncomponent != this.dropContainer){
        if(helpers.hasClass(targetIncomponent, COMPONENT_CONTAINER_CLASS)){
          break;
        }
        targetIncomponent = targetIncomponent.parentNode;
      }
      dispathClickEvent.call(wikiDragger, target, targetIncomponent);
    };
    dragger.ondblclick = function(target){
      var targetIncomponent = target;
      while(targetIncomponent && targetIncomponent != this.dropContainer){
        if(helpers.hasClass(targetIncomponent, COMPONENT_CONTAINER_CLASS)){
          break;
        }
        targetIncomponent = targetIncomponent.parentNode;
      }
      dispathDBLClickEvent.call(wikiDragger, target, targetIncomponent);
    };
  };
  
  var WikiDragger = function(options){
    this.componentRefAttr = options.componentRefAttr || 'data-component-ref';
    this.childComponentsAttr = options.childComponentsAttr || 'data-child-components';
    this.dragger = Dragger.init(options);
  };
  
  var init = function(options){
    var wikiDragger = new WikiDragger(options);
    bindEvent(wikiDragger);
    return wikiDragger;
  };
  
  var loadComponents = function(components){
    ComponentFactory.loadComponents(components);
  };
  
  var getWikiEntity = function(){
    return this.dragger.dropContainer.cloneNode(true);
  };
  
  WikiDragger.prototype.loadComponents = loadComponents;
  WikiDragger.prototype.getWikiEntity = getWikiEntity;
  WikiDragger.prototype.oneditindlg = function(targetIncomponent){}
  
  WikiDragger.helpers = helpers;
  WikiDragger.init = init;
  return WikiDragger;
})(window, document);
