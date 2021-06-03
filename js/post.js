// URL 파라미터에서 정보 확인하기
const url = new URL(window.location.href);
const urlParams = url.searchParams;
id = urlParams.get('id');
no = urlParams.get('no');

database.ref('board/'+id+'/posts').orderByChild('number').equalTo(Number(no)).once('value').then(function(snapshot){
    // 존재하지 않는 게시물일 경우
    if ( snapshot.val() == null ) {
        $('.noPost').show();
        return
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
        var subject = childSnapshot.val().subject;
        var upload_date = childSnapshot.val().upload_date;
        var content = childSnapshot.val().content;
        var number = childSnapshot.val().number;
        var likes = childSnapshot.val().likes;
        var views = childSnapshot.val().views;
        
        $('#postId').val(postId);
        $('.post_info h3').html(subject);
        $('.author').html(name);
        $('.views').html(views);
        $('.upload_date').html(getPastTime(upload_date));
        $('.content').html(content);

        // 유저 상태 확인후 포스트 삭제 버튼 추가
        var user = auth.currentUser;
        if ( user ) {
            if ( user.uid == uid ) {
                $('.post').append('<i class="ri-close-fill delete delete_post"></i>');
            }            
        }

        
        
        // 댓글 불러오기
        var replies = childSnapshot.val().reply;
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
            var likes = reply.likes;
            var reports = reply.reports;
            var reply_upload_date = reply.upload_date;
            // console.log(artist, title, videoId, thumbnail, comment, uid, anonymity, likes, reports, reply_upload_date);

            // 유저 상태 확인후 댓글 삭제 버튼 추가
            if ( user ) {
                if ( user.uid == uid ) {
                    var deleteBtn = `<i class="ri-close-fill delete delete_reply"></i>`;                
                } else {
                    var deleteBtn = "";
                }
            } else {
                var deleteBtn = "";
            }

            var li =
            `<li name="${videoId}" id="${key}">
                ${deleteBtn}
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
                        <i class="ri-play-list-add-fill"></i>
                        <i class="ri-heart-line likeBtn active"></i>
                        <i class="ri-heart-fill likeBtn"></i>
                        <i class="ri-share-forward-fill"></i>
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
                            <p>${getPastTime(reply_upload_date)}</p>
                        </div>
                    </div>
                </div>
            </li>`;

            $('.replies ul').prepend(li);
            
        }
        
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
function commentLengthCheck() {
    var length = $('#my_comment').val().length;
    $('.comment_area p span').html(length);
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
    $('.comment_area').hide();
})

// 댓글 등록
$('#submit_reply').click(function(e) {
    e.preventDefault();

    var user = auth.currentUser;
    if ( user ) {
        var uid = user.uid;
    }

    var postId = $('#postId').val();
    var artist = $('#artist').val();
    var title = $('#title').val();
    var videoId = $('#videoId').val();
    var thumbnail = $('#thumbnail').val();
    var comment = $('#my_comment').val();
    var upload_date = Date.now();
    var uid = uid;
    
    if ( $('input:checkbox[id="anonymity"]').is(":checked") ) {
        var name = '익명';
    } else {
        var name = $('#name').val();
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
        likes: 0,
        reports: 0,
        upload_date: upload_date
    })
    .then(function() {
        window.location.reload();
    })
})



// 음악 재생
$('.replies').on('click', '.play', function() {
    $('.replies .pause').removeClass('active');
    $('.replies img').removeClass('active');
    $('.replies .play').addClass('active');
    $(this).removeClass('active');
    $(this).siblings('.pause').addClass('active');
    $(this).siblings('img').addClass('active');

    const curr_videoUrl = new URL(player.getVideoUrl());
    const urlParams = curr_videoUrl.searchParams;
    var curr_videoId = urlParams.get('v');
    var videoId = $(this).closest('li').attr('name');

    if ( curr_videoId == videoId) {
        player.playVideo();
    } else {
        player.loadVideoById(videoId, 0, "large");
    }

})
$('.replies').on('click', '.pause', function() {
    $(this).removeClass('active');
    $(this).siblings('img').removeClass('active');
    $(this).siblings('.play').addClass('active');

    player.pauseVideo();
})


// 포스트 삭제
$(document).on('click', '.delete_post', function() {
    var result = confirm('삭제한 게시글과 댓글은 다시 복구할 수 없습니다. 게시글을 삭제하시겠습니까?');
    if(result) {
        var postId = $('#postId').val();
        database.ref('board/'+id+'/posts/'+postId).remove()
        .then(function() {
            window.history.back();
        });
    }
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