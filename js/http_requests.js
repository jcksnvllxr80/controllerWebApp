const url='localhost:8083'

// get pedals
getResponse('${url}/pedals');

// get sets
getResponse('${url}/sets');

// get parts
getResponse('${url}/parts');

function getResponse(requestUrl) {
  $.getJSON(requestUrl, function (result) {
    console.log(result);
  });
}
