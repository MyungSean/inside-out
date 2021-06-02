// 유저 상태 확인
auth.onAuthStateChanged(user => {
    if (user) {
        console.log('user logged in: ', user);
    } else {
        console.log('user logged out');
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
    .catch((error) => {
        console.log(error.code);
        console.log(error.message);
        alert("아이디나 비밀번호를 바르게 입력해 주세요.");
        $('#pw').val("");
        $('#pw').focus();
    });      
})


// 로그아웃
$(document).on('click', '.logoutBtn', function(e) {
    e.preventDefault();

    auth.signOut();
})


// 회원가입
function signupFormCheck() {
    const name = $('#signup_name').val();
    const email = $('#signup_email').val();
    const password = $('#signup_pw').val();
    const password_check = $('#signup_pw_check').val();

    if ( name.length < 2 ) {
        $('#signup_name').siblings('span').html('닉네임을 두 글자 이상 입력하세요.');
        $('#signup_name').focus();
        return false;
    }
    // database.ref('users').orderByChild('name').equalTo(name).once('value').then(function(snapshot) {
    //     if ( snapshot.val() !== null ) {
    //         $('#signup_name').siblings('span').html('이미 존재하는 닉네임입니다.');
    //         $('#signup_name').focus();
    //         return false;
    //     }
    // })

    if ( password !== password_check ) {
        $('#signup_pw_check').siblings('span').html('비밀번호가 일치하지 않습니다.');
        $('#signup_pw_check').focus();
        return false;
    }

    return true;
}

function password_check() {
    var password = $('#signup_pw').val();
    var password_check = $('#signup_pw_check').val();
    if ( password == password_check ) {
        $('#signup_pw_check').siblings('span').html('비밀번호가 일치합니다.');
        $('#signup_pw_check').siblings('span').addClass('correct');
    } else {
        $('#signup_pw_check').siblings('span').html('비밀번호가 일치하지 않습니다.');
        $('#signup_pw_check').siblings('span').removeClass('correct');
    }
}

function signupErrorHandling(error) {
    console.log('error code : ' +  error.code);
    console.log('error message : ' +  error.message);
    switch (error.code) {
        case "auth/invalid-email":
          errorMessage = "이메일 형식이 올바르지 않습니다.";
          $('#signup_email').siblings('span').html(errorMessage);
          $('#signup_email').focus();
          break;
        case "auth/email-already-in-use":
          errorMessage = "이미 사용중인 이메일 주소입니다.";
          $('#signup_email').siblings('span').html(errorMessage);
          $('#signup_email').focus();
          break;
          case "auth/weak-password":
              errorMessage = "비밀번호를 6자리 이상 입력해주세요.";
              $('#signup_pw').siblings('span').html(errorMessage);
              $('#signup_pw').focus();
          break;
        default:
          alert('알 수 없는 오류가 발생했습니다.\n'+error.message);
    }  
}

$('#signup_form #signup_submit').click(function(e) {
    e.preventDefault();

    // 에러 메시지 초기화
    $('#signup_form span').html("");

    const email = $('#signup_email').val();
    const password = $('#signup_pw').val();
    const password_check = $('#signup_pw_check').val();

    const name = $('#signup_name').val();

    if ( !signupFormCheck() ) {
        return;
    }

    // 회원가입
    auth.createUserWithEmailAndPassword(email, password).then(result => {
        console.log(result.user);
        var uid = result.user.uid;

        database.ref('users/'+uid).set({
            name: name,
            photoUrl: false
        })
        .then(function() {
            window.location.href = "/";
        })
    })
    .catch((error) => {
        signupErrorHandling(error);
    });        
})

// 소셜 로그인
$('.social_login_btn').click(function() {
    var loginWith = $(this).attr('name');

    if ( loginWith == "google" ) {
        var provider = new firebase.auth.GoogleAuthProvider();
    } else if ( loginWith == "facebook" ) {
        var provider = new firebase.auth.FacebookAuthProvider();
    } else {
        console.log('소셜 로그인 과정에서 오류가 발생했습니다.');
        return;
    }

    auth.signInWithPopup(provider).then((result) => {
        console.log(result);
        var user = result.user;
        var uid = user.uid;
        var name = user.displayName;
        var photoURL = user.photoURL;

        database.ref('users/'+uid).set({
            name: name,
            photoURL: photoURL
        })

        /** @type {firebase.auth.OAuthCredential} */
        var credential = result.credential;
    
    
        // This gives you a Facebook Access Token. You can use it to access the Facebook API.
        var accessToken = credential.accessToken;
        // ...
    })
    .catch((error) => {
        console.log('error code : ' +  error.code);
        console.log('error message : ' +  error.message);

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
