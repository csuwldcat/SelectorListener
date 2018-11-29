(function(){
	
	var events = {},
      selectors = {},
      animationCount = 0,
      styles = document.createElement('style'),
      keyframes = document.head.appendChild(document.head.appendChild(styles).cloneNode()),
      prefix = window.CSSKeyframesRule ? { css: '', event: 'animationstart' } : { css: '-webkit-', event: 'webkitAnimationStart' },
      startEvent = function(e){
        e.selector = (events[e.animationName] || {}).selector;
        ((this.selectorListeners || {})[e.animationName] || []).forEach(function(fn) { fn.call(this, e) }, this);
      }
  
	HTMLDocument.prototype.addSelectorListener = HTMLElement.prototype.addSelectorListener = function(exp, fn){
    var atRule = typeof exp === 'string' ? '' : exp[0];
    var selector = atRule ? exp[1] : exp;
    var exp = atRule ? exp.map(Function.prototype.call, String.prototype.trim).join(' ') : exp;
		var key = selectors[exp],
			  listeners = this.selectorListeners = this.selectorListeners || { count: 0 };
			
		if (key) events[key].count++;
		else {
			key = selectors[exp] = 'SelectorListener-' + animationCount++;
      var style = selector + '::before { content: ""; ' + prefix.css + 'animation: ' + key + '}';
			styles.sheet.insertRule(atRule ? atRule + '{' + style + '}' : style, 0);
			events[key] = {
        count: 1,
        selector: exp,
        keyframe: keyframes.appendChild(document.createTextNode('@' + prefix.css + 'keyframes ' + key + ' { to { --selector-listeners: 1 } }')),
        rule: styles.sheet.cssRules[0]
      };
		} 
		
		listeners.count ? listeners.count++ : this.addEventListener(prefix.event, startEvent, true);
		
		(listeners[key] = listeners[key] || []).push(fn);
	};
	
	HTMLDocument.prototype.removeSelectorListener = HTMLElement.prototype.removeSelectorListener = function(exp, fn){
    var exp = typeof exp === 'string' ? exp : exp.join(' ') ;
		var listeners = this.selectorListeners || {},
			  key = selectors[exp],
			  listener = listeners[key] || [],
			  index = listener.indexOf(fn);
			
		if (index > -1){
			var event = events[selectors[exp]];
			if (!--event.count){
				styles.sheet.deleteRule(styles.sheet.cssRules.item(event.rule));
				keyframes.removeChild(event.keyframe);
				delete events[key];
				delete selectors[exp];
			}
			
			listeners.count--;
			listener.splice(index, 1);
			if (!listeners.count) this.removeEventListener(prefix.event, startEvent);
		}
	};
	
})();
