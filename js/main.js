// 헤더 설정
function setupHeader(user) {
    $('header').load('/html/header.html', function() {
        if (user) {
            var uid = user.uid;
            database.ref('users/'+uid).once('value').then(function(snapshot) {
                var photoURL = snapshot.val().photoURL;
                $('header .profile img').attr('src', photoURL);
            })
        } else {
            var html = `
            <a href="/user/login.html">로그인</a>
            <a href="/user/register.html">가입하기</a>
            `;
            $('header .user').html(html);
        }
    });
}

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
// 2. This code loads the IFrame Player API code asynchronously.
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// 3. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
var player ;
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
    height: '360',
    width: '640',
    videoId: 'M7lc1UVf-VE',
    events: {
        'onReady': onPlayerReady,
        // 'onStateChange': onPlayerStateChange
    }
    });
}

// 4. The API will call this function when the video player is ready.
function onPlayerReady(event) {
    event.target.playVideo();
}

// 5. The API calls this function when the player's state changes.
//    The function indicates that when playing a video (state=1),
//    the player should play for six seconds and then stop.
var done = false;
function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.PLAYING && !done) {
    setTimeout(stopVideo, 6000);
    done = true;
    }
}
function stopVideo() {
    player.stopVideo();
}

$('h3').click(function() {
    // player.playVideo();
    // player.loadVideoById("bHQqvYy5KYo", 0, "large");
    player.loadVideoById("uuqWa8VHJ1I", 0, "large");
    // player.cueVideoById("bHQqvYy5KYo", 0, "large");
})