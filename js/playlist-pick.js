// 페이지 정보 표시
database.ref('board/playlist/info').once('value').then(function(snapshot) {
    var name = snapshot.val().name;
    var description = snapshot.val().description;

    $('.board_info h2').html(name);
    $('.board_info p').html(description);
})

// 플레이리스트 불러오기
database.ref('board/playlist/posts').once('value').then(function(snapshot) {
    snapshot.forEach(childSnapshot => {
        var playlistKey = childSnapshot.key;
        var videoId = childSnapshot.val().videoId;
        var title = childSnapshot.val().title;
        var likes = childSnapshot.val().likes;
        if (likes) {
            var likesCnt = Object.keys(likes).length;
        } else {
            var likesCnt = "0";
        }
        var from = childSnapshot.val().from;
        var thumbnail = childSnapshot.val().thumbnail;

        var user = auth.currentUser;
        
        var fillBtn = '';
        var lineBtn = 'active';
        if ( user ) {
            // 내가 좋아요 표시 했는지 확인
            if ( likes && likes[user.uid] ) {
                var fillBtn = 'active';
                var lineBtn = '';
            }
        }

        var html = `
        <div class="playlist_wrap">
            <div class="playlist_overlay"></div>
            <div class="playlist dsdw" id="${videoId}">
                <input type="hidden" class="playlistKey" value="${playlistKey}">
                <i class="ri-close-fill closeBtn dsdw"></i>
                <div class="video_container">
                    <iframe src="https://www.youtube.com/embed/${videoId}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                </div>
                <div>
                    <img src="${thumbnail}" class="thumbnail">
                    <div class="playlistInfo">
                    <p class="title">${title}</p>
                    <div class="playlistControl">
                        <div class="btn">
                            <i class="ri-share-forward-fill shareBtn"></i>
                            <span class="label dsdw">공유하기</span>
                        </div>
                        <div class="btn likesCnt">
                            <p>${likesCnt}</p>
                        </div>
                        <div class="btn heart-fill-btn ${fillBtn}">
                            <i class="ri-heart-fill"></i>
                            <span class="label dsdw">공감 취소</span>
                        </div>
                        <div class="btn heart-line-btn ${lineBtn}">
                            <i class="ri-heart-line"></i>
                            <span class="label dsdw">공감</span>
                        </div>
                        <div class="btn">
                            <a href="https://youtu.be/${videoId}" target="_blank">
                            <i class="ri-youtube-fill"></i>
                            </a>
                            <span class="label dsdw">유튜브에서 보기</span>
                        </div>
                        <div class="btn">
                            <a href="${from}" target="_blank">
                            <i class="ri-link"></i>
                            </a>
                            <span class="label dsdw">사연 보러가기</span>
                        </div>
                    </div>
                    </div>
                </div>
            </div>
        </div>
        `

        $('.playlists').append(html);
    });
})

// 플레이리스트 재생
function openPlaylist(playlist) {
    var videoId = playlist.attr('id')
    playlist.find('iframe').attr('src', 'https://www.youtube.com/embed/'+videoId);

    playlist.addClass('active');
    playlist.siblings('.playlist_overlay').fadeIn(100);
    playlist.find('.thumbnail').fadeOut(200, function() {
        playlist.find('.video_container').fadeIn(200);
    })
    playlist.find('.title').css('text-align', 'left');
    playlist.find('.title').css('flex', '1 0 0');
    playlist.find('.closeBtn').fadeIn(100);
    playlist.find('.playlistInfo').css('overflow', 'inherit');
}
function closePlaylist(playlist) {
    playlist.find('iframe').attr('src', '');
    
    playlist.removeClass('active');
    playlist.siblings('.playlist_overlay').fadeOut(100);
    playlist.find('.video_container').fadeOut(200, function() {
        playlist.find('.thumbnail').fadeIn(200);
    })
    playlist.find('.title').css('text-align', 'center');
    playlist.find('.title').css('flex', '1 0 100%');
    playlist.find('.closeBtn').hide();
    playlist.find('.playlistInfo').css('overflow', 'hidden');
}

