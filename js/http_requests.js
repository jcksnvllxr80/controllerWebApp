const url='http://midi-controller:8081'

function getResponse(requestUrl) {
  $.getJSON(requestUrl, function(result) {
    console.log(result);
  });
}

// get sets
getResponse(`${url}/sets`);

// get songs
getResponse(`${url}/songs`);

// get pedals
getResponse(`${url}/pedals`);
