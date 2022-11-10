var apigClient = apigClientFactory.newClient({});

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const status = document.getElementById("status")
startRecognition = () => {
  if (SpeechRecognition !== undefined) {
    let recognition = new SpeechRecognition();

    recognition.onstart = () => {
      status.value = 'Listening';
    };

    recognition.onspeechend = () => {
      status.value = 'Stopped';
      recognition.stop();
    };

    recognition.onresult = (result) => {
      console.log(result.results[0][0].transcript)
      var query = document.getElementById("query");
      query.value = result.results[0][0].transcript
    };
    recognition.start();
  } else {
    status.value = "Voice is not supported";
  }
};

function searchByVoice(){
    var query = document.getElementById("query");
    const recognition = new window.webkitSpeechRecognition();
    micButton = document.getElementById("mic_search");  
    
    if (micButton.innerHTML == "mic") {
        recognition.start();
    } else if (micButton.innerHTML == "mic_off"){
        recognition.stop();
    }

    recognition.addEventListener("start", function() {
        micButton.innerHTML = "mic_off";
    });

    recognition.addEventListener("end", function() {
        micButton.innerHTML = "mic";
    });

    recognition.addEventListener("result", resultOfSpeechRecognition);
    function resultOfSpeechRecognition(event) {
        const current = event.resultIndex;
        transcript = event.results[current][0].transcript;
        query.value = transcript;
        console.log("transcript : ", transcript)
    }
}

function searchByText() {
    var query = document.getElementById('query');
    if (query.value) {
        query = query.value.toLowerCase().trim();
        searchPhotos(query);
    } else {    
        alert('No valid input');
    }   
}

function searchPhotos(query) {

    document.getElementById('query').value = query;
    document.getElementById('displayPhotos').innerHTML = "<h4 style=\"text-align:center\">";

    var queryString = {'q' : query };
    console.log(queryString)
    apigClient.searchGet(queryString, {}, {})
        .then(function(result) {
            image_paths = result['data']['imagePaths'];
            //image_paths = JSON.parse(result['data']['body'])
            console.log(image_paths)
            var photos = document.getElementById("displayPhotos");
            photos.innerHTML = "";

            var n=0;
            
            //if (!image_paths.length) 
            if (!image_paths){
               alert('No images found!')
            }
          else{
            while (n < image_paths.length) {
                images_list = image_paths[n].split('/');
                imageName = images_list[images_list.length - 1];
                photos.innerHTML += '<figure><img src="' + image_paths[n] + '" style="width:25%"><figcaption>' + imageName + '</figcaption></figure>';
                n++;
            }
          }

        }).catch(function(result) {
            console.log(result);
        });
}

function raiseAlert(filePath){
    //console.log(filePath)
    if (filePath == ""){
        alert("No file chosen");
        return true
    }
    else 
        {
            var typeFile = filePath.split('.')[1]
            //console.log(typeFile)
            var admissible = ['jpg','png','jpeg']
            if ( !admissible.includes(typeFile) ){
                alert('Invalid file type')
                return true
            }
        }
    return false
}


function getBase64_old(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    // reader.onload = () => resolve(reader.result)
    reader.onload = () => {
      let encoded = reader.result.replace(/^data:(.*;base64,)?/, '');
      if ((encoded.length % 4) > 0) {
        encoded += '='.repeat(4 - (encoded.length % 4));
      }
      resolve(encoded);
    };
    reader.onerror = error => reject(error);
  });
}

function addPhoto12() {
  // var file_data = $("#file_path").prop("files")[0];
  var file = document.getElementById('photofilepath').files[0];
  const reader = new FileReader();

  var file_data;
  // var file = document.querySelector('#file_path > input[type="file"]').files[0];
  var encoded_image = getBase64(file).then(
    data => {
      console.log(data)
      var apigClient = apigClientFactory.newClient({
        apiKey: "v3dpBwhKLy8ULTm5Qix3uadAo6FoTvl65vzJ4ehx",
        defaultContentType: "image/jpeg",
        defaultAcceptType: "image/jpeg"
      });
      var body = file;
      var params = {
        "key": file.name,
        "bucket": "b2-hw2-my2727-ma4338",
        'x-api-key': 'v3dpBwhKLy8ULTm5Qix3uadAo6FoTvl65vzJ4ehx',
        "x-amz-meta-customLabels": document.getElementById('custom_labels').value
      };

      var additionalParams = {
        headers: {
          'Content-Type': "image/jpeg",
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods' : 'GET, OPTIONS, POST, PUT',                
        },
      };

    });

  
  let config = {
       headers: { 'Content-Type': file.type }
   };
   url = 'https://cors-anywhere.herokuapp.com/https://iav31pdv15.execute-api.us-east-1.amazonaws.com/beta/b2-hw2-my2727-ma4338/' + file.name
   axios.put(url, file, config).then(response => {
     console.log(" New "+response.data)
     alert("Image uploaded successfully!");
     console.log("Success");
   });

}


