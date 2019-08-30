/* Globally Initialized Values : aws-global-conf.js
 BucketName
 s3
 NewUser
 USERPOOLID
 CLIENTID
 IDENTITYPOLLID */


function getValidSession() {
	var data = {
        UserPoolId: USERPOOLID,
        ClientId: CLIENTID
    };
    var userPool = new AmazonCognitoIdentity.CognitoUserPool(data);
    var cognitoUser = userPool.getCurrentUser();
    return cognitoUser;
}


// Validate Current Cognito User Credentials in Local Storage
function validateUser() {

    var cognitoUser = getValidSession();
    if (cognitoUser != null) {
        cognitoUser.getSession(function(err, session) {
            if (err) {
                //alert(err);
                document.getElementById('viewer').innerHTML = loginForm();
                return false;
            }
            document.getElementById('profile').innerHTML = 'Welcome  ' + session.accessToken.payload.username.toUpperCase()
            AWS.config.credentials = new AWS.CognitoIdentityCredentials({
                IdentityPoolId: IDENTITYPOLLID, // your identity pool id here
                Logins: {
                    //Change the key below according to the specific region your user pool is in.
                    'cognito-idp.us-east-1.amazonaws.com/us-east-1_JG1RWAsw2': session.getIdToken().getJwtToken()
                }
            });
            s3Instance();
            listAlbums();
        });
    } else {
        document.getElementById('viewer').innerHTML = loginForm();
    }
}


// Validate User Credentials in AWS Cognito User Pool
function authUser(username, password) {
	document.getElementById('user-login').value = 'Loading..'
    var CognitoUserPool = AmazonCognitoIdentity.CognitoUserPool;

    var authenticationData = {
        Username: username.trim().toLowerCase(),
        Password: password,
    };
    var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);

    var poolData = {
        UserPoolId: USERPOOLID, // Your user pool id here
        ClientId: CLIENTID // Your client id here
    };

    var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
    var userData = {
        Username: username.trim().toLowerCase(),
        Pool: userPool
    };

    var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

    cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: function(result) {

            var accessToken = result.getAccessToken().getJwtToken();

            AWS.config.credentials = new AWS.CognitoIdentityCredentials({
                IdentityPoolId: IDENTITYPOLLID, // your identity pool id here
                Logins: {
                    // Change the key below according to the specific region your user pool is in.
                    'cognito-idp.us-east-1.amazonaws.com/us-east-1_JG1RWAsw2': result.getIdToken().getJwtToken()
                }
            });

            document.getElementById('profile').innerHTML = 'Welcome  ' + cognitoUser.username.toUpperCase()

            AWS.config.credentials.params.Logins = AWS.config.credentials.params.Logins || {};

            AWS.config.credentials.params.Logins['cognito-idp.us-east-1.amazonaws.com/us-east-1_JG1RWAsw2'] = result.idToken.jwtToken;

            // Expire credentials to refresh them on the next request
            AWS.config.credentials.expired = true;

            //refreshes credentials using 
            AWS.config.credentials.refresh((error) => {
                if (error) {
					document.getElementById('user-login').value = 'Submit';
                    console.error(error);
                } else {
                    console.log('Successfully logged!');
                    s3Instance();
                    listAlbums();
                }
            });
        },
        onFailure: function(err) {
            xmlhttpLoder(false);
			document.getElementById('user-login').value = 'Submit';
            alert(err.message || JSON.stringify(err));
        },
    });
}


// Register New User in AWS Cognito User Poll
function registerUser(username, password, email) {
	if ( !username || !password || !email ){
		alert("User name || Password || Email fields are required");
		return;
	}
	var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
	if(!email.match(mailformat))
	{
		alert("Invalid Email");
		return;
	}
	document.getElementById('user-login').value = 'Loading..'
    var poolData = {
        UserPoolId: USERPOOLID, // Your user pool id here
        ClientId: CLIENTID // Your client id here
    };

    var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

    var attributeList = [];

    var dataEmail = {
        Name: 'email',
        Value: email
    };

    //var dataPhoneNumber = {
        //Name: 'phone_number',
        //Value: phoneno //'+15555555555'
    //};

    var attributeEmail = new AmazonCognitoIdentity.CognitoUserAttribute(dataEmail);
    //var attributePhoneNumber = new AmazonCognitoIdentity.CognitoUserAttribute(dataPhoneNumber);

    attributeList.push(attributeEmail);
    //attributeList.push(attributePhoneNumber);

    userPool.signUp(username.trim().toLowerCase(), password, attributeList, null, function(err, result) {
        if (err) {
			document.getElementById('user-login').value = 'Submit';
            alert(err.message || JSON.stringify(err));
            return;
        }
        NewUser = result.user;
        sendConfirmationCode();
    });
}


// Send Confirmation Code to Registered Email Id
function sendConfirmationCode() {
    NewUser.resendConfirmationCode(function(err, result) {
        if (err) {
            alert(err);
            return;
        }
        alert("Confirmation code sent to E-mail");
        document.getElementById('viewer').innerHTML = confirmationForm();
    });

}


// Validate Confirmation Code
function confirmUser(code) {
    NewUser.confirmRegistration(code, true, function(err, result) {
        if (err) {
            alert(err);
            return;
        }
        alert("User Created");
        validateUser();
    });
}


// Signout All User Session
function signOutUser() {
    var cognitoUser = getValidSession();
    if (cognitoUser != null) {
        cognitoUser.signOut();
        localStorage.clear();
        document.getElementById('profile').innerHTML = ""
        document.getElementById('viewer').innerHTML = loginForm();
    }
	document.getElementById('viewer').innerHTML = loginForm();
}