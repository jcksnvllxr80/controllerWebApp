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
var defaultParts = ['Custom', 'Bridge', 'Chorus', 'Coda', 'Interlude', 'Intro', 'Outro', 'Pre-Chorus', 'Refrain', 'Turn-Around', 'Verse'];
var possibleTempos = Array(4001).fill().map((_, i) => i/2).filter(i => i >= 40);
var DEFAULT_TEMPO = 110;

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

function reloadPartsContent() {
  clickFunctionStr = "remPartFromSongBtnAction";
  Object.keys(getJsonForSongDotYaml(`${document.getElementById("song-name-input").value}.yaml`).parts).forEach(part => {
    currentPartList.appendChild(createEditableRemovableListItem(part, clickFunctionStr, "part"));
  });
}

function reloadPedalsContent() {
  clickFunctionStr = "remPedalFromPartBtnAction";
  songBeingEditedJson = getJsonForSongDotYaml(`${document.getElementById("song-name-input").value}.yaml`);
  currentPart = songBeingEditedJson.parts[document.getElementById("edit-part-name-input").value];
  Object.keys(currentPart.pedals).forEach(pedal => {
    currentPedalList.appendChild(createEditableRemovableListItem(pedal, clickFunctionStr, "pedal"));
    document.getElementById(`${pedal.replace('.yaml','')}-engaged-checkbox`).checked = currentPart.pedals[pedal].engaged;
  });
}

function SetEngaged(engagedCheckboxClicked) {
  songName = `${document.getElementById("song-name-input").value}.yaml`;
  songBeingEditedJson = getJsonForSongDotYaml(songName);
  checked = engagedCheckboxClicked.currentTarget.checked;
  pedalName = engagedCheckboxClicked.currentTarget.name.replace('-engaged-checkbox', '');
  console.debug(`${pedalName} engaged checkbox set to ${checked}.`);
  currentPart = songBeingEditedJson.parts[document.getElementById("edit-part-name-input").value];
  currentPart.pedals[pedalName].engaged = checked;
  if (songName in songConfigDict)
  {
    moveSongToWipConfig(songName);
    redrawCurrentPartsInSong(songName)
  }
}

function redrawSetlistsContent() {
  removeAllTabContentListChildNodes(document.getElementById("set-list"));
  reloadSetlistsContent();
}

function redrawSongsContent() {
  removeAllTabContentListChildNodes(document.getElementById("song-list"));
  reloadSongsContent();
}

function redrawPartsContent() {
  removeAllTabContentListChildNodes(document.getElementById("song-current-part-list"));
  reloadPartsContent();
}

