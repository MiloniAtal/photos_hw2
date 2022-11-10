var apigClient = apigClientFactory.newClient({});

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const status = document.getElementById("status")
startRecognition = () => {
  if (SpeechRecognition !== undefined) {
    let recognition = new SpeechRecognition();

    recognition.onstart = () => {
      document.getElementById("status").value = 'Listening';
    };

    recognition.onspeechend = () => {
      document.getElementById("status").value = 'Stopped';
      recognition.stop();
    };

    recognition.onresult = (result) => {
      console.log(result.results[0][0].transcript)
      var query = document.getElementById("query");
      query.value = result.results[0][0].transcript
    };
    recognition.start();
  } else {
    document.getElementById("status").value = "Voice is not supported";
  }
};


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

    var filePath = (document.getElementById('photofilepath').value).split("\\");
    var fileName = filePath[filePath.length - 1]

    if (!raiseAlert(fileName))
    {

        file.constructor = () => file
        const fileReader = new FileReader();
        var encodedImage = getBase64(file).then(
            data => {
                //var my_api_key = "jNcTqxYl0X8p0MaOUpzfo3pAOOA339eL6R4fCc37" //Original
                var my_api_key = "XbofK4qRQr66IR94lzOAm5QMCFN4cgTC63ypXvV4" //Cloud
                
                var apigClient = apigClientFactory.newClient({
                  apiKey: my_api_key
                });
                var fileType = file.type// + ";base64"
                var body = data;
                var user_custom_labels = (document.getElementById('custom_labels').value).replace(/\s/g, '').toLowerCase();
                var filename_updated = file.name.replace(/\s/g, '')
                var bucketName = "hw2-b2-cloud" //Cloud
                //var bucketName = "b2-hw2-my2727-ma4338" //Original
                var params = {"key": filename_updated, "bucket": bucketName, "Content-Type": file.type, "x-amz-meta-customLabels": user_custom_labels, "x-amz-acl": "public-read", "Accept":"*", "x-api-key": my_api_key};
                var addParams = {headers: {
                            'Access-Control-Allow-Origin': '*',
                            'Access-Control-Allow-Methods' : 'OPTIONS,PUT',
                            'Access-Control-Allow-Headers' : '*',
                            "Content-Type": file.type,
                            'x-api-key' : my_api_key
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
    else
    {
        document.getElementById('custom_labels').value = "";
        document.getElementById('photofilepath').value = "";
    }
}
