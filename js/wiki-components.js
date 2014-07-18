;var WikiHeader = (function(doc, win, undefiend){
  var WikiHeader = function(){
    
  };
  
  var create = function(){
    var div = doc.createElement('div');
    div.innerHTML = '<h1 class="title"><div class="lemma-title-h1">词条名<span class="small">(补充说明)</span></div></h1>';
    return div.firstChild;
  };
  
  WikiHeader.create  = create;
  WikiHeader.id = 'wikiheader';
  return WikiHeader
})(document,window);

var WikiSummaryStruct = (function(doc, win, undefiend){
  var WikiSummaryStruct = function(){
    
  };
  
  var create = function(){
    var div = doc.createElement('div');
    div.innerHTML = '<div class="card-summary">' +
                      '<div class="card-summary-content child-components" data-child-components="wikiparagraph"></div>' +
                    '</div>';
    return div.firstChild;
  };
  
  WikiSummaryStruct.create  = create;
  WikiSummaryStruct.id = 'wikisummarystruct';
  return WikiSummaryStruct;
})(document,window);

var WikiTableInfo = (function(doc, win, undefiend){
  var WikiTableInfo = function(){
    
  };
  
  var create = function(){
    var div = doc.createElement('div');
    div.innerHTML = '<div class="base-info">' +
                        '<table class="table"><tbody>' +
                            '<tr><td>中文名</td><td>J.K罗琳</td><td>出生地</td><td>英国格温特郡</td></tr>' +
                            '<tr><td>外文名</td><td>J.K. Rowling</td><td>出生日期</td><td>1965年7月31日</td></tr>' +
                          '</tbody>' +
                        '</table>' +
                      '</div>' +
                    '</div>';
    return div.firstChild;
  };
  
  WikiTableInfo.create  = create;
  WikiTableInfo.id = 'wikitableinfo';
  return WikiTableInfo;
})(document,window);

var WikiDespStruct = (function(doc, win, undefiend){
  var WikiDespStruct = function(){
    
  };
  
  var create = function(){
    var div = doc.createElement('div');
    div.innerHTML = '<div class="desp">' +
                      '<h2 class="headline">' +
                        '<span class="headline-index">1</span>' +
                        '<span class="headline-content">人物经历</span>' +
                      '</h2>' +
                      '<div class="child-components" data-child-components="wikiparagraph"></div>'
                    '</div>';
    return div.firstChild;
  };
  
  WikiDespStruct.create  = create;
  WikiDespStruct.id = 'wikidespstruct';
  return WikiDespStruct;
})(document,window); 

var WikiReference = (function(doc, win, undefiend){
  var WikiReference = function(){
    
  };
  
  var create = function(){
    var div = doc.createElement('div');
    div.innerHTML = '<div class="refer-item">' +
                      '<span class="refer-index">1.</span>' +
                      '<span class="refer-summary">' +
                        '<a href="">孩提时代的足迹</a>' +
                        '<a href="" class="fa fa-share-square-o"></a>' +
                      '</span>' +
                      '<span>.sina</span>' +
                      '<span>.2012-06-04</span>' +
                    '</div>';
    return div.firstChild;
  };
  
  WikiReference.create  = create;
  WikiReference.id = 'wikireference';
  return WikiReference;
})(document,window);

var WikiReferenceStruct = (function(doc, win, undefiend){
  var WikiReferenceStruct = function(){
    
  };
  
  var create = function(){
    var div = doc.createElement('div');
    div.innerHTML = '<div class="wiki-refer">' +
                      '<div class="refers-head">' +
                        '<h2 class="refers-title">参考资料</h2>' +
                      '</div>' +
                      '<div class="refer-list child-components" data-child-components="wikireference"></div>' +
                    '</div>';
    return div.firstChild;
  };
  
  WikiReferenceStruct.create  = create;
  WikiReferenceStruct.id = 'wikireferencestruct';
  return WikiReferenceStruct;
})(document,window);



var WikiParagraph = (function(doc, win, undefiend){
  var WikiParagraph = function(){};
  
  var create = function(){
    var div = doc.createElement('div');
    div.innerHTML = '<div class="para">这是一个段落</div>';
    return div.firstChild;
  };
  
  WikiParagraph.create  = create;
  WikiParagraph.id = 'wikiparagraph';
  return WikiParagraph;
})(document,window);
