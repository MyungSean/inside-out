// URL 파라미터에서 정보 확인하기
const url = new URL(window.location.href);
const urlParams = url.searchParams;
uid = urlParams.get('u');


// 유저 상태 확인
auth.onAuthStateChanged(user => {
    // 유저 데이터 불러오기(유저 정보, 플레이리스트)
    if ( uid ) {
        getUserInfo(uid);
        getPlaylist(uid);
    } else {
        alert('잘못된 경로입니다.');
        window.history.back(-1);
    }
    
    // 사용자 UI 표시
    if ( user ) {
        if ( user.uid !== uid ) {
            visitorView();
        }
    } else {
        visitorView();
    }

    // 내가 쓴 글 불러오기
    if ( user ) {
        if ( user.uid == uid ) {
            getMyPosts();
            getLikePosts();
        }
    }
})

// 방문자 UI
function visitorView() {
    $('.user_info .editBtn').remove();
    $('.user_info .settingBtn').remove();
    // $('.nav li').not(':first-child').remove();
    $('.nav').remove();
    $('.addPlaylistBtn').remove();
}

// 유저 정보 불러오기
function getUserInfo(uid) {
    database.ref('users/'+uid).once('value').then(function(snapshot) {
        var name = snapshot.val().name;
        var photoURL = snapshot.val().photoURL;

        $('.user_info .name').html(name);
        $('.user_info .img_wrap img').attr('src', photoURL);
    })
}

// 플레이리스트 불러오기
function getPlaylist(uid) {
    $('.playlists .lists').html('');
    database.ref('users/'+uid+'/playlists').once('value').then(function(snapshot) {
        var user = auth.currentUser;

        for (const [key, value] of Object.entries(snapshot.val())) {
            const childSnapshot = snapshot.val()[key];
            var name = childSnapshot.info.name;
            var secret = childSnapshot.info.secret;
            var coverImage = "/img/default_playlist_cover.jpg";
            
            if ( secret ) {
                if ( !user ) {
                    continue;
                }
                if ( user.uid !== uid ) {
                    continue;
                }
            }
            
            var ul = "";

            const musics = childSnapshot.musics;
            if ( musics !== undefined ) {
                const music_ids = Object.keys(musics);
                for (var i = 0; i < music_ids.length; i++) {

                    if ( i == 3 ) { // 미리보기 곡 최대 3개까지 표시
                        break;
                    }

                    var title = musics[music_ids[i]].title;
                    var artist = musics[music_ids[i]].artist;
                    var videoId = musics[music_ids[i]].videoId;
                    var from = musics[music_ids[i]].from;
                    var thumbnail = musics[music_ids[i]].thumbnail;
                    if ( i == 0 ) {
                        var coverImage = thumbnail;
                    }
    
                    var li = `
                    <li>
                        <div class="img_wrap">
                            <img src="${thumbnail}">
                        </div>
                        <div class="music_info">
                            <p class="title">${title}</p>
                            <p class="artist">${artist}</p>
                        </div>
                    </li>
                    `;
                    
                    ul += li;
                }
            }

            var playlist = `
            <div class="playlist" id="${key}">
                <div class="img_wrap">
                    <p class="listTitle">${name}</p>
                    <div class="playBtn_wrap">
                        <i class="ri-play-fill playBtn"></i>
                    </div>
                    <img src="${coverImage}">
                </div>
                <ul>
                    ${ul}
                </ul>
            </div>
            `;

            $('.playlists .lists').append(playlist);
        };
    })
}

// 내가 쓴 글 불러오기
function getMyPosts() {
    var user = auth.currentUser;
    database.ref('board/music/posts').orderByChild('uid').equalTo(user.uid).once('value').then(function(snapshot) {
            snapshot.forEach(childSnapshot => {
                
            var number = childSnapshot.val().number;
            var subject = childSnapshot.val().subject;
            // var name = childSnapshot.val().name;
            var name = "";
            var anonymity = childSnapshot.val().anonymity;
            var reply = childSnapshot.val().reply;
            var reply_cnt = Object.keys(reply).length;
            var upload_date = childSnapshot.val().upload_date;
            var views = childSnapshot.val().views;
            var likes = childSnapshot.val().likes;

            // 삭제된 게시물 표시하지 않기
            var state = childSnapshot.val().state;
            if ( state == 'deleted') {
                return;
            }
            // 익명 처리
            if ( anonymity ) {
                var name = "익명";
            }
            if ( reply_cnt > 0 ) {
                var reply_cnt = '<i class="ri-music-fill"></i>' + reply_cnt;
            } else {
                var reply_cnt = "";
            }
    
            var tr = `
            <tr>
            <td>${number}</td>
            <td><a href="/board/post.html?id=music&no=${number}">${subject}</a>${reply_cnt}</td>
            <td>${name}</td>
            <td>${getPastTime(upload_date)}</td>
            <td>${views}</td>
            <td>${likes}</td>
            </tr>`;
    
            $('.myPosts table tbody').prepend(tr);
        });
    })    
}

