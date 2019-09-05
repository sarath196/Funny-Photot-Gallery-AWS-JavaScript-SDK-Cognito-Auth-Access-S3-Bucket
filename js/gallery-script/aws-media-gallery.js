/* Globally Initialized Values : aws-global-conf.js
 BucketName
 s3
 NewUser
 USERPOOLID
 CLIENTID
 IDENTITYPOLLID */


//Create a new service object
function s3Instance() {
    s3 = new AWS.S3({
        apiVersion: '2006-03-01',
        params: {
            Bucket: BucketName
        }
    });
}


// A utility function to create HTML.
function getHtml(template) {
    return template.join('\n');
}


// List the photo albums that exist in the bucket.
function listAlbums() {
    xmlhttpLoder(true);
    s3.listObjects({
        Delimiter: '/',
		Prefix: getValidSession().username+'_',
    }, function(err, data) {
        if (err) {
            return alert('There was an error listing your albums: ' + err.message);
        } else {
            var albums = data.CommonPrefixes.map(function(commonPrefix) {
                var prefix = commonPrefix.Prefix;
				var originalName = decodeURIComponent(prefix.replace('/', ''));
                var albumName = decodeURIComponent(originalName.replace(getValidSession().username+'_', ''));
                return getHtml([
                    '<div style="text-align:center" class="col-lg-3 thumb">\
					<button type="button" class="close" aria-label="Close" onclick="deleteAlbum(\'' + originalName + '\')"><span aria-hidden="true" style="position: absolute; right: 23px; color: white;" >&times;</span></button>\
					<a class="thumbnail" href="#" >\
					<img class="img-thumbnail" src="https://images.pexels.com/photos/853168/pexels-photo-853168.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260" \
					 alt="' + albumName + '" onclick="viewAlbum(\'' + originalName + '\')">\
					</a>\
					<h5>' + albumName + '</h5>\
					</div>'
                ]);
            });
            var message = albums.length ?
                getHtml([
                    '',
                ]) :
                '<p>You do not have any albums. Please Create album.';
            var htmlTemplate = [
                '<div class="col-md-12">\
				<div style="float:right;" >\
				<div class="input-group mb-3">\
				<input type="text" class="form-control" placeholder="Add Album" id="albumbucket" name="createAlbum">\
				<div class="input-group-append">\
				<button id="addalbum" class="input-group-text" onclick="createAlbum()" title="Add Album">Create Album</button>\
				</div>\
				&nbsp;&nbsp;&nbsp;<a href="#" class="signout mt-1" onClick="signOutUser()" name="Sign-out" title="SignOut"><i class="fas fa-power-off fa-2x"></i></a>\
				</div>\
				</div>\
				</div>',
                message,
                getHtml(albums),
            ]
            document.getElementById('viewer').innerHTML = getHtml(htmlTemplate);
            xmlhttpLoder(false);
        }
    });
}


// Show the photos that exist in an album.
function viewAlbum(albumName) {
    xmlhttpLoder(true);
    var albumPhotosKey = encodeURIComponent(albumName) + '/_';
    var counter = 0;
    s3.listObjects({
        Prefix: albumPhotosKey
    }, function(err, data) {
        if (err) {
            return alert('There was an error viewing your album: ' + err.message);
        }
        // 'this' references the AWS.Response instance that represents the response
        var href = this.request.httpRequest.endpoint.href;
        var bucketUrl = href + BucketName + '/';
        var photos = data.Contents.map(function(photo) {
            var photoKey = photo.Key;
            var photoUrl = bucketUrl + encodeURIComponent(photoKey);
            counter += 1
            return getHtml([
                '<div class="col-lg-3 col-md-4 col-xs-6 thumb">\
				<button type="button" class="close" aria-label="Close" onclick="deletePhoto(\'' + albumName + '\',\'' + photoKey.replace(albumPhotosKey, '') + '\')"><span aria-hidden="true" style="position: absolute; right: 23px; top: 4px; color: #060606;" >&times;</span></button>\
				<a class="thumbnail" style="width: 254px;height: 193px;" href="#" data-image-id="' + (counter) + '" data-toggle="modal" data-title="' + photoKey.replace(albumPhotosKey, '') + '" data-image="' + photoUrl + '" data-target="#image-gallery">\
				<img class="img-thumbnail img-fluid" style="width: 254px;height: 193px;" src="' + photoUrl + '" alt="' + photoKey.replace(albumPhotosKey, '') + '">\
				</a>\
				</div>',
            ]);
        });
		
        var message = photos.length ?
            '' :
            '<p>There are no photos in this album.</p>';
        var htmlTemplate = [
            '<div class="col-md-12">\
			<div style="float:left">\
			<button class="btn" onclick="listAlbums()">Back To Albums</button>\
			</div>\
			<div style="float:right;" >\
			<div style="width:200px" class="custom-file">\
			<input type="file" class="custom-file-input" multiple id="photoupload" type="file" accept="image/*">\
			<label class="custom-file-label" for="customFile">Choose file</label>\
			</div>\
			<button id="addphoto" class="btn" title="Add Photos" onclick="addPhoto(\'' + albumName + '\')">Add Photos</button>\
			</div>\
			</div>\
			<div  id="success-alert" class="alert alert-success container" style="display:none">\
			<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>\
			<span id="success-content"></span>\
			</div>\
			<div class="container" id="progress-id" style="display:none">\
			<h3>Uploading: <span id="progress-content"></span></h3>\
			<div class="progress">\
			<div class="progress-bar" id="progress-bar-id" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width:0%">0%</div>\
			</div>\
			</div>',
			message,
            getHtml(photos),
        ]
        document.getElementById('viewer').innerHTML = getHtml(htmlTemplate);
        xmlhttpLoder(false);
    });
}


