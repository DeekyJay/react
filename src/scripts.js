$(function () {
  mixer.display.position().subscribe(handleVideoResized);
  mixer.socket.on('onParticipantUpdate', handleParticipantUpdate);

  var $icon = $('#icon');
  var $options = $('#options');
  var prefix = 'reacts_';

  var showing = false;

  $icon.click(function () {
    showing = !showing;
    mixer.socket.call('giveInput', {
      controlID: `${prefix}open`,
      event: 'click',
      opened: showing
    });
  });

  function handleVideoResized(position) {
    const overlay = $('#overlay');
    const player = position.connectedPlayer;
    overlay.style.position = 'absolute';
    overlay.style.top = `${player.top}px`;
    overlay.style.left = `${player.left}px`;
    overlay.style.width = `${player.width}px`;
    overlay.style.height = `${player.height}px`;
  }

  function handleParticipantUpdate(update) {
    console.log(update);
  }

  mixer.isLoaded();
});
