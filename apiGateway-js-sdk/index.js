var apigClient = apigClientFactory.newClient();
window.SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition

function searchByVoice(){
    var query = document.getElementById("query");
    const recognition = new window.SpeechRecognition();
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
    
    apigClient.searchGet(queryString, {}, {})
        .then(function(result) {
            image_paths = result["data"]["body"]["imagePaths"];
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

	if (filePath == ""){
		alert("No file chosen");
		return true
	}
	else 
		{
			var typeFile = filePath.split('.')[1]
			if (typeFile != 'png' || typeFile != 'jpg' ||typeFile != 'jpeg'){
				alert('Invalid file type.')
				return true
			}
		}
	return false
}
function addPhoto() {
    var filePath = (document.getElementById('photofilepath').value).split("\\");
    var fileName = filePath[filePath.length - 1];
    
    var customTags = document.getElementById('custom_labels').innerText

    var reader = new FileReader();
    var file = document.getElementById('photofilepath').files[0];
	
	// Will reset the search bar
	document.getElementById('photofilepath').value = "";

	if (!raiseAlert(filePath)){
		var params = {};
        var additionalParams = {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': file.type
            }
        };
        
        reader.onload = function (event) {
            body = btoa(event.target.result);
            console.log('Reader body : ', body);
            return apigClient.folderItemPut(params, additionalParams)
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