function redrawPedalContent() {
  removeAllTabContentListChildNodes(document.getElementById("part-current-pedal-list"));
  reloadPedalsContent();
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

function createRemovableListItem(id, clickFunctionStr) {
  var listItem = document.createElement("li");
  listItem.setAttribute('class', 'edit-config-list-item');
  listItem.appendChild(createRemovableLinkA(id));
  listItem.appendChild(createRemoveLinkA(id, clickFunctionStr));
  return listItem;
}

function createEditableRemovableListItem(id, clickFunctionStr, type) {
  listItem = createRemovableListItem(id, clickFunctionStr);
  listItem.appendChild(createEditLinkA(id, type));
  if (type.localeCompare('pedal') == 0) {
    engagedCheckbox = createEngagedCheckbox(id)
    engagedCheckbox.addEventListener("click", SetEngaged, false);
    listItem.appendChild(engagedCheckbox);
  }
  return listItem;
}

function createRemovableLinkA(id) {
  var listLink = document.createElement("a");
  listLink.setAttribute('draggable','true');
  listLink.setAttribute('id', id);
  listLink.textContent = id.replace('.yaml', '');
  return listLink;
}

function createEditableLinkA(id) {
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
  if (itemType.localeCompare("part") == 0) {
    editLink.appendChild(createEditPartIconImg(id));
  } else {
    editLink.appendChild(createEditIconImg(id));
  }
  return editLink;
}

function createTrashLinkA(id, itemType) {
  var editLink = document.createElement("a");
  editLink.setAttribute('class', 'delete-link');
  editLink.setAttribute('name', itemType);
  editLink.appendChild(createTrashIconImg(id));
  return editLink;
}

function createRemoveLinkA(id, clickFunctionStr) {
  var editLink = document.createElement("a");
  editLink.setAttribute('class', 'remove-link');
  editLink.appendChild(createRemoveIconImg(id, clickFunctionStr));
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

function createTempoOption(content) {
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

function createEditPartIconImg(id) {
  var editItemImg = document.createElement("img");
  editItemImg.setAttribute('onClick', 'editListItem(this)');
  editItemImg.setAttribute('id', `edit-${id}`);
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

function createRemoveIconImg(id, clickFunctionStr) {
  var editItemImg = document.createElement("img");
  editItemImg.setAttribute('onClick', `${clickFunctionStr}(this)`);
  editItemImg.setAttribute('id', `remove-${id.replace('.yaml', '')}`);
  editItemImg.setAttribute('src', 'assets/minus.png');
  editItemImg.setAttribute('class', 'remove');
  return editItemImg;
}

function createEngagedCheckbox(pedalFileName) {
  pedalName = pedalFileName.replace('.yaml', '')
  var checkbox = document.createElement('input');
  checkbox.setAttribute('type','checkbox');
  checkbox.setAttribute('name', pedalName.concat('-engaged-checkbox'));
  checkbox.checked = false;
  checkbox.setAttribute('id', pedalName.concat('-engaged-checkbox'));
  checkbox.setAttribute('class', 'engaged');
  return checkbox
}

function editListItem(btnObj) {
  editType = btnObj.parentNode.name;
  editObj = btnObj.id;
  objFileName = `${editObj}.yaml`;
  if (editType.localeCompare('set') == 0) {
    modifySet(objFileName);
  } else if (editType.localeCompare('song') == 0) {
    modifySong(objFileName);
  } else if (editType.localeCompare('part') == 0) {
    modifyPart(editObj);
  } else if (editType.localeCompare('pedal') == 0) {
    modifyPedal(editObj);
  } else if (editType.localeCompare('setting') == 0) {
    modifySetting(editObj);
  } else {
    handleUnhandledType(editType);
  }
}

function remSongFromSetBtnAction(remBtnObj) {
  songNameToRemove = remBtnObj.id.replace("remove-", "");
  setToRemoveSongFrom = document.getElementById("set-edit-content").value;
  removeSongFromSet(setToRemoveSongFrom, songNameToRemove);
}

function remPartFromSongBtnAction(remBtnObj) {
  partNameToRemove = remBtnObj.id.replace("remove-", "");
  songToRemovePartFrom = document.getElementById("song-edit-content").value;
  removePartFromSong(songToRemovePartFrom, partNameToRemove);
}

function remPedalFromPartBtnAction(remBtnObj) {
  pedalNameToRemove = remBtnObj.id.replace("remove-", "");
  partToRemovePedalFrom = document.getElementById("part-edit-content").value;
  removePedalFromPart(partToRemovePedalFrom, pedalNameToRemove);
}

function remSettingFromPedalBtnAction(remBtnObj) {
  settingNameToRemove = remBtnObj.id.replace("remove-", "");
  pedalToRemoveSettingFrom = document.getElementById("pedal-edit-content").value;
  removeSettingFromPedal(pedalToRemoveSettingFrom, settingNameToRemove);
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

function removePartFromSong(songName, partToRemove) {
  console.debug(`Removing part, \'${partToRemove}\', from song, \'${songName}\'.`);
  if (document.getElementById(songName).className.localeCompare("work-in-progress") == 0) {
    delete wipSongConfigDict[songName].parts[partToRemove];
  } else {
    wipSongConfigDict[songName] = songConfigDict[songName];
    delete songConfigDict[songName];
    delete wipSongConfigDict[songName].parts[partToRemove];
    redrawSongsContent();
  }
  redrawCurrentPartsInSong(songName);
}

function removePedalFromPart(partName, pedalToRemove) {
  songName = document.getElementById("song-name-input").value;
  console.debug(`Removing pedal, \'${pedalToRemove}\', from part, \'${partName}\', of song, \'${songName}\'.`);
  partBeingEditedJson = getJsonForSongDotYaml(`${songName}.yaml`).parts[partName];
  if (pedalToRemove == document.getElementById("display-pedal-name").value)
  { // hide the pedal settings editor content if the pedal being deleted is displayed there
    hideEditContent('pedal', true);
  }
  delete partBeingEditedJson.pedals[`${pedalToRemove}.yaml`];
  redrawCurrentPedalsInPart(partBeingEditedJson);
}

function removeSettingFromPedal(pedalName, settingToRemove) {
  console.debug(`Removing setting, \'${settingToRemove}\', from pedal, \'${pedalName}\'.`);
  // if (document.getElementById(songName).className.localeCompare("work-in-progress") == 0) {
  //   delete wipSongConfigDict[songName].parts[partToRemove];
  // } else {
  //   wipSongConfigDict[songName] = songConfigDict[songName];
  //   delete songConfigDict[songName];
  //   delete wipSongConfigDict[songName].parts[partToRemove];
  //   redrawSongsContent();
  // }
  // redrawCurrentPartsInSong(songName);
}

function modifySet(setFileName) {
  console.debug(`Editing set, \'${setFileName}\'.`);
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
  clickFunctionStr = "remSongFromSetBtnAction";
  currentSongList = document.getElementById("set-current-song-list");
  removeAllChildNodes(currentSongList);
  redrawSetlistsContent();
  getJsonForSetDotYaml(setName).songs.forEach(song => {
    currentSongList.appendChild(createRemovableListItem(song, clickFunctionStr));
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

function modifySong(songFileName) {
  hideEditContent('part', true);
  hideEditContent('pedal', true);
  console.debug(`Editing song, \'${songFileName}\'.`);
  hideEditContent('song', false);
  document.getElementById(`song-edit-content`).value = songFileName;
  populateSongEditContent(songFileName);
}

function modifyPart(editObj) {
  // hide the pedal settings editor content everytime a configure part button pressed
  hideEditContent('pedal', true);
  songFileName = document.getElementById(editObj).parentNode.parentNode.parentNode.parentNode.value;
  partName = editObj.replace("edit-", "");
  console.debug(`Editing part, \'${partName}\' of \'${songFileName}\'.`);
  hideEditContent('part', false);
  document.getElementById(`part-edit-content`).value = partName;
  populatePartEditContent(partName, songFileName);
}

function modifyPedal(editObj) {
  songFileName = document.getElementById("song-name-edit-label").parentNode.value
  partFileName = document.getElementById(editObj).parentNode.parentNode.parentNode.parentNode.value;
  pedalName = editObj.replace("edit-", "");
  console.debug(`Editing pedal, \'${pedalName}\' of the \'${partFileName}\' for \'${songFileName}\'.`);
  hideEditContent('pedal', false);
  document.getElementById(`pedal-edit-content`).value = pedalName;
  populatePedalEditContent(pedalName, songFileName, partFileName);
}

function modifySetting(editObj) {
  songFileName = document.getElementById("song-name-edit-label").parentNode.value
  partName = document.getElementById("part-name-edit-label").parentNode.value
  pedalName = document.getElementById("display-pedal-name").value
  settingGroupName = editObj.replace("edit-", "");
  console.debug(`Editing setting Group, \'${settingGroupName}\' in pedal, \'${pedalName}\' of the part, \'${partName}\' for song \'${songFileName}\'.`);
  hideEditContent('setting', false);
  document.getElementById(`setting-edit-content`).value = settingGroupName;
  populateSettingEditContent(pedalName, songFileName, partName, settingGroupName);
}

function populateSongEditContent(songFileName) {
  songBeingEditedJson = getJsonForSongDotYaml(songFileName);
  document.getElementById("song-name-input").value = songBeingEditedJson.name;
  drawAvailableTempos();
  setTempoSelectValue(songBeingEditedJson);
  drawAvailableParts();
  redrawCurrentPartsInSong(songFileName);
}

function populatePartEditContent(partName, songFileName) {
  partBeingEditedJson = getJsonForSongDotYaml(songFileName).parts[partName];
  document.getElementById("edit-part-name-input").value = partName;
  drawAvailablePedals();
  redrawCurrentPedalsInPart(partBeingEditedJson);
}

function populatePedalEditContent(pedalName, songFileName, partFileName) {
  pedalBeingEditedJson = getJsonForSongDotYaml(songFileName).parts[partFileName].pedals[pedalName.concat('.yaml')];
  document.getElementById("display-pedal-name").value = pedalName;
  // drawAvailablePedalSettings(pedalBeingEditedJson);
  redrawCurrentSettingsInPedal(pedalBeingEditedJson);
}

function populateSettingEditContent(pedalName, songFileName, partName, settingGroupName) {
  settingsJson = getJsonForSongDotYaml(songFileName).parts[partName].pedals[pedalName.concat('.yaml')];
  // document.getElementById("display-settings-name").value = settingGroupName;
  if (settingGroupName == "preset") {
    drawAvailablePresetsInPedal(pedalName.concat('.yaml'));
    redrawCurrentPresetInPedal(settingsJson);
  } else if (settingGroupName == "params") {
    drawAvailableParamsInPedal(pedalName.concat('.yaml'));
    redrawCurrentParamInPedal(settingsJson);
  } else {
    handleUnhandledPedalSettingsType(settingGroupName);
  }
}

function drawAvailableTempos() {
  selectTempoList = document.getElementById("song-tempo-select");
  removeAllChildNodes(selectTempoList);
  possibleTempos.forEach(tempo => {
    selectTempoList.appendChild(createTempoOption(tempo));
  });
}

function setTempoSelectValue(songEditedJson) {
  if (songEditedJson.tempo == null) {
    selectTempoList.value = DEFAULT_TEMPO;
  } else {
    selectTempoList.value = songEditedJson.tempo;
  }
}

function drawAvailableParts() {
  selectPartList = document.getElementById("song-part-edit-select");
  document.getElementById("part-name-input").value = "Custom part name...";
  removeAllChildNodes(selectPartList);
  defaultParts.forEach(part => {
    selectPartList.appendChild(createOption(part));
  });
  selectPartList.value = "Bridge";
}

function drawAvailablePedals() {
  selectPedalList = document.getElementById("part-pedal-edit-select");
  removeAllChildNodes(selectPedalList);
  pedals.forEach(pedal => {
    selectPedalList.appendChild(createOption(pedal));
  });
  selectPedalList.value = pedals[0].replace('.yaml', '');
}

function drawAvailablePedalSettings(pedalBeingEditedJson) {
  selectPedalSettingsList = document.getElementById("pedal-settings-edit-select");
  removeAllChildNodes(selectPedalSettingsList);
  Object.keys(pedalBeingEditedJson).forEach(setting => {
    selectPedalSettingsList.appendChild(createOption(setting));
  });
  selectPedalSettingsList.value = selectPedalSettingsList.firstChild.value;
}

function drawAvailablePresetsInPedal(pedalFileName) {
  pedalSetPresetDict = pedalConfigDict[pedalFileName]["Set Preset"];
  selectPedalPreset = document.getElementById("pedal-preset-select");
  removeAllChildNodes(selectPedalPreset);  
  getPresetList(pedalSetPresetDict).forEach(setting => {
    selectPedalPreset.appendChild(createOption(setting.toString()));
  });
  selectPedalPreset.value = selectPedalPreset.firstChild.value;
}

function redrawCurrentPresetInPedal(settingsJson) {
  // selectPedalSettingsList = document.getElementById("pedal-settings-edit-select");
  // removeAllChildNodes(selectPedalSettingsList);
  // Object.keys(pedalBeingEditedJson).forEach(setting => {
  //   selectPedalSettingsList.appendChild(createOption(setting));
  // });
  // selectPedalSettingsList.value = selectPedalSettingsList.firstChild.value;
}

function drawAvailableParamsInPedal(pedalFileName) {
  pedalParamDict = pedalConfigDict[pedalFileName]["Parameters"];
  selectPedalParam = document.getElementById("pedal-param-select");
  removeAllChildNodes(selectPedalParam);  
  Object.keys(pedalParamDict).forEach(param => {
    selectPedalParam.appendChild(createOption(param.toString()));
  });
  selectPedalParam.value = selectPedalParam.firstChild.value;
}

function redrawCurrentParamInPedal(settingsJson) {
  // selectPedalSettingsList = document.getElementById("pedal-settings-edit-select");
  // removeAllChildNodes(selectPedalSettingsList);
  // Object.keys(pedalBeingEditedJson).forEach(setting => {
  //   selectPedalSettingsList.appendChild(createOption(setting));
  // });
  // selectPedalSettingsList.value = selectPedalSettingsList.firstChild.value;
}

function getPresetList(pedalSetPresetDict) {
  range = Array(0);
  if (Object.keys(pedalSetPresetDict).includes('min')) {
    range = getPresetMinAndMax(pedalSetPresetDict);
  } else {
    deeperDict = null;
    if (Object.keys(pedalSetPresetDict).includes('control change')) {
      deeperDict = pedalSetPresetDict['control change'];
    } else if (Object.keys(pedalSetPresetDict).includes('program change')) {
      deeperDict = pedalSetPresetDict['program change'];
    }
    range = getPresetMinAndMax(deeperDict);
    if (!range.length) {
      range = getPresetOptions(deeperDict);
    }
    if (!range.length) {
      console.error(`Cant find preset values for pedal, \'${pedalFileName}\'.`);
    }
  }
  console.debug(`range is ${range}`);
  return range;
}

function getPresetMinAndMax(settingsDict) {
  if (Object.keys(settingsDict).includes('min')) {
    min = settingsDict['min'];
    max = settingsDict['max'];
    return Array.from(new Array(max-min+1), (x, i) => i + min);
  } else {
    return Array(0);
  }
}

function getPresetOptions(settingsDict) {
  if (Object.keys(settingsDict).includes('options')) {
    return settingsDict['options']
  }
}

function getJsonForSongDotYaml(songName) {
  if (document.getElementById(songName).className.localeCompare("work-in-progress") == 0) {
    return wipSongConfigDict[songName];
  } else {
    return songConfigDict[songName];
  }
}

function redrawCurrentPartsInSong(songName) {
  clickFunctionStr = "remPartFromSongBtnAction";
  currentPartList = document.getElementById("song-current-part-list");
  removeAllChildNodes(currentPartList);
  redrawSongsContent();
  reloadPartsContent();
  reevaluatePartPositionInSong(getJsonForSongDotYaml(songName));
}

function redrawCurrentPedalsInPart(partBeingEditedJson) {
  currentPedalList = document.getElementById("part-current-pedal-list");
  removeAllChildNodes(currentPedalList);
  redrawPartsContent();
  reloadPedalsContent();
}

function redrawCurrentSettingsInPedal(pedalBeingEditedJson) {
  clickFunctionStr = "remSettingFromPedalBtnAction";
  currentPedalSettingsList = document.getElementById("pedal-current-settings-list");
  removeAllChildNodes(currentPedalSettingsList);
  redrawPedalContent();
  reloadSettingsContent(pedalBeingEditedJson);
}

function reloadSettingsContent(pedalBeingEditedJson) {
  Object.keys(pedalBeingEditedJson).filter(setting => setting != "engaged").forEach(setting => {
    currentPedalSettingsList.appendChild(createEditableRemovableListItem(setting, clickFunctionStr, "setting"));
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
  console.debug(`Setting \'hidden\' attribute of \'${type}-edit-window\' and \'${type}-edit-content\' to ${hidden}.`)
  document.getElementById(`${type}-edit-window`).hidden = hidden;
  document.getElementById(`${type}-edit-content`).hidden = hidden;
  resizeCanvas();
}

function handleUnhandledType(unhandledType) {
  errorMessage = `This object type (${unhandledType}) is not handled yet.`;
  console.error(errorMessage);
  return errorMessage;
}

function handleUnhandledPedalSettingsType(unhandledPedalSettingsType) {
  errorMessage = `This pedal settings type (${unhandledPedalSettingsType}) is not handled yet.`;
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
      delete setConfigDict[setlistName];
    }
    wipSetConfigDict[setlistName].songs.push(selectedSong);
    redrawCurrentSongsInSet(setlistName);
  } else {
    console.warn(`Not added! Song, \'${selectedSong}\', already in set, \'${setlistName}\'.`)
  }
}

function addSelectedPartToSong(addPartBtn) {
  selectedPart = document.getElementById('song-part-edit-select').value;
  if (selectedPart.localeCompare("Custom") == 0) {
    selectedPart = document.getElementById("part-name-input").value;
  }
  songName = addPartBtn.parentNode.value;
  partsInSong = getJsonForSongDotYaml(songName).parts;
  if (!Object.keys(partsInSong).includes(selectedPart)) {
    console.debug(`Add ${selectedPart} to song, \'${songName}\'.`);
    if (songName in songConfigDict) {
      moveSongToWipConfig(songName);
    }
    initNewPart(songName, selectedPart);
  } else {
    console.warn(`Not added! Part, \'${selectedPart}\', already in song, \'${songName}\'.`)
  }
}

function moveSongToWipConfig(songName) {
  wipSongConfigDict[songName] = getJsonForSongDotYaml(songName);
  delete songConfigDict[songName];
}

function addSelectedPedalToPart(addPedalBtn) {
  selectedPedal = document.getElementById('part-pedal-edit-select').value;
  songFileName = document.getElementById("song-name-edit-label").parentNode.value;
  partName = document.getElementById("part-name-edit-label").parentNode.value;
  partBeingEditedJson = getJsonForSongDotYaml(songFileName).parts[partName];
  if (!Object.keys(partBeingEditedJson.pedals).includes(selectedPedal.concat('.yaml'))) {
    console.debug(`Add ${selectedPedal} to part, \'${partName}\' of song, \'${songFileName}\'.`);
    initNewPedal(partBeingEditedJson, selectedPedal);
    redrawCurrentPedalsInPart(partBeingEditedJson);
  } else {
    console.warn(`Not added! Pedal, \'${selectedPedal}\', already in part, \'${partName}\'.`)
  }
}

function addSelectedSettingToPedal(addPartBtn) {
  selectedSetting = document.getElementById('pedal-settings-edit-select').value;
  // songName = addPartBtn.parentNode.value;
  // partsInSong = getJsonForSongDotYaml(songName).parts;
  // if (!Object.keys(partsInSong).includes(selectedPart)) {
  //   console.debug(`Add ${selectedPart} to song, \'${songName}\'.`);
  //   if (songName in songConfigDict) {
  //     wipSongConfigDict[songName] = getJsonForSongDotYaml(songName);
  //     delete songConfigDict[songName];
  //   }
  //   initNewPart(songName, selectedPart);
  // } else {
  //   console.warn(`Not added! Part, \'${selectedPart}\', already in song, \'${songName}\'.`)
  // }
}

function changePartNameSelectEventHandler() {
  if (document.getElementById('song-part-edit-select').value.localeCompare("Custom") == 0) {
    document.getElementById('part-name-input').disabled = false;
  } else {
    document.getElementById('part-name-input').disabled = true;
  }
}

function initNewPart(songName, newPartName) {
  getJsonTemplate("part").then(function (results) {
    newPartJson = results.json;
    wipSongConfigDict[songName].parts[newPartName] = newPartJson;
    redrawCurrentPartsInSong(songName);
    newPartJson.position = getListItemPosition(newPartName);
    getPedalTemplates(newPartJson);
  });;
}

function reevaluatePartPositionInSong(songJson){
  parts = songJson.parts;
  Object.keys(parts).forEach(part => {
    parts[part].position = getListItemPosition(part);
  });
}

function getListItemPosition(partName) {
  partListItemObj = document.getElementById(partName).parentNode;
  return parseInt(Array.prototype.indexOf.call(partListItemObj.parentNode.children, partListItemObj), 10) + 1;
}

function getPedalTemplates(partJson) {
  pedals.forEach(pedal => {
    initNewPedal(partJson, pedal);
 });
}

function initNewPedal(partJson, pedalName) {
  getJsonTemplate("pedal").then(function (results) {
    partJson.pedals[pedalName.replace('.yaml','')] =  results.json;
    if (!document.getElementById(`part-edit-window`).hidden)
    {
      redrawCurrentPedalsInPart(partJson);
    }
  });;
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

function validateAndWriteSong(writeSongBtn) {
  songName = writeSongBtn.parentNode.value;
  // if (document.getElementById(setlistName).className.localeCompare('work-in-progress') == 0) {
  //   setJson = wipSetConfigDict[setlistName];
  //   if (validateSetJson(setJson)) {
  //     writeSetToController(setJson);
  //     moveSetJsonOutOfWip(setlistName);
  //     redrawSetlistsContent();
  //     hideEditContent('set', true);
  //     // TODO: display a success message somehow
  //   }
  // } else {
  //   console.warn(`There have been no changes to ${setlistName} so this file will not be written to the controller.`)
  // }
}

function validateAndWritePart(writePartBtn) {
  partName = writePartBtn.parentNode.value;
  // if (document.getElementById(setlistName).className.localeCompare('work-in-progress') == 0) {
  //   setJson = wipSetConfigDict[setlistName];
  //   if (validateSetJson(setJson)) {
  //     writeSetToController(setJson);
  //     moveSetJsonOutOfWip(setlistName);
  //     redrawSetlistsContent();
  //     hideEditContent('set', true);
  //     // TODO: display a success message somehow
  //   }
  // } else {
  //   console.warn(`There have been no changes to ${setlistName} so this file will not be written to the controller.`)
  // }
}

function validateAndWritePedal(writePedalBtn) {
  pedalName = writePedalBtn.parentNode.value;
  // if (document.getElementById(setlistName).className.localeCompare('work-in-progress') == 0) {
  //   setJson = wipSetConfigDict[setlistName];
  //   if (validateSetJson(setJson)) {
  //     writeSetToController(setJson);
  //     moveSetJsonOutOfWip(setlistName);
  //     redrawSetlistsContent();
  //     hideEditContent('set', true);
  //     // TODO: display a success message somehow
  //   }
  // } else {
  //   console.warn(`There have been no changes to ${setlistName} so this file will not be written to the controller.`)
  // }
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

function deleteSongListItem(filenameToDelete) {
  if (filenameToDelete.localeCompare(document.getElementById("song-edit-content").value) == 0) {
    clearEditSongContent();
  }
  songs = songs.filter(e => e !== filenameToDelete);
  delete getJsonForSetDotYaml(filenameToDelete);
  redrawSongsContent();
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
  nameToDelete = deleteBtn.id.replace("delete-", "");
  filenameToDelete = `${nameToDelete}.yaml`;
  deleteFileFromController(deleteBtn.parentNode.name, nameToDelete);
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

function clearEditSongContent() {
  removeAllChildNodes(document.getElementById("song-current-part-list"));
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
  sets.push(newFileName);
  wipSetConfigDict[newFileName] = itemJson;
  delete getJsonForSetDotYaml(itemOldName);
  redrawSetlistsContent();
}

function changeSongNameInGlobal(itemOldName, itemNewName) {
  itemJson = getJsonForSongDotYaml(itemOldName);
  itemJson.name = itemNewName;
  songs = songs.filter(e => e !== itemOldName);
  newFileName = `${itemNewName}.yaml`;
  songs.push(newFileName);
  wipSongConfigDict[newFileName] = itemJson;
  delete getJsonForSongDotYaml(itemOldName);
  redrawSongsContent();
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

function replaceOldPartNameWithNewPartName() {
  // var editSongNameTextField = document.getElementById("song-name-input");
  // var oldSongName = editSongNameTextField.parentNode.value;
  // if (oldSongName.localeCompare(`${editSongNameTextField.value}.yaml`) != 0) {
  //   if (Object.keys(getJsonForSongDotYaml(oldSongName).parts).length > 0) {
  //     console.debug(`Changing old song name, \'${oldSongName}\', to new song name, \'${editSongNameTextField.value}.yaml\'.`)
  //     changeSongNameInGlobal(oldSongName, editSongNameTextField.value);
  //     editSongNameTextField.parentNode.value = `${editSongNameTextField.value}.yaml`;
  //   } else {
  //     alertMsg = `Song name, \'${oldSongName}\' has no parts yet! Please add parts and then change the name.`;
  //     console.error(alertMsg)
  //     alert(alertMsg);
  //   }
  // } else {
  //   console.debug(`Not changing song name, \'${oldSongName}\', because that is already the song name.`)
  // }
}

function setSongTempo() {
  var editSongTempoSelect = document.getElementById("song-tempo-select");
  var songName = editSongTempoSelect.parentNode.value;
  var songJson = getJsonForSongDotYaml(songName);
  var currentSongTempo = songJson.tempo;
  if (currentSongTempo == null || currentSongTempo != editSongTempoSelect.value) {
    console.debug(`Setting song tempo to, \'${editSongTempoSelect.value}\', for song, \'${songName}\'.`);
    songJson.tempo = Number(editSongTempoSelect.value);
  } else {
    console.debug(`Not setting song tempo to, \'${editSongTempoSelect.value}\', because that is already the song tempo.`);
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

resizeCanvas();
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
