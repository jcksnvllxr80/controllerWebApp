const url='http://midi-controller:8081'

var sets = null;
var songs = null;
var pedals= null;
var midiPedalConfigDict = {};


function getSets() {
  $.getJSON(`${url}/sets`, function(result) {
    sets = result.Sets;
    console.log(result);
  });
}

function getSongs() {
  $.getJSON(`${url}/songs`, function(result) {
    songs = result.Songs;
    console.log(result);
  });
}

function getPedals() {
  $.getJSON(`${url}/pedals`, function(result) {
    pedals = result.Pedals;
    console.log(result);
  });
}

function getPedalsDict() {
  // while (pedals == null);
  pedals.forEach(pedal => {
     getPedalConfig(pedal);
  });
}

function getPedalConfig(pedal) {
  $.getJSON(`${url}/pedal/${pedal}`, function(result) {
    midiPedalConfigDict[pedal] = result;
    console.log(result);
  });
}

// get midi controller's sets
getSets();
// get midi controller's songs
getSongs();
// get midi controller's pedals
getPedals();

// setTimeout(function(){}, 1000);

getPedalsDict();

// console.log(pedals)