// Add New Photos to that existing Album
function addPhoto(albumName) {
    xmlhttpLoder(true);
    var files = document.getElementById('photoupload').files;

    if (!files.length) {
		xmlhttpLoder(false);
        return alert('Please choose a file to upload first.');
    }

    for (i = 0; i < files.length; i++) {
        var file = files[i];
        prefix_filename = file.name.replace('_', '');
        var fileName = '_' + prefix_filename
        var albumPhotosKey = encodeURIComponent(albumName) + '/';
        var photoKey = albumPhotosKey + fileName;

        s3.upload({
            Key: photoKey,
            Body: file,
            ACL: 'public-read'
        }, function(err, data) {
            if (err) {
                xmlhttpLoder(false);
                return alert('There was an error uploading your photo: ', err.message);
            }
        }).on('httpUploadProgress', function(evt) {
	
			document.getElementById("progress-id").style.display = "block";
			document.getElementById('progress-content').innerHTML = evt.key.split("/")[1]
			elem = document.getElementById('progress-bar-id');
			elem.style.width =  parseInt((evt.loaded * 100) / evt.total)+'%';
			elem.innerHTML = parseInt((evt.loaded * 100) / evt.total)+'%';
			elem.setAttribute('aria-valuenow', parseInt((evt.loaded * 100) / evt.total)+'%');
			console.log("Uploaded :: " + parseInt((evt.loaded * 100) / evt.total)+'%');
			}).send(function(err, data) {
			document.getElementById("progress-id").style.display = "none";
			document.getElementById("success-alert").style.display = "block";
			document.getElementById('success-content').innerHTML = "<strong>Successfully Uploaded! :: Total "+(i+1)+" Files Uploaded</strong>"
			viewAlbum(albumName);
		});
    }
    xmlhttpLoder(false);
    //alert('Successfully uploaded photo.');
    
}


// Delete Photo form the Album
function deletePhoto(albumName, photoKey) {
    var r = confirm("Are you sure!, Confirm delete.");
    if (r == false) {
        return false;
    }
    var params = {
        Bucket: BucketName,
        Key: albumName + '/' + '_' + photoKey
    };

    s3.deleteObject(params, function(err, data) {
        if (err) {
            return alert('There was an error deleting your photo: ', err.message);
        }
        alert('Successfully deleted photo.');
        viewAlbum(albumName);
    });
}


// Create new Album 
function createAlbum(albumName) {
    xmlhttpLoder(true);
    albumName = document.getElementById('albumbucket').value.trim();
    if (!albumName) {
		xmlhttpLoder(false);
        return alert('Album names must contain at least one non-space character.');
    }
    if (albumName.indexOf('/') !== -1) {
		xmlhttpLoder(false);
        return alert('Album names cannot contain slashes.');
    }
    var albumKey = encodeURIComponent(getValidSession().username)+'_'+encodeURIComponent(albumName)+'/';
    s3.headObject({
        Key: albumKey
    }, function(err, data) {
        if (!err) {
            xmlhttpLoder(false);
            return alert('Album already exists.');
        }
        if (err.code !== 'NotFound') {
            xmlhttpLoder(false);
            return alert('There was an error creating your album: ' + err.message);
        }
        s3.putObject({
            Key: albumKey
        }, function(err, data) {
            if (err) {
                xmlhttpLoder(false);
                return alert('There was an error creating your album: ' + err.message);
            }
            xmlhttpLoder(false);
            alert('Successfully created album.');
            viewAlbum(albumName);
        });
    });
}


