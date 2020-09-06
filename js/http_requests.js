const url='http://midi-controller:8081'
var midi_pedal_config_dict = {};

function getResponse(requestUrl) {
  $.getJSON(requestUrl, function(result) {
    console.log(result);
    return result;
  });
}

// get midi controller's sets
var sets = getResponse(`${url}/sets`);
// get midi controller's songs
var songs = getResponse(`${url}/songs`);
// get midi controller's pedals
var pedals = getResponse(`${url}/pedals`);

pedals.forEach(midi_pedal => {
  // get pedal's configuration and store into a dictinary
  midi_pedal_config_dict[midi_pedal] = getResponse(`${url}/pedal/${midi_pedal}`);
});

console.log(midi_pedal_config_dict.getJSON)