/*
 * Copyright 2010-2016 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * A copy of the License is located at
 *
 *  http://aws.amazon.com/apache2.0
 *
 * or in the "license" file accompanying this file. This file is distributed
 * on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

var apigClientFactory = {};
apigClientFactory.newClient = function (config) {
    var apigClient = { };
    if(config === undefined) {
        config = {
            accessKey: '',
            secretKey: '',
            sessionToken: '',
            region: '',
            apiKey: undefined,
            defaultContentType: 'application/json',
            defaultAcceptType: 'application/json'
        };
    }
    if(config.accessKey === undefined) {
        config.accessKey = '';
    }
    if(config.secretKey === undefined) {
        config.secretKey = '';
    }
    if(config.apiKey === undefined) {
        config.apiKey = '';
    }
    if(config.sessionToken === undefined) {
        config.sessionToken = '';
    }
    if(config.region === undefined) {
        config.region = 'us-east-1';
    }
    //If defaultContentType is not defined then default to application/json
    if(config.defaultContentType === undefined) {
        config.defaultContentType = 'application/json';
    }
    //If defaultAcceptType is not defined then default to application/json
    if(config.defaultAcceptType === undefined) {
        config.defaultAcceptType = 'application/json';
    }

    
    // extract endpoint and path from url
    var invokeUrl = 'https://iav31pdv15.execute-api.us-east-1.amazonaws.com/beta';
    var endpoint = /(^https?:\/\/[^\/]+)/g.exec(invokeUrl)[1];
    var pathComponent = invokeUrl.substring(endpoint.length);

    var sigV4ClientConfig = {
        accessKey: config.accessKey,
        secretKey: config.secretKey,
        sessionToken: config.sessionToken,
        serviceName: 'execute-api',
        region: config.region,
        endpoint: endpoint,
        defaultContentType: config.defaultContentType,
        defaultAcceptType: config.defaultAcceptType
    };

    var authType = 'NONE';
    if (sigV4ClientConfig.accessKey !== undefined && sigV4ClientConfig.accessKey !== '' && sigV4ClientConfig.secretKey !== undefined && sigV4ClientConfig.secretKey !== '') {
        authType = 'AWS_IAM';
    }

    var simpleHttpClientConfig = {
        endpoint: endpoint,
        defaultContentType: config.defaultContentType,
        defaultAcceptType: config.defaultAcceptType
    };

    var apiGatewayClient = apiGateway.core.apiGatewayClientFactory.newClient(simpleHttpClientConfig, sigV4ClientConfig);
    
    
    
    apigClient.addBucketKeyPut = function (params, body, additionalParams) {
        if(additionalParams === undefined) { additionalParams = {}; }
        
        apiGateway.core.utils.assertParametersDefined(params, ['key', 'bucket', 'x-amz-meta-customLabels'], ['body']);
        
        var addBucketKeyPutRequest = {
            verb: 'put'.toUpperCase(),
            path: pathComponent + uritemplate('/add/{bucket}/{key}').expand(apiGateway.core.utils.parseParametersToObject(params, ['key', 'bucket', ])),
            headers: apiGateway.core.utils.parseParametersToObject(params, ['x-amz-meta-customLabels']),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, []),
            body: body
        };
        
        
        return apiGatewayClient.makeRequest(addBucketKeyPutRequest, authType, additionalParams, config.apiKey);
    };
    
    
    apigClient.addBucketKeyOptions = function (params, body, additionalParams) {
        if(additionalParams === undefined) { additionalParams = {}; }
        
        apiGateway.core.utils.assertParametersDefined(params, [], ['body']);
        
        var addBucketKeyOptionsRequest = {
            verb: 'options'.toUpperCase(),
            path: pathComponent + uritemplate('/add/{bucket}/{key}').expand(apiGateway.core.utils.parseParametersToObject(params, [])),
            headers: apiGateway.core.utils.parseParametersToObject(params, []),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, []),
            body: body
        };
        
        
        return apiGatewayClient.makeRequest(addBucketKeyOptionsRequest, authType, additionalParams, config.apiKey);
    };
    
    
    apigClient.searchGet = function (params, body, additionalParams) {
        if(additionalParams === undefined) { additionalParams = {}; }
        
        apiGateway.core.utils.assertParametersDefined(params, ['q'], ['body']);
        
        var searchGetRequest = {
            verb: 'get'.toUpperCase(),
            path: pathComponent + uritemplate('/search').expand(apiGateway.core.utils.parseParametersToObject(params, [])),
            headers: apiGateway.core.utils.parseParametersToObject(params, []),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, ['q']),
            body: body
        };
        
        
        return apiGatewayClient.makeRequest(searchGetRequest, authType, additionalParams, config.apiKey);
    };
    
    
    apigClient.searchOptions = function (params, body, additionalParams) {
        if(additionalParams === undefined) { additionalParams = {}; }
        
        apiGateway.core.utils.assertParametersDefined(params, [], ['body']);
        
        var searchOptionsRequest = {
            verb: 'options'.toUpperCase(),
            path: pathComponent + uritemplate('/search').expand(apiGateway.core.utils.parseParametersToObject(params, [])),
            headers: apiGateway.core.utils.parseParametersToObject(params, []),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, []),
            body: body
        };
        
        
        return apiGatewayClient.makeRequest(searchOptionsRequest, authType, additionalParams, config.apiKey);
    };
    

    return apigClient;
};



var apigClient = apigClientFactory.newClient();
// window.SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
//window.SpeechRecognition = window.webkitSpeechRecognition;

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
    var customTags = document.getElementById('custom_labels').innerText

    var reader = new FileReader();
    var file = document.getElementById('photofilepath').files[0];
	
	// Will reset the search bar
	document.getElementById('photofilepath').value = "";

	if (!raiseAlert(fileName)){
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