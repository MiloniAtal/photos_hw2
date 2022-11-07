var apigClient = apigClientFactory.newClient({});

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const status = document.getElementById("status")
startRecognition = () => {
  if (SpeechRecognition !== undefined) {
    let recognition = new SpeechRecognition();

    recognition.onstart = () => {
      status.innerHTML = 'Listening';
    };

    recognition.onspeechend = () => {
      status.innerHTML = 'Stopped';
      recognition.stop();
    };

    recognition.onresult = (result) => {
      console.log(result.results[0][0].transcript)
      var query = document.getElementById("query");
      query.value = result.results[0][0].transcript
    };
    recognition.start();
  } else {
    status.innerHTML = "Voice is not supported";
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
            while (n < image_paths.length) {
                images_list = image_paths[n].split('/');
                imageName = images_list[images_list.length - 1];
                photos.innerHTML += '<figure><img src="' + image_paths[n] + '" style="width:25%"><figcaption>' + imageName + '</figcaption></figure>';
                n++;
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

function addPhoto() {
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