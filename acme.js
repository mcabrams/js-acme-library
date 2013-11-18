// Even though this will technically be used as a constructor,
// we begin it with lowercase since it will often be used as
// an object as well... May reconsider this.

function jsAcme(obj) {
  // Force creation of jsAcme object regardless
  // of how it ends up getting called
  if (this === window) {
    return new jsAcme(obj);
  }

  if (typeof obj === "string") {
    this.el = document.getElementById(obj);
  } else if (typeof obj === "object" && obj.nodeType && obj.nodeType === 1) { // Elements have nodeType === 1
    this.el = obj;
  } else {
    throw new Error("Argument is of incorrect type");
  }

  this._css = this.el.style;
}

// Set event instance methods
jsAcme.prototype.addEvent = function(event, fn) {
  jsAcme.addEvent(this.el, event, fn);

  return this;  // Allows us to chain methods together i.e., jsAcme("foo").addEvent(...).removeEvent(...);
};

jsAcme.prototype.removeEvent = function(event, fn) {
  jsAcme.removeEvent(this.el, event, fn);

  return this;
};

// TODO: .click, .mouseover, .mouseout are good targets for DRYing up
jsAcme.prototype.click = function(fn) {
  var that = this;  // Allows this to maintain context of our jsAcme object
  jsAcme.addEvent(this.el, "click", function(e) {
    fn.call(that, e);
  });

  return this;
};

jsAcme.prototype.mouseover = function(fn) {
  var that = this;  // Allows this to maintain context of our jsAcme object
  jsAcme.addEvent(this.el, "mouseover", function(e) {
    fn.call(that, e);
  });

  return this;
};

jsAcme.prototype.mouseout = function(fn) {
  var that = this;  // Allows this to maintain context of our jsAcme object
  jsAcme.addEvent(this.el, "mouseout", function(e) {
    fn.call(that, e);
  });

  return this;
};

// Set static event methods based on event model available
if (addEventListener) {                  // Standard Event Model (W3C)
  jsAcme.addEvent = function(obj, event, fn) {
    obj.addEventListener(event, fn, false);
  };

  jsAcme.removeEvent = function(obj, event, fn) {
    obj.removeEventListener(event, fn, false);
  };
} else if (attachEvent) {                // Legacy IE (yuck)
    jsAcme.addEvent = function(obj, event, fn) {
      var fnHash = "acme_e_" + event + fn;          // Hopefully unique method name for handler function

      obj[fnHash] = function() {                    // Create handler method on DOM object in order to access event props (emulation)
        var type = event.type,
            relatedTarget = null;                   // Set relatedTarget to null since it's only used in mouseover/mouseout

        // Set relatedTarget appropriately based on mouseover or mouseout
        if (type === "mouseover" || type === "mouseout") {
          relatedTarget = (type === "mouseover") ? event.fromElement : event.toElement;
        }

        var emulatedEvent = {                       // Create emulatory event object that we can pass to our handler fn
          target: event.srcElement,
          type: type,
          relatedTarget: relatedTarget,
          _event: event,
          preventDefault: function() {
                            this._event.returnValue = false;
                          },
         stopPropagation: function() {
                            this._event.cancelBubble = true;
                          }
        };

        fn.call(obj, emulatedEvent);  // Call our actual handler function
      }; // end of handler

      obj.attachEvent("on" + event, obj[fnhash]);
    }; // end of addEvent

    jsAcme.removeEvent = function(obj, event, fn) {
      var fnHash = "acme_e_" + event + fn;          // Recreate fnHash value, possible area for refactoring
      
      if (obj[fnHash]) {
        obj.detachEvent("on" + event, obj[fnHash]);
        delete obj[fnHash];                         // Delete method from object so it no longer exists
      } else {
        throw new Error(fnHash + " is not a function on the event object.");
      }
    };
} else {                                            // DOM Level 0 Event fallback assignment (gross)
    jsAcme.addEvent = function(obj, event, fn) {
      obj["on" + event] = fn;
    };

    jsAcme.removeEvent = function(obj, event, fn) {
      obj["on" + event] = null;
    };
}

console.log("hi there");
