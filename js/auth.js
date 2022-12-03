// 웹푸시 SDK 초기화
FlareLane.initialize({ projectId: "db10f4ce-3428-4426-9a37-2fe17a1d873b" });

// 유저 상태 확인
auth.onAuthStateChanged(user => {
    if (user) {
        getNtotification(user);

        // 웹푸시 알림 동의 받기
        FlareLane.getIsSubscribed((isSubscribed) => {
            console.log(isSubscribed);
            if ( !isSubscribed ) {
                // 팝업창 제한 시간 지났는지 확인
                var now = new Date();
                var gap = now.getTime() - Number(localStorage.getItem('webpushModalLastShown'));
                console.log( gap / 1000 );
                if ( gap / 1000 > 5 ) {

                    // 알림 허용 팝업창 띄우기
                    var modal = `
                    <div class="modal webpushModal active">
                        <div class="modal_content">
                            <p class="modal_title">알림 받기</p>
                            <div class="subscribe">
                                <p>알림을 허용하면 당신을 위한 댓글과 소식을 놓치지 않을 수 있어요!</p>
                                <div class="btns">
                                    <button class="laterBtn">다음에</button>
                                    <button class="subscribeBtn">알림 받기</button>
                                </div>
                            </div>
                        </div>
                            
                        <div class="loader">
                            <i class="ri-loader-4-line"></i>
                        </div>
                    </div>
                    `;

                    $('body').prepend(modal);
                    $('.webpushModal').fadeIn();
                    $('.webpushModal .laterBtn').click(function() {
                        $('.webpushModal').fadeOut();
                        // 로컬스토리지에 팝업창 제한 시간 설정
                        var date = new Date();
                        date = date.getTime();
                        localStorage.setItem('webpushModalLastShown', date);
                    })
                    $('.webpushModal .subscribeBtn').click(function() {
                        // FlareLane.setIsSubscribed(true);
                        localStorage.setItem('webpushModalLastShown', 0);
                        console.log('subscribed');
                    })
                    
                }
            }
        });

        // 웹푸시 유저 아이디 설정
        FlareLane.setUserId(user.uid);
    } else {
        FlareLane.setUserId(null);
    }
    
    user = firebase.auth().currentUser;

    setupHeader(user);
})

// 로그인
$('#login_form #login_submit').click(function(e) {
    e.preventDefault();

    const email = $('#email').val();
    const password = $('#pw').val();

    auth.signInWithEmailAndPassword(email, password).then(cred => {
        // console.log(cred.user);
        window.history.back();
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
    window.location.reload();
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
            email: email,
            photoUrl: false
        })
        .then(function() {
            result.user.updateProfile({
                displayName: name
            }).then(() => {
                window.location.href = "/";
            }).catch((error) => {
                console.log(error);
            });  
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

        database.ref('users/'+uid).once('value').then(function(snapshot) {
            if ( snapshot.val() == null ) {
                database.ref('users/'+uid).update({
                    name: name,
                    email: user.email,
                    photoURL: photoURL
                })
                .then(function() {
                    window.history.back();
                })
            } else {
                window.history.back();
            }
        })
    })
    .catch((error) => {
        console.log('error code : ' +  error.code);
        console.log('error message : ' +  error.message);
    });  
})
