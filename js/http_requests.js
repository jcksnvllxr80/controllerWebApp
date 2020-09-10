const hostProtocol=document.location.protocol;
const midiController=document.location.hostname;
const config_api_url=`${hostProtocol}//${midiController}:8081`;
const control_api_url=`${hostProtocol}//${midiController}:8090/midi_controller`;

var songsLoaded = 0;
var setsLoaded = 0;
var pedalsLoaded = 0;
var sets = null;
var songs = null;
var pedals= null;
var setConfigDict = {};
var songConfigDict = {};
var pedalConfigDict = {};


function getSets() {
  return $.getJSON(`${config_api_url}/sets`).then(function(result) {
    console.log(result);
    return {
      sets:result.Sets
    }
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
  return $.getJSON(`${config_api_url}/songs`).then(function(result) {
    console.log(result);
    return {
      songs:result.Songs
    }
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
  return $.getJSON(`${config_api_url}/pedals`).then(function(result) {
    console.log(result);
    return {
      pedals:result.Pedals
    }
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

// function doLongButtonPress(btnObj) {
//   request = `${control_api_url}/long/${btnObj.name}`;
//   console.log(`Button ${btnObj.name} (${btnObj.id}) was longpressed/right-clicked. GET request: ${request}`);
//   $.getJSON(request, function(result) {
//     document.getElementById("controller-display").value = result.display_message.replace(/ - /g,"\n");
//     console.log(result);
//   });
// }

function doDpadButtonPress(btnObj) {
  request = `${control_api_url}/dpad/${btnObj.name}`;
  console.log(`Button ${btnObj.name} (${btnObj.id}) was pressed/clicked. GET request: ${request}`);
  $.getJSON(request, function(result) {
    document.getElementById("controller-display").value = result.display_message.replace(/ - /g,"\n");
    console.log(result);
  });
}


function doShortButtonPress(btnObj) {
  request = `${control_api_url}/short/${btnObj.name}`;
  console.log(`Button ${btnObj.name} (${btnObj.id}) was pressed/clicked. GET request: ${request}`);
  $.getJSON(request, function(result) {
    document.getElementById("controller-display").value = result.display_message.replace(/ - /g,"\n");
    console.log(result);
  });
}

function uiLoad() {
  if (!dataLoaded()) {
    console.log(`data loaded is ${dataLoaded()}`);
  };
  loadSetlistsContent()
  loadSongsContent() 
}

function loadSetlistsContent() {
  sets.forEach(set => {
    addItemToList(document.getElementById("setlist-list"), set, 'set');
  });
}

function loadSongsContent() {
  songs.forEach(song => {
    addItemToList(document.getElementById("song-list"), song, 'song');
  });
}

function addItemToList(list, fileNameYaml, class_type){
  list.appendChild(createListItem(fileNameYaml, class_type));
}

function createListItem(id, class_type) {
  var listItem = document.createElement("li");
  listItem.setAttribute('class', 'config-list-item');
  listItem.appendChild(createLinkA(id, class_type));
  return listItem;
}

function createLinkA(id, class_type) {
  var listLink = document.createElement("a");
  listLink.setAttribute('onClick', 'showConfigFile(this)');
  listLink.setAttribute('id', id);
  listLink.setAttribute('name', class_type);
  listLink.textContent = id.replace('.yaml', '');
  return listLink;
}

function showConfigFile(listObj) {
  document.getElementById('json-viewer').value = getJsonConfig(listObj);
  document.getElementById('json-view-state-cta').click();
}

function getJsonConfig(listObj) {
  if (listObj.name.localeCompare('song')) {
    return JSON.stringify(setConfigDict[listObj.id], undefined, 2);
  }
  else if (listObj.name.localeCompare('set')) {
    return JSON.stringify(songConfigDict[listObj.id], undefined, 2);
  }
  else {
    errorMessage = `This object type (${listObj.name}) is not handled yet.`
    console.error(errorMessage);
    return errorMessage;
  }
}

// function handleListClick(btnObj){
//   console.debug(`active element is ${document.activeElement.id}`)
//   console.debug(`clicked button is ${btnObj.id}`)
//   if (btnObj === document.activeElement) {
//     console.debug(`show ${btnObj.textContent} list items configuration.`);
//     showConfigFile(btnObj)
//   } else {
//     console.debug(`set ${btnObj.textContent} list item as focused.`);
//     btnObj.focus();
//   }
// }

function addNewSong(){
  console.log('adding new song');
}

function addNewSet(){
  console.log('adding new set');
}

function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}

// get midi controller's sets
getSets().then(function(returndata){
  sets = returndata.sets;
  getSetsDict();
  setsLoaded = 1;
});
// get midi controller's songs
getSongs().then(function(returndata){
  songs = returndata.songs;
  getSongsDict();
  songsLoaded = 1;
});
// get midi controller's pedals
getPedals().then(function(returndata){
  pedals = returndata.pedals;
  getPedalsDict();
  pedalsLoaded = 1;
});

function dataLoaded() {
  return (songsLoaded && setsLoaded && pedalsLoaded);
} 

// document.getElementById("controller-display").value = hostProtocol + "\n" + midiController  + "\n" + config_api_url + "\n" + control_api_url;
document.getElementById("controller-display").value = `Hello from:\n${hostProtocol}//${midiController}:8000!!\n` + "Use the \'Select\' button to start.";

uiLoad();

// console.log(pedals)