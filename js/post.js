// URL 파라미터에서 정보 확인하기
const url = new URL(window.location.href);
const urlParams = url.searchParams;
id = urlParams.get('id');
no = urlParams.get('no');

database.ref('board/'+id+'/posts').orderByChild('number').equalTo(Number(no)).once('value').then(function(snapshot){
    // 존재하지 않는 게시물일 경우
    if ( snapshot.val() == null ) {
        $('.noPost').show();
        return;
    }

    snapshot.forEach(childSnapshot => {
        var postId = childSnapshot.key;

        // 조회수 카운트
        database.ref('board/'+id+'/posts/'+postId).update({
            views: firebase.database.ServerValue.increment(1)
        })
        
        // 게시물 불러오기
        var uid = childSnapshot.val().uid;
        var name = childSnapshot.val().name;
        var anonymity = childSnapshot.val().anonymity;
        var subject = childSnapshot.val().subject;
        var upload_date = childSnapshot.val().upload_date;
        var edit_date = childSnapshot.val().edit_date;
        var content = childSnapshot.val().content;
        var number = childSnapshot.val().number;
        var likes = childSnapshot.val().likes;
        var views = childSnapshot.val().views;
        var state = childSnapshot.val().state;

        // 삭제된 게시물 표시하지 않기
        if ( state == 'deleted' ) {
            $('.noPost').show();
            return;
        }

        // 익명 처리
        if ( anonymity ) {
            var name = "익명";
        } else {
            var name = `
                <a href="/user/my.html?u=${uid}">
                    ${name}
                </a>
            `;
        }

        $('#postId').val(postId);
        $('.post_info h3').html(subject);
        $('.author').html(name);
        $('.views').html(views);
        $('.upload_date').html(getPastTime(upload_date));
        $('.content').html(content);
        $('#post_likes').html(likes);
        
        // 수정 확인
        if ( edit_date ) {
            $('.upload_date').append(' (수정됨)')
        }
        
        var user = auth.currentUser;
        if ( user ) {

            // 유저 상태 확인후 포스트 삭제 버튼 추가
            if ( user.uid == uid ) {
                var menu = `
                    <div class="edit_menu">
                        <i class="ri-pencil-fill edit edit_post"></i>
                        <i class="ri-close-fill delete delete_post"></i>
                    </div>
                `;
                $('.post').append(menu);
            }            

            // 내가 좋아요 표시했는지 확인
            database.ref('users/'+user.uid+'/likes/posts').once('value').then(function(snapshot) {
                var postId = $('#postId').val();
                // console.log(Object.keys(snapshot.val()));
                var postIds = Object.keys(snapshot.val());
                for (let i = 0; i < postIds.length; i++) {
                    const target_id = postIds[i];
                    if ( target_id == postId ) {
                        $('.post .ri-heart-line').removeClass('active');
                        $('.post .ri-heart-fill').addClass('active');
                        break;
                    }
                }
            })
        } else {
            $('.post .likes').hide();
        }



        $('.post').show();
        
        
        // 댓글 불러오기
        var replies = childSnapshot.val().reply;
        
        if ( replies == undefined ) {
            $('.reply').show();
            return;
        }

        var reply_cnt = Object.keys(replies).length;
        $('.reply_cnt').html(reply_cnt);
        $('.reply_info span').html(reply_cnt);

        for (const [key, reply] of Object.entries(replies)) {            
            var artist = reply.artist;
            var title = reply.title;
            var videoId = reply.videoId;
            var thumbnail = reply.thumbnail;
            var comment = reply.comment;
            var uid = reply.uid;
            var name = reply.name;
            var anonymity = reply.anonymity;
            var likes = reply.likes;
            var reports = reply.reports;
            var reply_upload_date = reply.upload_date;
            var reply_edit_date = reply.edit_date;
            // console.log(artist, title, videoId, thumbnail, comment, uid, anonymity, likes, reports, reply_upload_date);

            if ( anonymity ) {
                var name = "익명";
            } else {
                var name = `
                    <a href="/user/my.html?u=${uid}">
                        ${name}
                    </a>
                `;
            }

            if ( user ) {
                // 유저 상태 확인후 댓글 삭제 버튼 추가
                if ( user.uid == uid ) {           
                    var menu = `
                        <div class="edit_menu">
                            <i class="ri-pencil-fill edit edit_reply"></i>
                            <i class="ri-close-fill delete delete_reply"></i>
                        </div>
                    `;
                } else {
                    var menu = "";
                }
            } else {
                var menu = "";
            }

            if ( reply_edit_date ) {
                var edit_indicator = ' (수정됨)';
            } else {
                var edit_indicator = '';
            }

            var li =
            `<li name="${videoId}" id="${key}">
                ${menu}
                <div class="reply_music">
                    <div>
                        <div class="img_wrap">
                            <img src="${thumbnail}" alt="${title} 썸네일">
                            <i class="ri-play-fill play active"></i>
                            <i class="ri-pause-fill pause"></i>
                        </div>
                        <div>
                            <p class="title">${title}</p>
                            <p class="artist">${artist}</p>
                        </div>
                    </div>
                    <div class="btns">
                        <i class="ri-play-list-add-fill listAddBtn"></i>
                        <i class="ri-heart-line likeBtn active"></i>
                        <i class="ri-heart-fill likeBtn"></i>
                        <i class="ri-share-forward-fill shareBtn"></i>
                    </div>
                </div>
                <div class="reply_comment">
                    <p class="comment">${comment}</p>
                    <div class="reply_author">
                        <div>
                            <span>${name}</span>
                        </div>
                        <div class="time">
                            <i class="ri-time-fill"></i>
                            <p>${getPastTime(reply_upload_date)}${edit_indicator}</p>
                        </div>
                    </div>
                </div>
            </li>`;

            if ( user ) {     
                // 내가 좋아요 표시했는지 확인
                var postId = $('#postId').val();
                database.ref('users/'+user.uid+'/likes/replies/'+postId).once('value').then(function(snapshot) {
                    if ( snapshot.val() == null ) {
                        return;
                    }
                    // console.log(Object.keys(snapshot.val()));
                    var postIds = Object.keys(snapshot.val());
                    for (let i = 0; i < postIds.length; i++) {
                        const target_id = postIds[i];
                        if ( target_id == key ) {
                            $('.replies #'+target_id+' .ri-heart-line').removeClass('active');
                            $('.replies #'+target_id+' .ri-heart-fill').addClass('active');
                            break;
                        }
                    }
                })
            }

            $('.replies ul').prepend(li);
            
        }

        $('.reply').show();
        
    });
})

