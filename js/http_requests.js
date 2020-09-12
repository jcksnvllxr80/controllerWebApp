const hostProtocol=document.location.protocol;
const midiController=document.location.hostname;
const config_api_url=`${hostProtocol}//${midiController}:8081`;
const control_api_url=`${hostProtocol}//${midiController}:8090/midi_controller`;

var sets = null;
var songs = null;
var pedals = null;
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

function loadSetlistsContent() {
  sets.forEach(set => {
    addItemToList(document.getElementById("set-list"), set, 'set');
  });
}

function loadSongsContent() {
  songs.forEach(song => {
    addItemToList(document.getElementById("song-list"), song, 'song');
  });
}

function addItemToList(list, fileNameYaml, itemType){
  list.appendChild(createListItem(fileNameYaml, itemType));
}

function addWipItemToList(list, fileNameYaml, itemType){
  list.appendChild(createWipListItem(fileNameYaml, itemType));
}

function createWipListItem(id, itemType) {
  var listItem = document.createElement("li");
  listItem.setAttribute('class', 'config-list-item');
  linkA = createLinkA(id, itemType);
  linkA.setAttribute('class', 'work-in-progress')
  listItem.appendChild(linkA);
  listItem.appendChild(createEditLinkA(id, itemType));
  return listItem;
}

function createListItem(id, itemType) {
  var listItem = document.createElement("li");
  listItem.setAttribute('class', 'config-list-item');
  listItem.appendChild(createLinkA(id, itemType));
  listItem.appendChild(createEditLinkA(id, itemType));
  return listItem;
}

function createPlainListItem(id) {
  var listItem = document.createElement("li");
  listItem.setAttribute('class', 'edit-config-list-item');
  listItem.appendChild(createPlainLinkA(id));
  return listItem;
}

function createPlainLinkA(id) {
  var listLink = document.createElement("a");
  listLink.setAttribute('draggable','true');
  listLink.setAttribute('id', id);
  listLink.textContent = id.replace('.yaml', '');
  return listLink;
}

function createLinkA(id, itemType) {
  var listLink = document.createElement("a");
  listLink.setAttribute('onClick', 'showConfigFile(this)');
  listLink.setAttribute('draggable','true');
  listLink.setAttribute('id', id);
  listLink.setAttribute('name', itemType);
  listLink.textContent = id.replace('.yaml', '');
  return listLink;
}

function createEditLinkA(id, itemType) {
  var editLink = document.createElement("a");
  editLink.setAttribute('class', 'edit-link');
  editLink.setAttribute('name', itemType);
  editLink.appendChild(createEditIconImg(id));
  return editLink;
}

function createOption(content) {
  var option = document.createElement("option");
  option.setAttribute('value', content);
  option.setAttribute('class', 'select-option');
  option.textContent = content.replace('.yaml', '');
  return option;
}

function createEditIconImg(id) {
  var editItemImg = document.createElement("img");
  editItemImg.setAttribute('onClick', 'editListItem(this)');
  editItemImg.setAttribute('id', id.replace('.yaml', ''));
  editItemImg.setAttribute('src', 'assets/cogwheel.png');
  editItemImg.setAttribute('class', 'edit');
  return editItemImg;
}

function editListItem(btnObj) {
  editType = btnObj.parentNode.name;
  editObj = btnObj.id;
  objFileName = `${editObj}.yaml`;
  console.debug(`Editing ${editType}, \'${objFileName}\'.`);
  if (editType.localeCompare('set') == 0) {
    modifySet(objFileName);
  } else if (editType.localeCompare('song') == 0) {
    modifySong(objFileName);
  } else {
    handleUnhandledType(editType);
  }
}

function modifySet(setFileName) {
  hideEditContent('set', false);
  document.getElementById(`set-edit-content`).value = setFileName;
  populateSetEditContent(setFileName);
}

function populateSetEditContent(setFileName) {
  document.getElementById("set-name-input").value = setConfigDict[setFileName].name;
  redrawAvailableSongs();
  redrawCurrentSongsInSet(setFileName);
}

function redrawAvailableSongs() {
  selectSongList = document.getElementById("set-song-edit-select");
  removeAllChildNodes(selectSongList);
  songs.forEach(song => {
    selectSongList.appendChild(createOption(song));
  });
}

function redrawCurrentSongsInSet(objFileName) {
  currentSongList = document.getElementById("set-current-song-list");
  removeAllChildNodes(currentSongList);
  setConfigDict[objFileName].songs.forEach(song => {
    currentSongList.appendChild(createPlainListItem(song));
  });
}

function removeAllChildNodes(parent) {
  while (parent.firstChild) {
      parent.removeChild(parent.firstChild);
  }
}