// 내가 좋아요 표시한 글 불러오기
function getLikePosts() {
    var user = auth.currentUser;
    database.ref('users/'+user.uid+'/likes/posts').once('value').then(function(snapshot) {
        var keys = Object.keys(snapshot.val());
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            
            database.ref('board/music/posts/'+key).once('value').then(function(snapshot) {            
                var number = snapshot.val().number;
                var subject = snapshot.val().subject;
                var name = snapshot.val().name;
                var anonymity = snapshot.val().anonymity;
                var reply = snapshot.val().reply;
                var reply_cnt = Object.keys(reply).length;
                var upload_date = snapshot.val().upload_date;
                var views = snapshot.val().views;
                var likes = snapshot.val().likes;
                
                // 삭제된 게시물 표시하지 않기
                var state = snapshot.val().state;
                if ( state == 'deleted') {
                    return;
                }
                // 익명 처리
                if ( anonymity ) {
                    var name = "익명";
                }
                if ( reply_cnt > 0 ) {
                    var reply_cnt = '<i class="ri-music-fill"></i>' + reply_cnt;
                } else {
                    var reply_cnt = "";
                }
                
                var tr = `
                <tr>
                <td>${number}</td>
                <td><a href="/board/post.html?id=music&no=${number}">${subject}</a>${reply_cnt}</td>
                <td>${name}</td>
                <td>${getPastTime(upload_date)}</td>
                <td>${views}</td>
                <td>${likes}</td>
                </tr>`;
                
                $('.likePosts table tbody').prepend(tr);
            })    
        }
    })
}


// 플레이리스트 호버 액션
$(document).on('mouseenter','.playlist', function () {
    $(this).find('ul').addClass('on');
    $('.playlist').css('z-index', 0);
    $(this).css('z-index', 10);
    $(this).find('.playBtn').addClass('on');
    $(this).find('.playBtn_wrap').addClass('on');
}).on('mouseleave','.playlist',  function(){
    $(this).find('ul').removeClass('on');
    $(this).find('.playBtn').removeClass('on');
    $(this).find('.playBtn_wrap').removeClass('on');
});


// 새로운 플레이리스트 만들기
$('.addPlaylistBtn').click(function() {
    $('.addPlaylistModal').fadeIn(100);    
})
$('#makeNewPlaylist').click(function() {
    var newName = $('#newPlaylistName').val();
    if ( newName == "" ) {
        alert('새로운 플레이리스트의 이름을 입력해주세요');
        $('#newPlaylistName').focus();
        return
    }

    var user = auth.currentUser;
    var secret = $('input:checkbox[id="secret"]').is(":checked");

    database.ref('users/'+user.uid+'/playlists').once('value').then(function(snapshot) {
        if ( snapshot.val() !== null ) {
            for (const [key, value] of Object.entries(snapshot.val())) {
                const childSnapshot = snapshot.val()[key];
                var name = childSnapshot.info.name;
                if ( name !== newName ) {
                    continue;
                }
                
                alert('같은 이름을 가진 플레이리스트가 이미 존재하니다.')
                $('#newPlaylistName').focus();
                return;
            }
        }
        
        database.ref('users/'+user.uid+'/playlists').push().set({
            info: {
                name: newName,
                secret: secret
            }
        })
        $('#newPlaylistName').val("");
        $('.addPlaylistModal').hide();
        location.reload();
    })
})


// 유저 메뉴
// 프로필 수정
$('.user_info').on('click', '.editBtn', function() {

});

// 설정으로 이동

// 내 페이지 공유
$('.user_info').on('click', '.shareBtn', function() {
    if ( uid == null || uid == undefined ) {
        var user = auth.currentUser;
        var uid = user.uid;
    }
    var link = window.location.protocol + "//" + window.location.host + window
    .location.pathname + "?u=" + uid; 
    
    if (navigator.share) {
        var title = $('.user_info .name').html();

        navigator.share({
            title: `[inside out] ${title}님의 프로필`,
            url: `${link}`
        })
        .catch(console.error);
    } else {
        var $temp = $("<input>");
        $("body").append($temp);
        $temp.val(link).select();
        document.execCommand("copy");
        $temp.remove();
        alert('내 페이지 링크가 복사됐습니다.');
    }
})


// 네비게이션바
$('.nav li').click(function() {
    $('.nav li').removeClass('active');
    $(this).addClass('active');
})
$('#playlistsBtn').click(function() {
    $('.myActivity').hide();
    $('.playlists').show();
})
$('#myPostsBtn').click(function() {
    $('.myActivity').hide();
    $('.myPosts').show();
})
$('#likePostsBtn').click(function() {
    $('.myActivity').hide();
    $('.likePosts').show();
})