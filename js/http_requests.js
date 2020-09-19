const hostProtocol=document.location.protocol;
const midiController=document.location.hostname;
const config_api_url=`${hostProtocol}//${midiController}:8081`;
const control_api_url=`${hostProtocol}//${midiController}:8090/midi_controller`;

var sets = null;
var songs = null;
var pedals = null;
var setConfigDict = {};
var wipSetConfigDict = {};
var songConfigDict = {};
var wipSongConfigDict = {};
var pedalConfigDict = {};
var wipPedalConfigDict = {};
var defaultParts = ['Bridge', 'Chorus', 'Coda', 'Interlude', 'Intro', 'Outro', 'Pre-Chorus', 'Refrain', 'Turn-Around', 'Verse'];


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

function reloadSetlistsContent() {
  sets.forEach(set => {
    if (set in setConfigDict) {
      addItemToList(document.getElementById("set-list"), set, 'set');
    } else {
      addWipItemToList(document.getElementById("set-list"), set, 'set');
    }
  });
}

function reloadSongsContent() {
  songs.forEach(song => {
    if (song in songConfigDict) {
      addItemToList(document.getElementById("song-list"), song, 'song');
    } else {
      addWipItemToList(document.getElementById("song-list"), song, 'song');
    }
  });
}

function redrawSetlistsContent() {
  removeAllTabContentListChildNodes(document.getElementById("set-list"));
  reloadSetlistsContent();
}

function redrawSongsContent() {
  removeAllTabContentListChildNodes(document.getElementById("song-list"));
  reloadSongsContent();
}

// function evaluateSetlistsContent(oldSetName, newSetName) {
//   editChangedChildNode(document.getElementById("set-list"), newSetName, oldSetName);
// }

// function editChangedChildNode(setListObj, newSetName, oldSetName) {
//   for (i = 1; i <= setListObj.children.length; i++) {
//     childNode = setListObj.children[i].children;
//     if (childNode[0].id.localeCompare(oldSetName) == 0) {
//       childNode[0].id = `${newSetName}.yaml`;
//       childNode[0].textContent = newSetName;
//       childNode[1].id = newSetName;
//       childNode[2].children[0] = `delete-${newSetName}`;
//       return;
//     }
//   }
// }

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
  listItem.appendChild(createTrashLinkA(id, itemType));
  return listItem;
}

function createListItem(id, itemType) {
  var listItem = document.createElement("li");
  listItem.setAttribute('class', 'config-list-item');
  listItem.appendChild(createLinkA(id, itemType));
  listItem.appendChild(createEditLinkA(id, itemType));
  listItem.appendChild(createTrashLinkA(id, itemType));
  return listItem;
}

function createRemovableListItem(id) {
  var listItem = document.createElement("li");
  listItem.setAttribute('class', 'edit-config-list-item');
  listItem.appendChild(createRemovableLinkA(id));
  listItem.appendChild(createRemoveLinkA(id));
  return listItem;
}

