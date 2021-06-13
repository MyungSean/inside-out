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

// 헤더 유저 메뉴 토글
function toggleUserMenu() {
    $('header .user_menu ul').toggle();
}


// 존재하는 보드인지 아이디 체크
function boardIdCheck(id) {
    database.ref('board/'+id).once('value').then(function(snapshot) {
        if ( snapshot.val() == null ) {
            alert('잘못된 경로입니다.');
            window.history.back();        
        }
    })
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


// 유튜브 iframe 컨트롤
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var player ;
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
    height: '360',
    width: '640',
    videoId: 'M7lc1UVf-VE',
    events: {
        // 'onReady': onPlayerReady,
        'onStateChange': onPlayerStateChange
    }
    });
}

function onPlayerReady(event) {
    event.target.playVideo();
}

var done = false;
function onPlayerStateChange(event) {
    if ( event.data == YT.PlayerState.ENDED ) {
        $('.replies .pause').removeClass('active');
        $('.replies .pause').siblings('img').removeClass('active');
        $('.replies .pause').siblings('.play').addClass('active');

        player.clearVideo();
    }
}



// 모달 설정
$('.modal').click(function() {
    $(this).fadeOut(100);
})
$('.modal_content').click(function(e) {
    e.stopPropagation();
})