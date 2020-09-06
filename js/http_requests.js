const config_api_url='http://midi-controller:8081'
const control_api_url='http://midi-controller:8090'

var sets = null;
var songs = null;
var pedals= null;
var setConfigDict = {};
var songConfigDict = {};
var pedalConfigDict = {};


function getSets() {
  $.getJSON(`${config_api_url}/sets`, function(result) {
    sets = result.Sets;
    console.log(result);
  });
}

function getSetsDict() {
  sets.forEach(set => {
     getSetConfig(set);
  });
}

function getSetConfig(set) {
  $.getJSON(`${config_api_url}/set/${set}`, function(result) {
    setConfigDict[set] = result;
    console.log(result);
  });
}

function getSongs() {
  $.getJSON(`${config_api_url}/songs`, function(result) {
    songs = result.Songs;
    console.log(result);
  });
}

function getSongsDict() {
  songs.forEach(song => {
     getSongConfig(song);
  });
}

function getSongConfig(song) {
  $.getJSON(`${config_api_url}/song/${song}`, function(result) {
    songConfigDict[song] = result;
    console.log(result);
  });
}

function getPedals() {
  $.getJSON(`${config_api_url}/pedals`, function(result) {
    pedals = result.Pedals;
    console.log(result);
  });
}

function getPedalsDict() {
  pedals.forEach(pedal => {
     getPedalConfig(pedal);
  });
}

function getPedalConfig(pedal) {
  $.getJSON(`${config_api_url}/pedal/${pedal}`, function(result) {
    pedalConfigDict[pedal] = result;
    console.log(result);
  });
}

function getAllDicts() {
  getSetsDict();
  getSongsDict();
  getPedalsDict();
}

// get midi controller's sets
getSets();
// get midi controller's songs
getSongs();
// get midi controller's pedals
getPedals();

setTimeout(getAllDicts, 4000);



// console.log(pedals)