// 댓글 입력을 위한 음악 검색
function addMusicList() {
    $('#search_result').show();
    $('#search_result li').not('li.noResult').remove();
    let musicKeyWord = $('#keyword').val();
    
    $.ajax({
        type: 'GET',
        url: 'http://ws.audioscrobbler.com/2.0/?method=track.search&track='+musicKeyWord+'&api_key=d5863450a3f919d547deb174efa27363&format=json',
        success: function (response) {
            let musicList = response["results"]["trackmatches"]["track"];
            
            if ( musicList.length == 0 ) {
                $('#search_result .noResult').show();
            } else {
                $('#search_result .noResult').hide();
            }
            
            for (let i = 0; i < musicList.length; i++) {
                // let albumImg = musicList[i]["image"][0]["#text"]
                let albumTitle = musicList[i]["name"]
                let albumArtist = musicList[i]["artist"]

                var li = `
                <li>
                <span class="search_artist">${albumArtist}</span> - <span class="search_title">${albumTitle}</span>
                </li>`;

                $('#search_result').append(li);
            }
        }
    })
}

// 유튜브에서 음악 불러오기
function searchMusic(artist, title) {
    $('.video_confirm').css('display', 'flex');
    var musicKeyWord = artist+' '+title;
    $.ajax({
        type: 'GET',
        url: 'https://www.googleapis.com/youtube/v3/search?part=snippet&q='+musicKeyWord+'&maxResults=1&key=AIzaSyBiK1IgvwZAJvK9PARfqAK7gAlbdlkaFXk',
        success: function(response) {
            let videos = response["items"];

            if ( videos.length == 0 ) {
                console.log('no video');
            }

            for (let i = 0; i < videos.length; i++) {
                let videoId = videos[i]["id"]["videoId"]
                let thumbnail = videos[i]["snippet"]["thumbnails"]["high"]["url"];

                var iframe = 
                `<iframe src="https://www.youtube.com/embed/${videoId}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;

                $('.embed_youtube').html(iframe);
                $('#videoId').val(videoId);
                $('#thumbnail').val(thumbnail);
            }
        }
    })
}

// 댓글 글자 수 체크
function commentLengthCheck(e) {
    var el_id = e.id;
    var length = e.value.length;
    // $('.comment_area p span').html(length);
    $('#'+el_id).siblings('p').children('span').html(length);
}

// 로그인된 유저만 댓글 추가 가능
$('#keyword').focus(function() {
    var user = auth.currentUser;
    if ( user ) {
        var uid = user.uid;
        database.ref('users/'+uid).once('value').then(function(snapshot) {
            var name = snapshot.val().name;
            $('#name').val(name);
        })    
    } else {
        alert('로그인 후에 음악을 남기실 수 있습니다.');
        $('#keyword').blur();
    }
})

$('#search_result').on('click', 'li', function() {
    var artist = $(this).children('.search_artist').html();
    var title = $(this).children('.search_title').html();
    searchMusic(artist, title);
    $('#artist').val(artist);
    $('#title').val(title);
    $('#search_result').hide();
    $('.search_bar').hide();
    $('.comment_area').show();
})
$('#close_search_result').click(function() {
    $('#search_result').hide();
    $('#keyword').val("");
})

$('.video_confirm').on('click', '.cancelBtn', function() {
    $('.video_confirm iframe').remove();
    $('#artist').val("");
    $('#title').val("");
    $('#videoId').val("");
    $('#thumbnail').val("");
    $('.video_confirm').hide();
    $('.search_bar').show();
})

// 게시글 좋아요
$('.post .ri-heart-line').click(function() {
    $('.post .ri-heart-line').removeClass('active');
    $('.post .ri-heart-fill').addClass('active');

    var postId = $('#postId').val();
    database.ref('board/'+id+'/posts/'+postId).update({
        likes: firebase.database.ServerValue.increment(1)
    })
    var user = auth.currentUser;
    var uid = user.uid;
    database.ref('users/'+uid+'/likes/posts').update({
        [postId]: true
    })

    var likes = $('#post_likes').html();
    var likes = Number(likes) + 1;
    $('#post_likes').html(likes);
})
$('.post .ri-heart-fill').click(function() {
    $('.post .ri-heart-line').addClass('active');
    $('.post .ri-heart-fill').removeClass('active');

    var postId = $('#postId').val();
    database.ref('board/'+id+'/posts/'+postId).update({
        likes: firebase.database.ServerValue.increment(-1)
    })
    var user = auth.currentUser;
    var uid = user.uid;
    database.ref('users/'+uid+'/likes/posts/'+postId).remove();

    var likes = $('#post_likes').html();
    var likes = Number(likes) - 1;
    $('#post_likes').html(likes);
})

// 댓글 등록
$('#submit_reply').click(function(e) {
    e.preventDefault();

    var user = auth.currentUser;
    var uid = user.uid;

    var postId = $('#postId').val();
    var artist = $('#artist').val();
    var title = $('#title').val();
    var videoId = $('#videoId').val();
    var thumbnail = $('#thumbnail').val();
    var comment = $('#my_comment').val();
    var upload_date = Date.now();
    var name = $('#name').val();
    
    if ( $('input:checkbox[id="anonymity"]').is(":checked") ) {
        var anonymity = true;
    } else {
        var anonymity = false;
    }

    if ( postId == "" ) {
        return alert('등록 과정에서 오류가 발생했습니다.');
    }
    if ( videoId == "" ) {
        return alert('등록 과정에서 오류가 발생했습니다.');
    }
    if ( title == "" ) {
        $('#title').focus();
        return alert('제목을 입력해주세요.')
    }
    if ( artist == "" ) {
        $('#artist').focus();
        return alert('아티스트 정보를 입력해주세요.')
    }

    database.ref('board/'+id+'/posts/'+postId+'/reply').push().set({
        artist: artist,
        title: title,
        videoId: videoId,
        thumbnail: thumbnail,
        comment: comment,
        uid: uid,
        name: name,
        anonymity: anonymity,
        likes: 0,
        reports: 0,
        upload_date: upload_date,
        edit_date: false
    })
    .then(function() {
        database.ref('board/'+id+'/posts/'+postId).once('value').then(function(snapshot) {
            var author = snapshot.val().uid;
            database.ref('users/'+author+'/notifications').push().set({
                title: '새로운 댓글이 있습니다.',
                description: $('.post_info h3').html(),
                targetURL: window.location.pathname + window.location.search,
                checked: false,
                type: 'newReply',
                date: Date.now()
            })
            .then(function() {
                window.location.reload();
            })
        })
    })
})



// 음악 재생
$('.replies').on('click', '.play', function() {
    $('.replies li').removeClass('nowPlaying');
    $(this).closest('li').addClass('nowPlaying');

    const curr_videoUrl = new URL(player.getVideoUrl());
    const urlParams = curr_videoUrl.searchParams;
    var curr_videoId = urlParams.get('v');
    var videoId = $(this).closest('li').attr('name');
    var title = $(this).closest('li').find('.title').html();
    var artist = $(this).closest('li').find('.artist').html();

    if ( curr_videoId == videoId) {
        player.playVideo();
    } else {
        player.loadVideoById(videoId, 0, "large");
        $('.player_bar .title').html(title);
        $('.player_bar .artist').html(artist);
    }

})
$('.replies').on('click', '.pause', function() {
    player.pauseVideo();
})



// 플레이리스트에 추가
$('.replies').on('click', '.listAddBtn', function() {
    var user = auth.currentUser;
    if ( !user ) {
        alert('로그인 후 사용하실 수 있습니다.')
        return;
    }

    var videoId = $(this).closest('li').attr('name');
    var title = $(this).closest('li').find('.title').html();
    var artist = $(this).closest('li').find('.artist').html();
    var thumbnail = $(this).closest('li').find('img').attr('src');
    $('#targetVideoId').val(videoId);
    $('#targetTitle').val(title);
    $('#targetArtist').val(artist);
    $('#targetThumbnail').val(thumbnail);

    $('.addToPlaylistModal .playlists').html("");

    database.ref('users/'+user.uid+'/playlists').once('value').then(function(snapshot) {
        if ( snapshot.val() == null ) {
            var div = `
                <div class="noPlaylist">
                    <p>플레이리스트가 없습니다. <a href="/user/my.html">내 페이지</a>에서 새로운 플레이리스트를 만드세요.</p>
                </div>
            `
            $('.addToPlaylistModal .playlists').append(div);
        }
        
        snapshot.forEach(childSnapshot => {
            var playlistId = childSnapshot.key;
            var playlistName = childSnapshot.val().info.name;
            var playlistSecret = childSnapshot.val().info.secret;
            var icon = "";
            if ( playlistSecret ) {
                var icon = `<i class="ri-lock-fill"></i>`;
            }
            var playlist = `
                <div>
                    <input type="checkbox" id="${playlistId}" onchange="applyPlaylist(this)">
                    <label for="${playlistId}">${playlistName}</label>
                    ${icon}
                </div>
            `;

            $('.addToPlaylistModal .playlists').append(playlist);

            database.ref('users/'+user.uid+'/playlists/'+playlistId+'/musics/').orderByChild('videoId').equalTo(videoId).once('value').then(function(snapshot) {
                var len = Object.keys(snapshot.val()).length;
                if ( len ) {
                    $('#'+playlistId).prop("checked", true); 
                }
            });

        });

        $('.addToPlaylistModal').fadeIn(100);
    })
});

// 플레이리스트에 반영
function applyPlaylist(e) {
    var postId = $('#postId').val();
    var playlistId = e.id;
    var videoId = $('#targetVideoId').val();
    var title = $('#targetTitle').val();
    var artist = $('#targetArtist').val();
    var thumbnail = $('#targetThumbnail').val();

    var user = auth.currentUser;

    if ( e.checked ) {
        database.ref('users/'+user.uid+'/playlists/'+playlistId+'/musics').push().set({
            videoId: videoId,
            title: title,
            artist: artist,
            thumbnail: thumbnail,
            from: postId
        })
    } else {
        database.ref('users/'+user.uid+'/playlists/'+playlistId+'/musics/').orderByChild('videoId').equalTo(videoId).once('value').then(function(snapshot) {
            snapshot.forEach(childSnapshot => {
                var musicId = childSnapshot.key;
                database.ref('users/'+user.uid+'/playlists/'+playlistId+'/musics/'+musicId).remove();
            });
        });
    }
}


// 댓글 좋아요
$('.replies').on('click', '.ri-heart-line', function() {
    var user = auth.currentUser;
    if ( !user ) {
        alert('로그인 후 이용하실 수 있습니다.');
        return;
    }
    $(this).closest('li').find('.ri-heart-line').removeClass('active');
    $(this).closest('li').find('.ri-heart-fill').addClass('active');
    
    var postId = $('#postId').val();
    var replyId = $(this).closest('li').attr('id');
    database.ref('board/'+id+'/posts/'+postId+'/reply/'+replyId).update({
        likes: firebase.database.ServerValue.increment(1)
    })
    var user = auth.currentUser;
    var uid = user.uid;
    database.ref('users/'+uid+'/likes/replies/'+postId).update({
        [replyId]: true
    })
})
$('.replies').on('click', '.ri-heart-fill', function() {
    $(this).closest('li').find('.ri-heart-line').addClass('active');
    $(this).closest('li').find('.ri-heart-fill').removeClass('active');
    
    var postId = $('#postId').val();
    var replyId = $(this).closest('li').attr('id');
    database.ref('board/'+id+'/posts/'+postId+'/reply/'+replyId).update({
        likes: firebase.database.ServerValue.increment(-1)
    })
    var user = auth.currentUser;
    var uid = user.uid;
    database.ref('users/'+uid+'/likes/replies/'+postId+'/'+replyId).remove();
})


// 음악 공유
$('.replies').on('click', '.shareBtn', function() {
    var videoId = $(this).closest('li').attr('name');
    var link = 'https://youtu.be/'+videoId;
    
    if (navigator.share) {
        var title = $(this).closest('.title').html();

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



// 포스트 삭제
$(document).on('click', '.delete_post', function() {
    var result = confirm('삭제한 게시글과 댓글은 다시 복구할 수 없습니다. 게시글을 삭제하시겠습니까?');
    if(result) {
        var postId = $('#postId').val();
        database.ref('board/'+id+'/posts/'+postId).update({
            state: 'deleted'
        })
        .then(function() {
            window.history.back();
        });
    }
})

// 포스트 수정
$(document).on('click', '.edit_post', function() {
    var user = auth.currentUser;
    var postId = $('#postId').val();
    location.href = `/board/write.html?id=${id}&for=edit&p=${postId}`;
})

// 댓글 삭제
$(document).on('click', '.delete_reply', function() {
    var result = confirm('삭제한 댓글은 다시 복구할 수 없습니다. 댓글을 삭제하시겠습니까?');
    if(result) {
        var postId = $('#postId').val();
        var replyId = $(this).closest('li').attr('id');
        database.ref('board/'+id+'/posts/'+postId+'/reply/'+replyId).remove()
        .then(function() {
            window.location.reload();
        });
    }
})

// 댓글 수정
$(document).on('click', '.edit_reply', function() {
    var postId = $('#postId').val();
    var replyId = $(this).closest('li').attr('id');
    $('#edit_replyId').val(replyId);
    console.log(postId, replyId, id);
    database.ref('board/'+id+'/posts/'+postId+'/reply/'+replyId).once('value').then(function(snapshot) {
        var title = snapshot.val().title;
        var artist = snapshot.val().artist;
        var anonymity = snapshot.val().anonymity;
        var comment = snapshot.val().comment;

        $('#edit_title').val(title);
        $('#edit_artist').val(artist);
        $('#edit_my_comment').val(comment);
        if ( anonymity ) {
            $("input:checkbox[id='edit_anonymity']").prop("checked", true);
        } else {
            $("input:checkbox[id='edit_anonymity']").prop("checked", false);
        }
    })
    .then(function(){
        $('.editReplyModal').fadeIn(100);
    })
})
$('#edit_reply').click(function() {
    var postId = $('#postId').val();
    var replyId = $('#edit_replyId').val();
    
    var title = $('#edit_title').val();
    var artist = $('#edit_artist').val();
    var comment = $('#edit_my_comment').val();
    var edit_date = Date.now();
    if ( $('input:checkbox[id="edit_anonymity"]').is(":checked") ) {
        var anonymity = true;
    } else {
        var anonymity = false;
    }
    
    if ( title == "" ) {
        $('#title').focus();
        return alert('제목을 입력해주세요.')
    }
    if ( artist == "" ) {
        $('#artist').focus();
        return alert('아티스트 정보를 입력해주세요.')
    }

    database.ref('board/'+id+'/posts/'+postId+'/reply/'+replyId).update({
        title: title,
        artist: artist,
        comment: comment,
        anonymity: anonymity,
        edit_date: edit_date
    })
    .then(function() {
        window.location.reload();
    })

})



// 플레이어
function setPause() {
    $('.replies .pause').removeClass('active');
    $('.replies .pause').siblings('img').removeClass('active');
    $('.replies .pause').siblings('.play').addClass('active');

    $('.player_bar .pauseBtn').removeClass('active');
    $('.player_bar .pauseBtn').siblings('.playBtn').addClass('active');
}
function setPlay() {
    $('.replies .nowPlaying .play').removeClass('active');
    $('.replies .nowPlaying .play').siblings('img').addClass('active');
    $('.replies .nowPlaying .play').siblings('.pause').addClass('active');

    $('.player_bar .playBtn').removeClass('active');
    $('.player_bar .playBtn').siblings('.pauseBtn').addClass('active');
}

// 유튜브 iframe 컨트롤
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var player ;
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
    height: '281',
    width: '500',
    // videoId: 'M7lc1UVf-VE',
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
        setPause();
        player.clearVideo();
    } else if ( event.data == YT.PlayerState.PAUSED ) {
        setPause();
    } else if ( event.data == YT.PlayerState.PLAYING ) {
        setPlay();
    }
}

// 플레이어 바
// 유튜브 플레이어 컨트롤
$(document).on('click', '.player_bar .playBtn', function() {
    if ( player.getVideoUrl() == 'https://www.youtube.com/watch' ) {
        return
    }
    player.playVideo();
    $(this).removeClass('active');
    $(this).siblings('.pauseBtn').addClass('active');
})
$(document).on('click', '.player_bar .pauseBtn', function() {
    player.pauseVideo()
    $(this).removeClass('active');
    $(this).siblings('.playBtn').addClass('active');
})

// 플레이어 progress bar
function markProgressBar() {
    var progress = player.getCurrentTime() / player.getDuration() * 100;
    $('.player_bar_progress_wrap .progress').css('width', progress + '%');
}
setInterval(markProgressBar, 100);

// 시간 정보 표시
function markTimeInfo() {
    var currTime = player.getCurrentTime();
    var totTime = player.getDuration();
    
    $('.player_bar .timeInfo .currTime').html(secondsToHMS(currTime, totTime));
    $('.player_bar .timeInfo .totTime').html(secondsToHMS(totTime, totTime));
}
setInterval(markTimeInfo, 100);

$('.player_bar_progress_wrap').click(function (e) {
    var pageWidth = $(document).width();
    var time = player.getDuration() / pageWidth * e.pageX;
    player.seekTo(time, true);
})
$('.player_bar_progress_wrap').mousemove(function(e){
    $('.timeMarker').css("left", e.pageX);

    var pageWidth = $(document).width();
    var time = player.getDuration() / pageWidth * e.pageX;
    var time = secondsToHMS(time, player.getDuration());
    $(this).find('.timeMarker span').html(time);
    });
$('.player_bar_progress_wrap').hover(
    function() {
        $('.timeMarker').addClass('active');
    }, function() {
        $('.timeMarker').removeClass('active');    
    }
);
    
// 유튜브 플레이어 토글
$(document).on('click', '.video_toggleBtn', function() {
    $('#player').toggle();
    $(this).toggleClass('active');
})