function getBase64(file) {
    return new Promise((resolve, reject) => {
        const fileReader = new FileReader();
        fileReader.readAsDataURL(file);
        fileReader.onload = () => {
            let encodedImage = fileReader.result.toString().replace(/^data:(.*;base64,)?/, '');
            if ((encodedImage.length%4)>0) {
              encodedImage += '='.repeat(4 - (encodedImage.length % 4));
            }
            resolve(encodedImage);
        };
        fileReader.onerror = error => reject(error);
    })
}

function addPhoto()
{
    var file = document.getElementById("photofilepath").files[0];
    file.constructor = () => file
    const fileReader = new FileReader();
    var encodedImage = getBase64(file).then(
        data => {
            var apigClient = apigClientFactory.newClient({
              apiKey: "v3dpBwhKLy8ULTm5Qix3uadAo6FoTvl65vzJ4ehx"
            });
    var fileType = file.type// + ";base64"
    var body = data;
    var user_custom_labels = (document.getElementById('custom_labels').value).replace(/\s/g, '').toLowerCase();
    var filename_updated = file.name.replace(/\s/g, '')
    var params = {"key": filename_updated, "bucket": "b2-hw2-my2727-ma4338", "Content-Type": file.type, "x-amz-meta-customLabels": user_custom_labels, "x-amz-acl": "public-read", "Accept":"*"};
    var addParams = {headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods' : 'OPTIONS,PUT',
                'Access-Control-Allow-Headers' : '*',
                "Content-Type": file.type,
                'X-Api-Key' : 'v3dpBwhKLy8ULTm5Qix3uadAo6FoTvl65vzJ4ehx'                
            }};
    apigClient.addBucketKeyPut(params, file, addParams).then(function(res) {
        document.getElementById('custom_labels').value = "";
        document.getElementById('photofilepath').value = "";
        if(res.status == 200)
        {
            alert("Image uploaded successfully!");
            console.log('Uploaded successfully');
        }
    })
});
}

function addPhoto_betterpostman()
{
    var file = document.getElementById("photofilepath").files[0];
    const fileReader = new FileReader();
    var encodedImage = getBase64(file).then(
        data => {
            var apigClient = apigClientFactory.newClient({
              apiKey: "v3dpBwhKLy8ULTm5Qix3uadAo6FoTvl65vzJ4ehx"
            });
    var fileType = file.type + ";base64"
    var body = data;
    var params = {"key": file.name, "bucket": "b2-hw2-my2727-ma4338", "Content-Type": file.type, "x-amz-meta-customLabels": document.getElementById('custom_labels').value, "x-amz-acl": "public-read", "Accept":"*"};
    var addParams = {};
    apigClient.addBucketKeyPut(params, body, addParams).then(function(res) {
        if(res.status == 200)
        {
         document.getElementById("display-text").innerHTML="Uploaded!";
        }
    })
});
}


function addPhoto11() {
    var filePath = (document.getElementById('photofilepath').value).split("\\");
    //console.log(filePath)
    var fileName = filePath[filePath.length - 1];
    //console.log(fileName)
    var customTags = document.getElementById('custom_labels').value
    console.log(customTags)
    var reader = new FileReader();
    var file = document.getElementById('photofilepath').files[0];
    
    // Will reset the search bar
    document.getElementById('photofilepath').value = "";
    document.getElementById('custom_labels').value = "";


    if (!raiseAlert(fileName)){
        var params = {
            'key': fileName,
            'bucket': 'b2-hw2-my2727-ma4338',
            'Content-Type': file.type,
            'x-amz-meta-customLabels': customTags
        };
        var additionalParams = {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods' : 'GET, OPTIONS, POST, PUT',
                'X-Api-Key' : 'v3dpBwhKLy8ULTm5Qix3uadAo6FoTvl65vzJ4ehx'                
            }
        };
        
        reader.onload = function (event) {
            body = btoa(event.target.result);
            //console.log('Reader body : ', body);
            return apigClient.addBucketKeyPut(params, additionalParams)
            .then(function(result) {
                console.log(result);
            })
            .catch(function(error) {
                console.log(error);
            })
        }
        reader.readAsBinaryString(file);
    }
        
}