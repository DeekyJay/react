
window.addEventListener('load', function initMixer() {

  var elIcon = document.getElementById('icon');

  var elSmile = document.getElementById('smile');
  var elCry = document.getElementById('cry');
  var elHeart = document.getElementById('heart');
  var elLaugh = document.getElementById('laugh');

  mixer.display.position().subscribe(handleVideoResized);

  mixer.socket.on('onControlUpdate', handleControlUpdate);


  var showing = false;
  var isDragging = false;
  
  elSmile.onclick = function (ev) {
    mixer.socket.call('giveInput', {
      controlID: 'reacts_smile',
      event: 'click'
    });
  };

  elCry.onclick = function (ev) {
    mixer.socket.call('giveInput', {
      controlID: 'reacts_cry',
      event: 'click'
    });
  };
  
  elHeart.onclick = function (ev) {
    mixer.socket.call('giveInput', {
      controlID: 'reacts_heart',
      event: 'click'
    });
  };

  elLaugh.onclick = function (ev) {
    if (showing) return;
    mixer.socket.call('giveInput', {
      controlID: 'reacts_laugh',
      event: 'click'
    });
  };


  mixer.isLoaded();

  function handleVideoResized(position) {
    const overlay = document.getElementById('overlay');
    const player = position.connectedPlayer;
    overlay.style.position = 'absolute';
    overlay.style.top = `${player.top}px`;
    overlay.style.left = `${player.left}px`;
    overlay.style.width = `${player.width}px`;
    overlay.style.height = `${player.height}px`;
  }
  
  function handleControlUpdate (update) {
    const control = update.controls[0];
    if (control.controlID === 'toaster') {
      toaster.next(control.meta[control.controlID].value);
    } else {
      data[control.controlID] = control.meta[control.controlID].value;
    }
    console.log(control.controlID, data[control.controlID]);
  }

  function toggle (element, flag, side = '') { 
    element.setAttribute('class', flag ? `option show ${rightSide ? 'left' : 'right'}` : 'option');
  }

  var draggableEl, isOverlapping, magnet, move, moveMagnet, moveToPos, onTouchEnd, onTouchStart;
  var rightSide = false;

  draggableEl = document.querySelector('[data-drag]');

  isOverlapping = function(el1, el2) {
    var rect1, rect2;
    rect1 = el1.getBoundingClientRect();
    rect2 = el2.getBoundingClientRect();
    return !(rect1.top > rect2.bottom || rect1.right < rect2.left || rect1.bottom < rect2.top || rect1.left > rect2.right);
  };

  moveToPos = function(x, y) {
    var el;
    el = draggableEl;
    // finally apply the x, y to the top, left of the circle
    el.style.transform = 'translate(' + Math.round(x, 10) + 'px, ' + Math.round(y, 10) + 'px) translateZ(0)';
    el.style.webkitTransform = 'translate(' + Math.round(x, 10) + 'px, ' + Math.round(y, 10) + 'px) translateZ(0)';
  };

  move = function(event) {
    console.log(event.screenX, event.screenY);
    var diffX = Math.abs(this._touchOrigin.x - event.screenX);
    var diffY = Math.abs(this._touchOrigin.y - event.screenY);
    if (diffX < 5 && diffY < 5 && !isDragging) {
      return;
    }
    isDragging = true;
    var el, elRect, mx, my, overlapping, touchPos, x, y;
    el = draggableEl;
    elRect = el.getBoundingClientRect();
    x = this._posOrigin.x + event.screenX - this._touchOrigin.x;
    y = this._posOrigin.y + event.screenY - this._touchOrigin.y;
    $('body').addClass('moving');
    touchPos = {
      top: y,
      right: x + elRect.width,
      bottom: y + elRect.height,
      left: x
    };
    if ($(el).hasClass('transition')) {
      $(el).removeClass('transition');
    }
    if ($(el).hasClass('overlap')) {
      $(el).addClass('transition');
      setTimeout((function() {
        $(el).removeClass('transition');
      }), 100);
    }
    el.className = el.className.replace(' overlap', '');
    moveToPos(x, y);
  };

  onTouchStart = function(event) {
    console.log(event.screenX, event.screenY);
    isDragging = false;
    if (showing) {
      return;
    }
    var rect;
    rect = this.getBoundingClientRect();
    $('body').addClass('touching');
    $(this).removeClass('edge transition');
    this._touchOrigin = {
      x: event.screenX,
      y: event.screenY
    };
    this._posOrigin = {
      x: rect.left,
      y: rect.top
    };
  };
 
  onTouchEnd = function(event) {
    console.log(event.screenX, event.screenY);
    var isBody = event.currentTarget.localName === 'body';
    if (!isDragging) {
      if (isBody || (showing && event.target.id)) {
        return;
      }
      showing = !showing;
      toggle(elSmile, showing);
      toggle(elCry, showing);
      toggle(elHeart, showing);
      toggle(elLaugh, showing);
      return;
    }
    isDragging = false;
    var el, halfScreen, rect, width, x;
    el = draggableEl;
    rect = el.getBoundingClientRect();
    width = $('body').width();
    halfScreen = width / 2;
    if (!$(el).hasClass('overlap')) {
      $('body').removeClass('moving touching');
      x = rect.left + rect.width / 2 < halfScreen ? -20 : width + 5 - rect.width;
      rightSide = x > 0;
      toggle(elSmile, showing);
      toggle(elCry, showing);
      toggle(elHeart, showing);
      toggle(elLaugh, showing);
      $(el).addClass('edge');
      moveToPos(x, rect.top);
      setTimeout((function() {
        $(el).removeClass('edge');
      }), 500);
    }
  };

  $(draggableEl)
    .on('touchstart mousedown', onTouchStart)
    .on('touchmove drag', move)
    .on('touchend mouseup', onTouchEnd);

  $("body")
    .on('mouseleave', onTouchEnd);

  moveToPos($('body').width() / 2 - 30, 10);
});