function createRemovableLinkA(id) {
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

function createTrashLinkA(id, itemType) {
  var editLink = document.createElement("a");
  editLink.setAttribute('class', 'delete-link');
  editLink.setAttribute('name', itemType);
  editLink.appendChild(createTrashIconImg(id));
  return editLink;
}

function createRemoveLinkA(id) {
  var editLink = document.createElement("a");
  editLink.setAttribute('class', 'remove-link');
  editLink.appendChild(createRemoveIconImg(id));
  return editLink;
}

function createOption(content) {
  content = content.replace('.yaml', '')
  var option = document.createElement("option");
  option.setAttribute('value', content);
  option.setAttribute('class', 'select-option');
  option.textContent = content;
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

function createTrashIconImg(id) {
  var editItemImg = document.createElement("img");
  editItemImg.setAttribute('onClick', 'deleteListItem(this)');
  editItemImg.setAttribute('id', `delete-${id.replace('.yaml', '')}`);
  editItemImg.setAttribute('src', 'assets/trash.png');
  editItemImg.setAttribute('class', 'delete');
  return editItemImg;
}

function createRemoveIconImg(id) {
  var editItemImg = document.createElement("img");
  editItemImg.setAttribute('onClick', 'remSongFromSetBtnAction(this)');
  editItemImg.setAttribute('id', `remove-${id.replace('.yaml', '')}`);
  editItemImg.setAttribute('src', 'assets/minus.png');
  editItemImg.setAttribute('class', 'remove');
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

function remSongFromSetBtnAction(remBtnObj) {
  songNameToRemove = remBtnObj.id.replace("remove-", "");
  setToRemoveSongFrom = document.getElementById("set-edit-content").value;
  removeSongFromSet(setToRemoveSongFrom, songNameToRemove);
}

function removeSongFromSet(setlistName, songToRemove) {
  console.debug(`Removing song, \'${songToRemove}\', from set, \'${setlistName}\'.`);
  if (document.getElementById(setlistName).className.localeCompare("work-in-progress") == 0) {
    wipSetConfigDict[setlistName].songs = wipSetConfigDict[setlistName].songs.filter(e => e !== songToRemove);
  } else {
    wipSetConfigDict[setlistName] = setConfigDict[setlistName];
    delete setConfigDict[setlistName];
    wipSetConfigDict[setlistName].songs = wipSetConfigDict[setlistName].songs.filter(e => e !== songToRemove);
    redrawSetlistsContent();
  }
  redrawCurrentSongsInSet(setlistName);
}

function modifySet(setFileName) {
  hideEditContent('set', false);
  document.getElementById(`set-edit-content`).value = setFileName;
  populateSetEditContent(setFileName);
}

function populateSetEditContent(setFileName) {
  document.getElementById("set-name-input").value = getJsonForSetDotYaml(setFileName).name;
  redrawAvailableSongs();
  redrawCurrentSongsInSet(setFileName);
}

function redrawAvailableSongs() {
  selectSongList = document.getElementById("set-song-edit-select");
  removeAllChildNodes(selectSongList);
  songs.forEach(song => {
    if (song in songConfigDict) {
      selectSongList.appendChild(createOption(song));
    }
  });
}

function getJsonForSetDotYaml(setlistName) {
  if (document.getElementById(setlistName).className.localeCompare("work-in-progress") == 0) {
    return wipSetConfigDict[setlistName];
  } else {
    return setConfigDict[setlistName];
  }
}

function redrawCurrentSongsInSet(setName) {
  currentSongList = document.getElementById("set-current-song-list");
  removeAllChildNodes(currentSongList);
  redrawSetlistsContent();
  getJsonForSetDotYaml(setName).songs.forEach(song => {
    currentSongList.appendChild(createRemovableListItem(song));
  });
}

function removeAllTabContentListChildNodes(parent) {
  addItemChild = null;
  while (parent.firstChild) {
    if (parent.firstChild.className == "add-item") {
      addItemChild = parent.firstChild;
    }
    parent.removeChild(parent.firstChild);
  }
  if (addItemChild) {
    parent.appendChild(addItemChild);
  }
}

function modifySong(setFileName) {
  hideEditContent('song', false);
  document.getElementById(`song-edit-content`).value = setFileName;
  populateSongEditContent(setFileName);
}

function populateSongEditContent(songFileName) {
  document.getElementById("song-name-input").value = getJsonForSongDotYaml(songFileName).name;
  drawAvailableParts();
  redrawCurrentPartsInSong(songFileName);
}

function drawAvailableParts() {
  selectPartList = document.getElementById("song-part-edit-select");
  removeAllChildNodes(selectPartList);
  defaultParts.forEach(part => {
    selectPartList.appendChild(createOption(part));
  });
}

function getJsonForSongDotYaml(songName) {
  if (document.getElementById(songName).className.localeCompare("work-in-progress") == 0) {
    return wipSongConfigDict[songName];
  } else {
    return songConfigDict[songName];
  }
}

function redrawCurrentPartsInSong(songName) {
  currentSongList = document.getElementById("song-current-part-list");
  removeAllChildNodes(currentSongList);
  redrawSongsContent();
  Object.keys(getJsonForSongDotYaml(songName).parts).forEach(part => {
    currentSongList.appendChild(createRemovableListItem(part));
  });
}

function removeAllChildNodes(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}

function removeAllTabContentListChildNodes(parent) {
  addItemChild = null;
  while (parent.firstChild) {
    if (parent.firstChild.className == "add-item") {
      addItemChild = parent.firstChild;
    }
    parent.removeChild(parent.firstChild);
  }
  if (addItemChild) {
    parent.appendChild(addItemChild);
  }
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
    return JSON.stringify(getJsonForSetDotYaml(listObj.id), undefined, 2);
  }
  else if (listObj.name.localeCompare('song') == 0) {
    return JSON.stringify(getJsonForSongDotYaml(listObj.id), undefined, 2);
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

function addSelectedSongToSet(addSongBtn) {
  selectedSong = document.getElementById('set-song-edit-select').value;
  setlistName = addSongBtn.parentNode.value;
  songsInSet = getJsonForSetDotYaml(setlistName).songs;
  if (!songsInSet.includes(selectedSong)) {
    console.debug(`Add ${selectedSong} to set, \'${setlistName}\'.`);
    if (setlistName in setConfigDict) {
      wipSetConfigDict[setlistName] = getJsonForSetDotYaml(setlistName);
      wipSetConfigDict[setlistName].songs.push(selectedSong);
      delete setConfigDict[setlistName];
    }
    redrawCurrentSongsInSet(setlistName);
  } else {
    console.warn(`Not added! Song, \'${selectedSong}\', already in set, \'${setlistName}\'.`)
  }
}

function addSelectedPartToSong(addPartBtn) {
  selectedPart = document.getElementById('song-part-edit-select').value;
  songName = addPartBtn.parentNode.value;
  partsInSong = getJsonForSongDotYaml(songName).parts;
  if (!Object.keys(partsInSong).includes(selectedPart)) {
    console.debug(`Add ${selectedPart} to song, \'${songName}\'.`);
    if (songName in songConfigDict) {
      wipSongConfigDict[songName] = getJsonForSongDotYaml(songName);
      delete songConfigDict[songName];
    }
    initNewPart(songName, selectedPart);
  } else {
    console.warn(`Not added! Part, \'${selectedPart}\', already in song, \'${songName}\'.`)
  }
}

function initNewPart(songName, newPartName) {
  getJsonTemplate("part").then(function (results) {
    wipSongConfigDict[songName].parts[newPartName] = results.json;
    redrawCurrentPartsInSong(songName);
    wipSongConfigDict[songName].parts[newPartName].position = getListItemPosition(newPartName);
  });;
}

function getListItemPosition(partName) {
  partListItemObj = document.getElementById(partName).parentNode;
  return parseInt(Array.prototype.indexOf.call(partListItemObj.parentNode.children, partListItemObj), 10);
}


function validateAndWriteSet(writeSetBtn) {
  setlistName = writeSetBtn.parentNode.value;
  if (document.getElementById(setlistName).className.localeCompare('work-in-progress') == 0) {
    setJson = wipSetConfigDict[setlistName];
    if (validateSetJson(setJson)) {
      writeSetToController(setJson);
      moveSetJsonOutOfWip(setlistName);
      redrawSetlistsContent();
      hideEditContent('set', true);
      // TODO: display a success message somehow
    }
  } else {
    console.warn(`There have been no changes to ${setlistName} so this file will not be written to the controller.`)
  }
}

function moveSetJsonOutOfWip() {
  console.debug(`Moving set, \'${setlistName}\', out of WIP and into standard set dictinoary.`)
  setConfigDict[setlistName] = wipSetConfigDict[setlistName];
  delete wipSetConfigDict[setlistName];
}

function validateSetJson(setJson) {
  // TODO: add validation if this that and the other {}
  return true
}

function writeSetToController(setJson) {
  return writeFileToController("set", setJson).done(function (results, status) {
    console.log(`Post function returned ${results}`);
    return true;
  });
}

function writeFileToController(type, json) {
  return $.post({
    url: `${config_api_url}/${type}/${json.name}`,
    data: JSON.stringify(json),
    contentType: 'application/json; charset=utf-8'
  }).done(function(data, status) {
    console.log("Data: " + data + "\nStatus: " + status);
    console.debug(`Succcess: ${status}`);
    return true;
  })
  .fail(function(data, status) {
    console.error(`Error: ${status}`);
    return false;
  });
}

function deleteSongListItem(deleteBtn) {
  // TODO: delete anywhere else in the current obj's where this song exists
  // NOTE: dont forget about closing the edit windows if the song being edited
}

function deleteSetListItem(filenameToDelete) {
  if (filenameToDelete.localeCompare(document.getElementById("set-edit-content").value) == 0) {
    clearEditSetContent();
  }
  sets = sets.filter(e => e !== filenameToDelete);
  delete getJsonForSetDotYaml(filenameToDelete);
  redrawSetlistsContent();
}

function deleteListItem(deleteBtn) {
  console.debug(`Delete button with id, \'${deleteBtn.id}\' was pressed.`);
  setNameToDelete = deleteBtn.id.replace("delete-", "");
  filenameToDelete = `${setNameToDelete}.yaml`;
  deleteFileFromController(deleteBtn.parentNode.name, setNameToDelete);
  if (deleteBtn.parentNode.name.localeCompare('set') == 0) {
    deleteSetListItem(filenameToDelete);
  } else if (deleteBtn.parentNode.name.localeCompare('song') == 0) {
    deleteSongListItem(filenameToDelete);
  }
  hideEditContent(deleteBtn.parentNode.name, true);
}

function clearEditSetContent() {
  removeAllChildNodes(document.getElementById("set-current-song-list"));
}

function deleteFileFromController(fileType, filename) {
  console.debug(`Deleting ${fileType} named, \'${filename}\'.`);
  return deleteFilePostMethod(fileType, filename).done(function(results, status) {
    console.log(`Post function returned ${results}`)
    return true;
  });
}

function deleteFilePostMethod(fileType, fileName) {
  return $.post(`${config_api_url}/${fileType}/delete/${fileName}`)
  .done(function(data, status) {
    console.log("Data: " + data + "\nStatus: " + status);
    console.debug(`Succcess: ${status}`);
    return true;
  })
  .fail(function(data, status) {
    console.error(`Error: ${status}`);
    return false;
  });
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
    wipSetConfigDict[itemFileName] = itemJson;
  } else if (itemType.localeCompare('song') == 0) {
    songs.push(itemFileName);
    wipSongConfigDict[itemFileName] = itemJson;
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

function changeSetNameInGlobal(itemOldName, itemNewName) {
  itemJson = getJsonForSetDotYaml(itemOldName);
  itemJson.name = itemNewName;
  sets = sets.filter(e => e !== itemOldName);
  newFileName = `${itemNewName}.yaml`;
  sets.push(newFileName)
  wipSetConfigDict[newFileName] = itemJson;
  delete getJsonForSetDotYaml(itemOldName);
  redrawSetlistsContent();
  // evaluateSetlistsContent(itemOldName, itemNewName)
}

function getNameFromUser(itemType) {
  return prompt(`Please enter the ${itemType} name:`, `My new ${itemType}`);
}

function replaceOldSetNameWithNewSetName() {
  var editSetNameTextField = document.getElementById("set-name-input");
  var oldSetName = editSetNameTextField.parentNode.value;
  if (oldSetName.localeCompare(`${editSetNameTextField.value}.yaml`) != 0) {
    if (getJsonForSetDotYaml(oldSetName).songs.length > 0) {
      console.debug(`Changing old set name, \'${oldSetName}\', to new set name, \'${editSetNameTextField.value}.yaml\'.`)
      changeSetNameInGlobal(oldSetName, editSetNameTextField.value);
      editSetNameTextField.parentNode.value = `${editSetNameTextField.value}.yaml`;
    } else {
      alertMsg = `Set name, \'${oldSetName}\' has no songs yet! Please add songs and then change the name.`;
      console.error(alertMsg)
      alert(alertMsg);
    }
  } else {
    console.debug(`Not changing set name, \'${oldSetName}\', because that is already the set name.`)
  }
}

function replaceOldSongNameWithNewSongName() {
  var editSongNameTextField = document.getElementById("song-name-input");
  var oldSongName = editSongNameTextField.parentNode.value;
  if (oldSongName.localeCompare(`${editSongNameTextField.value}.yaml`) != 0) {
    if (Object.keys(getJsonForSongDotYaml(oldSongName).parts).length > 0) {
      console.debug(`Changing old song name, \'${oldSongName}\', to new song name, \'${editSongNameTextField.value}.yaml\'.`)
      changeSongNameInGlobal(oldSongName, editSongNameTextField.value);
      editSongNameTextField.parentNode.value = `${editSongNameTextField.value}.yaml`;
    } else {
      alertMsg = `Song name, \'${oldSongName}\' has no parts yet! Please add parts and then change the name.`;
      console.error(alertMsg)
      alert(alertMsg);
    }
  } else {
    console.debug(`Not changing song name, \'${oldSongName}\', because that is already the song name.`)
  }
}

function initializePedalsLists() {
  // get midi controller's pedals
  getPedals().then(function (returndata) {
    pedals = returndata.pedals;
    getPedalsDict();
  });
}

function initializeSetsLists() {
  // get midi controller's sets
  getSets().then(function (returndata) {
    sets = returndata.sets;
    getSetsDict();
    loadSetlistsContent();
  });
}

function initializeSongsLists() {
  // get midi controller's songs
  getSongs().then(function (returndata) {
    songs = returndata.songs;
    getSongsDict();
    loadSongsContent();
  });
}

initializeSetsLists();
initializeSongsLists();
initializePedalsLists();

document.getElementById("controller-display").value = `Hello from: ${hostProtocol}//${midiController}:` + 
  `8000!!\n` + "Use \'Song Up\', \'Song Dn\', \'Part Up\', and \'Part Dn\' to navigate to the desired part, " +
  "and then use \'Select\' button to activate it.\nD-pad buttons: down=into menu, up=out of menu, left and " + 
  "right=navigate menu";

var editSetNameField = document.getElementById("set-name-input");
editSetNameField.addEventListener("keyup", function(event) {
  if (event.keyCode === 13) {
    console.debug(`Enter event heard on \'${editSetNameField.id}\' field.`)
    event.preventDefault();
    replaceOldSetNameWithNewSetName();
  }
});
