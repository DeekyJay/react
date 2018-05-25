
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
  var dateDown, dateUp;
  elIcon.onclick = function (ev) {
    showing = !showing;
    toggle(elSmile, showing);
    toggle(elCry, showing);
    toggle(elHeart, showing);
    toggle(elLaugh, showing);
  }
  
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

  function toggle (element, flag, side = 'right') { 
    element.setAttribute('class', flag ? `option show ${side}` : 'option');
  }

  var draggableEl, isOverlapping, magnet, move, moveMagnet, moveToPos, onTouchEnd, onTouchStart;
  var clickTimeout;

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
    if (!isDragging) {
      return;
    }
    var el, elRect, mx, my, overlapping, touchPos, x, y;
    el = draggableEl;
    elRect = el.getBoundingClientRect();
    x = this._posOrigin.x + event.pageX - this._touchOrigin.x;
    y = this._posOrigin.y + event.pageY - this._touchOrigin.y;
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
    isDragging = false;
    clearTimeout(clickTimeout);
    if (showing) {
      return;
    }
    dateDown = Date.now();
    var rect;
    rect = this.getBoundingClientRect();
    $('body').addClass('touching');
    $(this).removeClass('edge transition');
    console.log(event, rect);
    this._touchOrigin = {
      x: event.pageX,
      y: event.pageY
    };
    this._posOrigin = {
      x: rect.left,
      y: rect.top
    };
    console.log(this._posOrigin, this._touchOrigin);
    clickTimeout = setTimeout(function() {
      isDragging = true;
    }, 400);
  };

  onTouchEnd = function(event) {
    console.log(event);
    var el, halfScreen, rect, width, x;
    el = draggableEl;
    rect = el.getBoundingClientRect();
    width = $('body').width();
    halfScreen = width / 2;
    if (!$(el).hasClass('overlap')) {
      $('body').removeClass('moving touching');
      x = rect.left + rect.width / 2 < halfScreen ? -10 : width + 10 - rect.width;
      console.log(x);
      $(el).addClass('edge');
      moveToPos(x, rect.top);
      setTimeout((function() {
        $(el).removeClass('edge');
      }), 500);
    }
  };

  $(draggableEl).on('touchstart mousedown', onTouchStart).on('touchmove drag', move).on('touchend mouseup', onTouchEnd);

  moveToPos($('body').width() / 2 - 30, 10);
});
