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
                var apigClient = apigClientFactory.newClient({
                  //apiKey: "v3dpBwhKLy8ULTm5Qix3uadAo6FoTvl65vzJ4ehx" for original
                  apiKey: "WF2wXMF81C5TWjXvu2KuB3aPj3VcnBOK5EQtGPXS"//For cloud API
                });
                var fileType = file.type// + ";base64"
                var body = data;
                var user_custom_labels = (document.getElementById('custom_labels').value).replace(/\s/g, '').toLowerCase();
                var filename_updated = file.name.replace(/\s/g, '')
                var bucketName = "b2-hw2-cloud" // "b2-hw2-my2727-ma4338" for original
                var params = {"key": filename_updated, "bucket": bucketName, "Content-Type": file.type, "x-amz-meta-customLabels": user_custom_labels, "x-amz-acl": "public-read", "Accept":"*"};
                var addParams = {headers: {
                            'Access-Control-Allow-Origin': '*',
                            'Access-Control-Allow-Methods' : 'OPTIONS,PUT',
                            'Access-Control-Allow-Headers' : '*',
                            "Content-Type": file.type,
                            //'X-Api-Key' : 'v3dpBwhKLy8ULTm5Qix3uadAo6FoTvl65vzJ4ehx'    original API
                            'X-Api-Key' : 'WF2wXMF81C5TWjXvu2KuB3aPj3VcnBOK5EQtGPXS'           
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