$('.playlists').on('click', '.thumbnail', function() {
    var playlist = $(this).closest('.playlist');
    openPlaylist(playlist);
})
$('.playlists').on('click', '.closeBtn', function() {
    var playlist = $(this).closest('.playlist');
    closePlaylist(playlist);
})

$('.playlists').on('click', '.playlist_overlay', function() {
    var playlist = $(this).siblings('.playlist');
    closePlaylist(playlist);
})


// 플레이리스트 메뉴
// 버튼 라벨 표시
$(document).on('mouseenter','.playlist .btn i', function () {
    $(this).closest('.btn').find('.label').fadeIn(100);
}).on('mouseleave','.playlist .btn i',  function(){
    $(this).closest('.btn').find('.label').fadeOut(100);
});

// 플레이리스트 공유
// 음악 공유
$('.playlists').on('click', '.playlist .shareBtn', function() {
    var videoId = $(this).closest('.playlist').attr('id');
    var link = 'https://youtu.be/'+videoId;
    
    if (navigator.share) {
        var title = "[Playlist] " + $(this).closest('.playlist').find('.title').html();

        navigator.share({
            title: `${title}`,
            url: `${link}`
        })
        .catch(console.error);
    } else {
        var $temp = $("<input>");
        $("body").append($temp);
        $temp.val(link).select();
        document.execCommand("copy");
        $temp.remove();
        alert('링크가 복사됐습니다.');
    }
})

// 좋아요
$('.playlists').on('click', '.playlist .ri-heart-line', function() {
    var user = auth.currentUser;
    
    if ( !user ) {
        alert('로그인 후 이용하실 수 있습니다.');
        return;
    }
    $(this).closest('.playlistControl').find('.heart-line-btn').removeClass('active');
    $(this).closest('.playlistControl').find('.heart-fill-btn').addClass('active');
    
    var playlistKey = $(this).closest('.playlist').find('.playlistKey').val();
    var uid = user.uid;

    database.ref('board/playlist/posts/'+playlistKey+'/likes').update({
        [uid]: true
    })

    var likesElement = $(this).closest('.playlistControl').find('.likesCnt p');
    var likesCnt = Number(likesElement.html());
    console.log(likesCnt);
    var likesCnt = likesCnt + 1;
    console.log(likesCnt);
    likesElement.html(likesCnt);
})
$('.playlists').on('click', '.playlist .ri-heart-fill', function() {
    $(this).closest('.playlistControl').find('.heart-line-btn').addClass('active');
    $(this).closest('.playlistControl').find('.heart-fill-btn').removeClass('active');
    
    var playlistKey = $(this).closest('.playlist').find('.playlistKey').val();
    var user = auth.currentUser;
    var uid = user.uid;

    database.ref('board/playlist/posts/'+playlistKey+'/likes/'+uid).remove();

    var likesElement = $(this).closest('.playlistControl').find('.likesCnt p');
    var likesCnt = Number(likesElement.html());
    console.log(likesCnt);
    var likesCnt = likesCnt - 1;
    console.log(likesCnt);
    likesElement.html(likesCnt);
})


// 유튜브 구독 배지
$('.subscribeBadge').hover(function() {
    $('.subscribeBadge').addClass('on');
    $('.subscribeBadge button').addClass('on');
}, function() {
    $('.subscribeBadge').removeClass('on');
    // $('.subscribeBadge button').removeClass('on');
})

// 모바일 애니메이션
var lastScrollTop = 0;
$(window).scroll(function(event){
   var st = $(this).scrollTop();
   if (st > lastScrollTop){
       // downscroll code
       $('.subscribeBadge').removeClass('active');
       $('.subscribeBadge').removeClass('on');
    } else {
        // upscroll code
        $('.subscribeBadge').addClass('active');
        // $('.subscribeBadge').addClass('on');
    }
   lastScrollTop = st;
});