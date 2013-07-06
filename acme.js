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
  } else if (typeof obj === "object") {
    this.el = obj;
  } else {
    throw new Error("Argument is of incorrect type");
  }

  this._css = this.el.style;
}

// Set addEvent based on event model available
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

        fn({                                        // Create our own event object and pass to fn we want to execute
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
        });
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

jsAcme.addEvent(document, "click", function(e) {
  alert("You just clicked the document, bro.");
});