// Delete Album include All Photos
function deleteAlbum(albumName) {
    var r = confirm("Are you sure!, Confirm delete.");
    if (r == false) {
        return false;
    }
    var albumKey = encodeURIComponent(albumName) + '/';
    s3.listObjects({
        Prefix: albumKey
    }, function(err, data) {
        if (err) {
            return alert('There was an error deleting your album: ', err.message);
        }
        var objects = data.Contents.map(function(object) {
            return {
                Key: object.Key
            };
        });
        s3.deleteObjects({
            Delete: {
                Objects: objects,
                Quiet: true
            }
        }, function(err, data) {
            if (err) {
                return alert('There was an error deleting your album: ', err.message);
            }
            alert('Successfully deleted album.');
            listAlbums();
        });
    });
}


// Login form Template
function loginForm() {
    return [
        '<div id="login" style="width:100%">\
			<div class="container">\
				<div id="login-row" class="row justify-content-center align-items-center">\
					<div id="login-column">\
						<div id="login-box" class="col-md-12">\
							<form id="login-form" class="form" action="" >\
								<h3 class="text-center text-info">Login</h3>\
								<div class="form-group">\
									<label for="username" class="text-info">Username:</label><br>\
									<input type="text" required name="username" id="username" class="form-control">\
								</div>\
								<div class="form-group">\
									<label for="password" class="text-info">Password:</label><br>\
									<input type="password" required name="password" id="password" class="form-control">\
								</div>\
								<div class="form-group" style="text-align:center">\
									<br><input type="Button" onClick="authUser(document.getElementById(\'username\').value.trim(), document.getElementById(\'password\').value.trim())" name="submit" id="user-login" class="btn btn-info btn-md" value="Submit">\
									<br><br><a href="#" onClick="document.getElementById(\'viewer\').innerHTML = signupForm();">SignUp New User</a>\
								</div>\
							</form>\
						</div>\
					</div>\
				</div>\
			</div>\
			</div>'
    ]
}


// Registration form Template
function signupForm() {
    return [
        '<div id="login" style="width:100%">\
	<div class="container">\
		<div id="login-row" class="row justify-content-center align-items-center">\
			<div id="login-column" class="col-md-4">\
				<div id="login-box" class="col-md-12">\
					<button type="button" class="close" aria-label="Close" onclick="signOutUser()"><span aria-hidden="true" style="position: absolute; right: 23px; color: black;" >&times;</span></button>\
					<form id="login-form" class="form" action="" >\
						<h3 class="text-center text-info">Register</h3>\
						<div class="form-group">\
							<label for="username" class="text-info">Username:</label><br>\
							<input type="text" required name="username" id="username" class="form-control">\
						</div>\
						<div class="form-group">\
							<label for="password" class="text-info">Password:</label><br>\
							<input type="password" required name="password" id="password" class="form-control">\
							<p style="font-size:10pt; color:#63778a;">must have at least 8 characters, one uppercase, number and special characters</p>\
						</div>\
						<div class="form-group">\
							<label for="email" class="text-info">Email:</label><br>\
							<input type="email" required name="email" id="email" class="form-control">\
						</div>\
						<div class="form-group" style="text-align:center">\
							<br><input type="Button" onClick="registerUser(document.getElementById(\'username\').value.trim(), document.getElementById(\'password\').value.trim(), document.getElementById(\'email\').value.trim())" name="submit" id="user-login" class="btn btn-info btn-md" value="Submit">\
						</div>\
					</form>\
				</div>\
			</div>\
		</div>\
	</div>\
	</div>'
    ]
}


// Confirmation Code form Template
function confirmationForm() {
    return [
        '<div id="login" style="width:100%">\
	<div class="container">\
		<div id="login-row" class="row justify-content-center align-items-center">\
			<div id="login-column" class="col-md-4">\
				<div id="login-box" class="col-md-12">\
					<form id="login-form" class="form" action="" >\
						<div class="form-group">\
							<label for="ccode" class="text-info">Confirmation code sent to your E-Mail:</label><br>\
							<input type="text" required name="ccode" id="ccode" class="form-control">\
						</div>\
						<div class="form-group" style="text-align:center">\
							<br><input type="Button" onClick="confirmUser(document.getElementById(\'ccode\').value.trim())" name="submit" id="user-login" class="btn btn-info btn-md" value="Submit">\
						</div>\
					</form>\
				</div>\
			</div>\
		</div>\
	</div>\
	</div>'
    ]
}


// Html Loader Design
function xmlhttpLoder(result) {
    if (result == true) {
        document.getElementById('cover').style.display = "block";
    } else {
        document.getElementById('cover').style.display = "none";
    }
}