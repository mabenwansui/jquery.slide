;(function( $, window ){
  
  var pluginName = "slide",
      classname  = "slide-js",
      document = window.document,
      defaults = {
        tabtag : "auto",        //切换时的标签 auto为js自动创建  auto,number为js自动创建带数字的
        conbox : null,          //内容容器
        contag : null,          //内容标签
        act    : "click",       //事件  click hover
        auto   : 5000,          //false为不自动轮播   数字型为轮播时间
        delay  : 200,           //hover是的延时
        effect : "scrollx",     //效果支持scrollx  fade
        speed  : 800,           //效果持续的时间
        init   : null,          //插件初始化回调
        callback : null,        //点击tab时回调
        executed : null         //效果执行完回调
      };

  function Plugin( element, options ) {
    this.element = element;
    this.options = $.extend( {}, defaults, options);
    this._last   = 0;
    this._total  = this.options.contag.length;
    this._index  = 0;
    this._html   = this.element.html();
    this.init();
  };

  Plugin.prototype.init = function(){
    if(this._total<2) return false;
    if(typeof this.options.tabtag=="string" && this.options.tabtag.indexOf("auto")>-1){
      this.createTitle();
    };  
    this.options.effect ? this[this.options.effect]() : this.noEffect();
    this.bindEvent();
    this.options.auto && this.autoRun();
    this.options.init && this.options.init.call(this);
  };

  Plugin.prototype.createTitle = function(){
    var that = this;
    if(this.element.find("."+pluginName+"-title").length>1) return false;
    var $title = $('<div class="'+pluginName+'-title"></div>').prependTo(this.element);
    this.options.contag.each(function(i){
      if(that.options.tabtag.toLocaleLowerCase().indexOf("number")>-1){
        $("<a>"+(i+1)+"</a>").appendTo($title);
      }else{
        $("<a>&nbsp;</a>").appendTo($title);
      }       
    });
    this.options.tabtag = $title.find("a");
  };

  Plugin.prototype.scrollx = function(){
    var that   = this,
        conbox = this.options.conbox,
        contag = this.options.contag,
        colsw  = conbox.width(),
        wrap   = contag.wrapAll("<div></div>").parent();
    conbox.css({width:colsw, overflow:"hidden", position:"relative"});
    wrap.css({width:(contag.length+1)*colsw, overflow:"hidden"});
    contag.css({
      float:"left", 
      width:colsw-parseInt(contag.css("padding-left"))-parseInt(contag.css("padding-right")), 
      display:"block"
    }).first().clone(true).appendTo(wrap);
    conbox.on("change"+pluginName, function(event, index){
      if(that._last==that._total-1 && that._index==0){
        wrap.stop().animate({"margin-left":-that._total*colsw}, that.options.speed, function(){
          wrap.css("margin-left",0);
          that.options.executed && that.options.executed.call(that);
        });
      }else if(that._index==that._total-1 && that._last==0){
        wrap.stop().css("margin-left",-that._total*colsw).animate({"margin-left":-index*colsw}, that.options.speed, function(){
          that.options.executed && that.options.executed.call(that);
        });
      }else{
        wrap.stop().animate({"margin-left":-index*colsw}, that.options.speed, function(){
          that.options.executed && that.options.executed.call(that);
        });
      }    
    });
  };

  Plugin.prototype.fade = function(){
    var that   = this,
        conbox = this.options.conbox,
        contag = this.options.contag;
    this.options.tabtag.first().addClass("active");
    contag.css({ "position" : "absolute" }).each(function(i){
      $(this).css("zIndex", that._total-i);
    });
    conbox.on("change"+pluginName, function(event, index){
      contag.eq(that._index).css({
        'opacity' : 0,
        'z-index' : 3
      }).animate({opacity:1}, that.options.speed, function(){
        that.options.executed && that.options.executed.call(that);
      }).siblings(contag).css('z-index',1);
      contag.eq(that._last).css({'z-index':2});
    });
  };

  Plugin.prototype.noEffect = function(){
    var that   = this, 
        conbox = this.options.conbox,
        contag = this.options.contag;
    this.options.tabtag.first().addClass("active");
    this.options.conbox.on("change"+pluginName, function(event, index){
      contag.eq(that._index).show().siblings(contag).hide();
      that.options.executed && that.options.executed.call(that);
    });
  };

  Plugin.prototype.bindEvent = function(){
    var that = this;
    var func = function($this){
      if($this.hasClass("active")) return false;
      that._index = that.options.tabtag.index($this);
      $this.addClass("active").siblings().removeClass("active");
      that.options.conbox.trigger("change"+pluginName, [that._index]);
      that._last = that._index;
    };
    switch(that.options.act){
      case "hover":
        var _in;
        this.options.tabtag.on("mouseenter."+pluginName,function(){
          var self = $(this);
          _in = setTimeout(function(){ 
            func(self);
          }, that.options.delay);
        }).on("mouseleave."+pluginName,function(){
          clearTimeout(_in);      
        });
      case "click" :
      default :
        this.options.tabtag.on("click."+pluginName, function(){
          that.options.callback && that.options.callback.call(this);
          func($(this));
        }).first().trigger("click");
    }
  };

  Plugin.prototype.prev = function(){
    var i = this._index==0 ? this._total-1 : this._index-1;
    this.options.tabtag.eq(i).trigger("click");
  };

  Plugin.prototype.next = function(){
    var i = this._index>=this._total-1 ? 0 : this._index+1;
    this.options.tabtag.eq(i).trigger("click");
  };  

  Plugin.prototype.autoRun = function(){
    var that = this,
        timer;
    that.element.on("mouseenter."+pluginName, function(){
      clearInterval(timer);
    });
    that.element.on("mouseleave."+pluginName, function(){
      timer = setInterval(function(){ that.next() }, that.options.auto);
    }).triggerHandler("mouseleave."+pluginName);
  };

  Plugin.prototype.destroy = function(){
    this.element.html( this._html );
    if(this.options.act=="hover"){
      this.element.off("mouseenter."+pluginName)
                  .off("mouseleave."+pluginName);
      this.element.removeData('plugin_'+pluginName);
    };
  }

  $.fn[pluginName] = function ( options ) {
    if (typeof options == 'string') {
      var args=arguments, method=options;
      Array.prototype.shift.call(args);
      return this.each(function(){
        var plugin = $.data(this, 'plugin_'+pluginName);
        if(plugin && plugin[method]) plugin[method].apply(plugin, args);
      });
    }else{
      return this.each(function() {
        var plugin = $.data(this, 'plugin_'+pluginName);
        if(!plugin){
          $.data(this, 'plugin_'+pluginName, new Plugin( $(this), options ));
        }
      });
    }
  };
})( jQuery, window );

