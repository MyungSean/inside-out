// 유저 상태 확인
auth.onAuthStateChanged(user => {
    if (user) {
        console.log('user logged in: ', user);
    } else {
        console.log('userlogged out');
    }
    setupHeader(user);
})

// 로그인
$('#login_form #login_submit').click(function(e) {
    e.preventDefault();

    const email = $('#email').val();
    const password = $('#pw').val();

    auth.signInWithEmailAndPassword(email, password).then(cred => {
        // console.log(cred.user);
    })
})


// 로그아웃
$('.logoutBtn').click(function(e) {
    e.preventDefault();

    auth.signOut();
})


// 회원가입
$('#signup_form #signup_submit').click(function(e) {
    e.preventDefault();

    const email = $('#signup_email').val();
    const password = $('#signup_pw').val();

    // 회원가입
    auth.createUserWithEmailAndPassword(email, password).then(cred => {
        // console.log(cred.user);
    })
})

// 소셜 로그인
// 구글 계정으로 로그인
$('#loginWithGoogle').click(function() {
    var provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider).then((result) => {
        /** @type {firebase.auth.OAuthCredential} */
        var credential = result.credential;
    
        // This gives you a Google Access Token. You can use it to access the Google API.
        var token = credential.accessToken;
        // The signed-in user info.
        var user = result.user;
        // ...
      }).catch((error) => {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
        // ...
    });
})

// 페이스북 계정으로 로그인
$('#loginWithFacebook').click(function() {
    var provider = new firebase.auth.FacebookAuthProvider();
    auth.signInWithPopup(provider).then((result) => {
        /** @type {firebase.auth.OAuthCredential} */
        var credential = result.credential;
    
        // The signed-in user info.
        var user = result.user;
    
        // This gives you a Facebook Access Token. You can use it to access the Facebook API.
        var accessToken = credential.accessToken;
        // ...
    })
    .catch((error) => {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
        // ...
    });  
})