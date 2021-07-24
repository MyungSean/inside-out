// 헤더 설정
function setupHeader(user) {
    $('header').load('/html/header.html', function() {
        if (user) {
            var uid = user.uid;
            database.ref('users/'+uid).once('value').then(function(snapshot) {
                var photoURL = snapshot.val().photoURL;
                if ( photoURL ) {
                    $('header .profile img').attr('src', photoURL);
                }
            })

            $('header .profile a').attr('href', '/user/my.html?u='+uid);
        } else {
            var html = `
            <a href="/user/login.html">로그인</a>
            <a href="/user/register.html">가입하기</a>
            `;
            $('header .user').html(html);
        }
    });
}

// 푸터 로드
$('footer').load('/html/footer.html');

// 플레이어 로드
$('#own_player').load('/html/player.html')

// 헤더 유저 메뉴 토글
$(document).on("click", '.user_menu i', function(e){  
    e.stopPropagation();
    $('header .user_menu ul').fadeToggle(50);
})

// 헤더 알림 토글
$(document).on("click", '.notice i', function(e){  
    e.stopPropagation();
    $('header .notice .noticeModal').fadeToggle(50);
})

// 타겟영역을 제외하고 클릭했을 시 메뉴 숨김처리.
$(document).on("click", function(e){  
    if( !$(".user_menu ul").is(e.target)) {
        $(".user_menu ul").fadeOut(50);
    }
    if( !$(".noticeModal").is(e.target)) {
        $(".noticeModal").fadeOut(50);
    }
});


// 알림 표시
function getNtotification(user) {
    database.ref('users/'+user.uid+'/notifications').on('child_added', function(snapshot) {
        var key = snapshot.key;
        var type = snapshot.val().type;
        var checked = snapshot.val().checked;
        if ( checked ) {
            var checked = 'checked';
        } else {
            var checked = "";
        }
        
        var title = snapshot.val().title;
        var description = snapshot.val().description;
        var date = snapshot.val().date;
        var postURL = snapshot.val().postURL;
        
        var li = `
        <li id="${key}" class="${checked}">
        <p class="title">${title}</p>
        <p class="description">${description}</p>
        <p class="date">${getPastTime(date)}</p>
        </li>
        `;
        
        $('.noticeModal ul').prepend(li);
    })
    
    database.ref('users/'+user.uid+'/notifications').orderByChild('checked').equalTo(false).once('value').then(function(snapshot) {
        if ( snapshot.val() ) {
        var notice_cnt = Object.keys(snapshot.val()).length;
            $('.notice_cnt').html(notice_cnt);
            $('.notice_cnt').addClass('active');
        }
    })
}

// 알림에 클릭 이벤트
$(document).on('click', '.noticeModal li', function(){
    console.log(1);
    var user = auth.currentUser;
    var notificationId = $(this).attr('id');
    database.ref('users/'+user.uid+'/notifications/'+notificationId).update({
        checked: true
    })
    .then(function() {
        database.ref('users/'+user.uid+'/notifications/'+notificationId).once('value').then(function(snapshot){
            var targetURL = snapshot.val().targetURL;
            window.location.href = targetURL;
        })
    })
})


// 존재하는 보드인지 아이디 체크
function boardIdCheck(id) {
    database.ref('board/'+id).once('value').then(function(snapshot) {
        if ( snapshot.val() == null ) {
            alert('잘못된 경로입니다.');
            window.history.back();        
        }
    })
}


// 음악 재생
function playMusic(playlist) {
    var videoIds = [];

    for (let i = 0; i < playlist.length; i++) {
        const track = playlist[i];
        var videoId = track['videoId']
        videoIds.push(videoId);
    }
    player.loadPlaylist(videoIds);
}


// 글자 수 체크
function lengthCheck(e) {
    var el_id = e.id;
    var length = e.value.length;
    // $('.comment_area p span').html(length);
    $('#'+el_id).siblings('p').children('span').html(length);
}


// 밀리초를 얼마나 지났는지 반환
function getPastTime(millisecond) {
    // 지난 시간 분단위로 구하기
    var timeInterval = Math.floor(( Date.now() - millisecond ) / 1000 / 60);

    if ( timeInterval < 1 ) {
        return '방금 전';
    } else if ( 1 <= timeInterval && timeInterval < 60 ) {
        var time = timeInterval;
        return time+'분 전';
    } else if ( 60 <= timeInterval && timeInterval < 1440 ) {
        var time = Math.floor(timeInterval / 60);
        return time+'시간 전';
    } else if ( 1440 <= timeInterval && timeInterval < 10080 ) {
        var time = Math.floor(timeInterval / 60 / 24);
        return time+'일 전';
    } else if ( 10080 <= timeInterval && timeInterval < 40320 ) {
        var time = Math.floor(timeInterval / 60 / 24 / 7);
        return time+'주 전';
    } else {
        let day = new Date(millisecond);   

        let year = day.getFullYear(); // 년도
        let month = day.getMonth() + 1;  // 월
        let date = day.getDate();  // 날짜
        
        var time = year + '/' + month + '/' + date;
        return time;
    }
}

// 밀리초를 날짜로 반환
function millisecondToDate(millisecond) {
    var d = new Date(millisecond);
    var date = d.toLocaleDateString();
    return date;
}

// 초를 hh:mm:ss 형식으로 반환
function secondsToHMS(currS, totS) {
    var hours   = Math.floor(currS / 3600);
    var minutes = Math.floor((currS - (hours * 3600)) / 60);
    var seconds = Math.floor(currS - (hours * 3600) - (minutes * 60));

    // round seconds
    seconds = Math.round(seconds * 100) / 100

    if ( totS >= 3600 ) {
        var result = (hours < 10 ? "0" + hours : hours) + ":";
    } else {
        var result = "";
    }
    result += (minutes < 10 ? "0" + minutes : minutes) + ":";
    result += (seconds  < 10 ? "0" + seconds : seconds);
    return result;
}

// 모달 설정
$('.modal').click(function() {
    $(this).fadeOut(100);
})
$('.modal_content').click(function(e) {
    e.stopPropagation();
})

// 모달 로더
$('.modal .loader').click(function(e) {
    e.stopPropagation();
})