function modifySong(objFileName) {
  configJson = songConfigDict[objFileName];
  hideEditContent('song', false);
  document.getElementById(`song-edit-content`).value = objFileName;
  // TODO: got a lot of work here to come
}

function hideEditContent(type, hidden) {
  document.getElementById('edit-window').hidden = hidden;
  document.getElementById(`${type}-edit-content`).hidden = hidden;
}

function handleUnhandledType(unhandledType) {
  errorMessage = `This object type (${unhandledType}) is not handled yet.`;
  console.error(errorMessage);
  return errorMessage;
}

function showConfigFile(listObj) {
  document.getElementById('json-viewer').value = getJsonConfig(listObj);
  document.getElementById('json-view-state-cta').click();
}

function getJsonConfig(listObj) {
  if (listObj.name.localeCompare('set') == 0) {
    return JSON.stringify(setConfigDict[listObj.id], undefined, 2);
  }
  else if (listObj.name.localeCompare('song') == 0) {
    return JSON.stringify(songConfigDict[listObj.id], undefined, 2);
  }
  else {
    return handleUnhandledType(listObj.name);
  }
}

function addNewListItem(btnObj) {
  itemType = btnObj.id.split('-')[0];
  console.debug(`The add new ${itemType} button was pressed.`);
  itemName = getNameFromUser(itemType);
  if (isValidName(itemType, itemName)) {
    addWorkInProgressListItem(itemType, itemName);
  }
}

function addSelectedSongToSet(btnObj) {
  selectedSong = document.getElementById('set-song-edit-select').value;
  setlistName = btnObj.parentNode.value;
  console.debug(`Add ${selectedSong} to set, \'${setlistName}\'.`);
  setConfigDict[setlistName].songs.push(selectedSong);
  redrawCurrentSongsInSet(setlistName);
}

function addWorkInProgressListItem(itemType, itemName) {
  console.log(`Adding \'${itemName}\' to the ${itemType} list.`);
  addWipItemToList(document.getElementById(`${itemType}-list`), `${itemName}.yaml`, itemType);
  createNewJson(itemType, itemName);
}

function createNewJson(itemType, itemName) {
  getJsonTemplate(itemType).then(function(results) {
    itemJson = results.json;
    itemJson.name = itemName;
    addNewItemToGlobalVars(itemType, `${itemName}.yaml`, itemJson);
  });
}

function addNewItemToGlobalVars(itemType, itemFileName, itemJson) {
  if (itemType.localeCompare('set') == 0) {
    sets.push(itemFileName);
    setConfigDict[itemFileName] = itemJson;
  } else if (itemType.localeCompare('song') == 0) {
    songs.push(itemFileName);
    songConfigDict[itemFileName] = itemJson;
  }
}

function getJsonTemplate(itemType) {
  return $.getJSON(`data/${itemType}.json`).then(function(result) {
    console.log(result);
    return {
      json:result
    }
  });
}

function isValidName(itemType, itemName) {
  if (itemName == null || itemName.localeCompare("") == 0) {
    console.debug(`User cancelled creating a new ${itemType}.`);
    return false;
  }
  else if ((itemType.localeCompare('set') == 0 && sets.includes(`${itemName}.yaml`)) 
      || (itemType.localeCompare('song') == 0 && songs.includes(`${itemName}.yaml`))) {
    console.debug(`User tried creating a new ${itemType} with a name that is already in use: 
      \'${itemType}\'.`);
    alert(`A ${itemType} with the name \'${itemName}\' already exists! Please try again.`);
    return false;
  }
  else {
    console.debug(`User created a new ${itemType} named ${itemName}.`);
    return true;
  }
}

// function isEmpty(obj) {
//   return Object.keys(obj).length === 0;
// }

function getNameFromUser(itemType) {
  return prompt(`Please enter the ${itemType} name:`, `My new ${itemType}`);
}

// get midi controller's sets
getSets().then(function(returndata) {
  sets = returndata.sets;
  getSetsDict();
  loadSetlistsContent();
});

// get midi controller's songs
getSongs().then(function(returndata) {
  songs = returndata.songs;
  getSongsDict();
  loadSongsContent();
});

// get midi controller's pedals
getPedals().then(function(returndata) {
  pedals = returndata.pedals;
  getPedalsDict();
});

document.getElementById("controller-display").value = `Hello from: ${hostProtocol}//${midiController}:` + 
  `8000!!\n` + "Use \'Song Up\', \'Song Dn\', \'Part Up\', and \'Part Dn\' to navigate to the desired part, " +
  "and then use \'Select\' button to activate it.\nD-pad buttons: down=into menu, up=out of menu, left and " + 
  "right=navigate menu";
// console.log(pedals)