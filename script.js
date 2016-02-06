"using strict";

var BOARD_SIZE = 9;

var player1array = new Array(BOARD_SIZE + 1);
var player2array = new Array(BOARD_SIZE + 1);
var playerTurn = null;
var turn = 0;
var movedShip = null;
var shipType = null;
var player = null;

$(function() {

  for (var i = 0; i < player1array.length; i++) {
    player1array[i] = new Array(BOARD_SIZE + 1);
    player2array[i] = new Array(BOARD_SIZE + 1);
  }

  for (var i = 0; i < player1array.length; i++) {
    for (var j = 0; j < player1array.length; j++) {
      player1array[i][j] = false;
      player2array[i][j] = false;
    }
  }


  /**
   * Create the boards
   */
  var board1 = document.getElementById('player1-board');
  var board2 = document.getElementById('player2-board');
  for (var i = 1; i <= BOARD_SIZE; i++) {
    for (var j = 1; j <= BOARD_SIZE; j++) {
      var div1 = document.createElement('div');
      div1.id = i + "" + j + "-1";
      div1.style.width = (100 / BOARD_SIZE) + "%";
      div1.style.height = (100 / BOARD_SIZE) + "%";
      board1.appendChild(div1);
      var div2 = document.createElement('div');
      div2.id = i + "" + j + "-2";
      div2.style.width = (100 / BOARD_SIZE) + "%";
      div2.style.height = (100 / BOARD_SIZE) + "%";
      board2.appendChild(div2);
    }
  }

  /**
   * Pick a ship to place
   */

  $('.ship').click(function(e) {
    movedShip = e.target;
    shipType = movedShip.className.split(" ")[1];
    if ($(e.target).parents('#left').length)
      player = 1;
    else
      player = 2;
    $('.board > div').not('.ship').removeClass();
    $('.board > div').not('.ship').addClass('place-ship ' + shipType);
    if ($(movedShip).hasClass('vertical'))
      $('.board > div').not('.ship').addClass('vertical');
  });

  /**
   * Place a ship on the board
   */
  $('body').on('click', '.place-ship', function(e) {
    if (validPlacement(player, movedShip, shipType, e.target)) {
      var parent = (player == 1 ? "#left" : "#right");
      // Remove ship from picking area
      $(parent + ' .ship-placeholder > .' + shipType).css('display', 'none');
      // Remove hover classes from empty squares
      $('.board > div').not('.ship').removeClass();
      var row = e.target.id.substr(0, 1);
      var col = e.target.id.substr(1, 1);
      var shipLength = shipType.substr(shipType.length-1, 1);
      if ($(movedShip).hasClass('vertical')) {
        $('#' + row + col + "-" + player).addClass('ship ' + shipType + ' vertical');
        for (var i = 1; i < shipLength; i++) {
          $('#' + (parseInt(row)+i) + col + "-" + player).addClass('ship');
        }
      }
      else {
        $('#' + row + col + "-" + player).addClass('ship ' + shipType);
        for (var i = 1; i < shipLength; i++) {
          $('#' + row + (parseInt(col)+i) + "-" + player).addClass('ship');
        }
      }

      if (player === 1) {
        if ($('#left .ship[style="display: none;"]').length === 10) {
          $('button#' + player).removeClass('hidden');
        }
      }
      else {
        if ($('#right .ship[style="display: none;"]').length === 10) {
          $('button#' + player).removeClass('hidden');
        }
      }

      /*movedShip = null;
      shipType = null;
      player = null;*/
    }
  });

  /**
   * Ready: hide ships and start game
   */
  $('button').click(function(e) {
    storeShips(e.target.id);
    $(e.target).hide();
    if ($('button[style]').length == 2) {
      $('#player1-board').addClass('shoot');
      $('.score').show();
      playerTurn = 1;
    }
  });


  /**
   * Reload the page
   */
   $('#reset').click(function() {
      location.reload();
   });


  /**
   * Shoot ship
   */
  $('body').on('click', '.shoot > div', function(e) {
    var row = e.target.id.substr(0, 1);
    var col = e.target.id.substr(1, 1);
    if (!$(e.target).hasClass('bomb')) {
      if (playerTurn === 1) {
        if (player2array[row][col]) {
          $(e.target).addClass('ship bomb');
          $('#left #shots').html("Shots: &nbsp; " + $('#left .bomb').length);
          $('#left #hits').html("Hits: &nbsp;&nbsp;&nbsp;&nbsp; " + $('#left .ship.bomb').length);
        }
        else {
          $(e.target).addClass('bomb');
          $('#left #shots').html("Shots: &nbsp; " + $('#left .bomb').length);
        }
      }
      else {
        if (player1array[row][col]) {
          $(e.target).addClass('ship bomb');
          $('#right #shots').html("Shots: &nbsp; " + $('#right .bomb').length);
          $('#right #hits').html("Hits: &nbsp;&nbsp;&nbsp;&nbsp; " + $('#right .ship.bomb').length);
        }
        else {
          $(e.target).addClass('bomb');
          $('#right #shots').html("Shots: &nbsp; " + $('#right .bomb').length);
        }
      }
      if ($('#player' + playerTurn + '-board .ship.bomb').length === 17) {
        $('#p' + playerTurn).html("Winner").css('color', '#AFB42B');
        $('.shoot').addClass('winner');
        $('.shoot').removeClass('shoot');
      }
      else {
        $('#player' + playerTurn + '-board').removeClass('shoot');
        playerTurn = (++turn) % 2 + 1;
        $('#player' + playerTurn + '-board').addClass('shoot');
      }
    }
  });

});

/**
 * Checks if the ship placement is valid, e.g. not outside of the board,
 * not on another ship, etc.
 * @param  player    the player placing the ship
 * @param  movedShip the ship that will be placed on the board
 * @param  shipType  the type of ship
 * @param  box       the square to place the ship in
 * @return          true if it is a valid placement
 */
function validPlacement(player, movedShip, shipType, box) {
  var shipLength = shipType.substr(shipType.length-1, 1);
  var row = box.id.substr(0, 1);
  var col = box.id.substr(1, 1);
  if ($(movedShip).hasClass('vertical')) {
    // Vertical ship
    if (BOARD_SIZE - shipLength < row - 1)
      return false;
    for (var i = 0; i < shipLength; i++) {
      if ($('#' + (parseInt(row)+i) + col + "-" + player).hasClass('ship'))
        return false;
    }
  }
  else {
    // Horizontal ship
    if (BOARD_SIZE - shipLength < col - 1)
      return false;
    for (var i = 0; i < shipLength; i++) {
      if ($('#' + row + (parseInt(col)+i) + "-" + player).hasClass('ship'))
        return false;
    }
  }
  return true;
}

/**
 * Stores the ships in a matrix and hides them from the board.
 * @param  player  the player board to store and hide
 */
function storeShips(player) {
  console.log(player);
  for (var i = 1; i <= BOARD_SIZE; i++) {
    for (var j = 1; j <= BOARD_SIZE; j++) {
      if ($('#' + i + j + "-" + player).hasClass('ship')) {
        if (player == 1)
          player1array[i][j] = true;
        else
          player2array[i][j] = true;
      }
    }
  }
  $('#player' + player + '-board > div').removeClass();
  if (player == 1)
    $('#left .ship').removeClass();
  else
    $('#right .ship').removeClass();
}