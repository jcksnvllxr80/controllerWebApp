const url='http://192.168.1.100:8081'

function getResponse(requestUrl) {
  $.getJSON(requestUrl, function(result) {
    console.log(result);
  });
}

// get pedals
getResponse(`${url}/pedals`);

// get sets
getResponse(`${url}/sets`);

// get parts
getResponse(`${url}/parts`);

