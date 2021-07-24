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
    $('.playlists .lists table').html('');
    database.ref('users/'+uid+'/playlists').once('value').then(function(snapshot) {
        console.log(snapshot.val());
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
                var secretIcon = `<i class="ri-lock-fill"></i>`;
            } else {
                var secretIcon = "";
            }
            
            var ul = "";

            const musics = childSnapshot.musics;
            if ( musics !== undefined ) {
                const music_ids = Object.keys(musics);
                for (var i = 0; i < music_ids.length; i++) {

                    if ( i == 3 ) { // 미리보기 곡 최대 3개까지 표시
                        var li = `
                        <li>
                            <div class="img_wrap moreTracks">
                                <p>${music_ids.length - i}</p>
                            </div>
                            <div class="music_info">
                                <p class="artist">외 ${music_ids.length - i}곡</p>
                            </div>
                        </li>
                        `;
                        
                        ul += li;

                        break;
                    }

                    var title = musics[music_ids[i]].title;
                    var artist = musics[music_ids[i]].artist;
                    var videoId = musics[music_ids[i]].videoId;
                    var from = musics[music_ids[i]].from;
                    var thumbnail = musics[music_ids[i]].thumbnail;
    
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

            // 플레이리스트 제작자에게만 수정(드롭다운) 메뉴 표시
            if ( user && user.uid == uid ) {
                var menu = `
                <td class="menu">
                    <i class="ri-more-fill dropdownBtn"></i>
                    <ul class="dropdown">
                        <li class="deletePlaylist">
                            <i class="ri-delete-bin-7-fill"></i>
                            <span>플레이리스트 삭제</span>
                        </li>
                    </ul>
                </td>`;
            } else {
                var menu = "";
            }

            var playlist = `
            <tr class="playlist" id="${key}">
                <td class="tracks">
                    <ul>
                        ${ul}
                    </ul>
                </td>
                <td class="title">
                    <a href="/user/playlist.html?list=${key}">
                        <p class="listTitle">${name}</p>
                    </a>
                    ${secretIcon}
                </td>
                ${menu}
            </tr>
            `;

            $('.playlists .lists table').append(playlist);
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
$(document).on('mouseenter','.playlist .tracks', function () {
    $(this).addClass('on');
    $(this).find('li').addClass('on');
}).on('mouseleave','.playlist .tracks',  function(){
    $(this).removeClass('on');
    $(this).find('li').removeClass('on');
});
// 플레이리스트 트랙 호버 액션
$(document).on('mouseenter','.playlist .tracks li', function () {
    $(this).find('.music_info').addClass('on');
}).on('mouseleave','.playlist .tracks li',  function(){
    $(this).find('.music_info').removeClass('on');
});

// 플레이리스트 드롭다운 메뉴 열기
$(document).on('click', '.playlist .menu .dropdownBtn', function(e) {
    e.stopPropagation();
    $('.dropdown').not($(this).siblings('.dropdown')).fadeOut(50);
    $(this).siblings('.dropdown').fadeToggle(50);
})
$(document).on('click', function() {
    $('.dropdown').fadeOut(50);
})


// 플레이리스트 삭제
$(document).on('click', '.playlist .menu .deletePlaylist', function(e) {
    e.stopPropagation();

    var title = $(this).closest('tr').find('.listTitle').html();
    
    var r = confirm('삭제한 플레이리스트는 복구할 수 없습니다. "'+title+'" 플레이리스트를 삭제하시겠습니까?');

    if ( r ) {
        var user = auth.currentUser;
        var playlistId = $(this).closest('tr').attr('id');
        database.ref('users/'+user.uid+'/playlists/'+playlistId).remove()
        .then(function(){
            window.location.reload();
        });
    }
})

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

        var key =  database.ref().push().getKey(); 
        var upload_date = Date.now();
        database.ref('users/'+user.uid+'/playlists/'+key).update({
            info: {
                key: key,
                name: newName,
                upload_date: upload_date,
                edit_date: false,
                state: 'active',
                views: 0,
                likes: 0,
                reply: "",
                secret: secret
            }
        })

        $('#newPlaylistName').val("");
        $('.addPlaylistModal').hide();
        location.reload();
    })
})


// 유저 메뉴
$('.settingBtn').click(function() {
    window.location.href = "/user/settings/account-settings.html";
})

// 프로필 수정
// 프로필 사진 업데이트
function updateProfileImg(file) {
    const user = auth.currentUser;

    const name = 'profile_image';
    const task = storage.ref('users/'+uid+'/profile_image').child(name).put(file);

    task
    .then(snapshot => snapshot.ref.getDownloadURL())
    .then(url => {
        user.updateProfile({
            photoURL: url
        }).catch((error) => {
            console.log(error);
        });  

        database.ref('users/'+uid).update({
            photoURL: url
        })
        .then(() => {
            // console.log('image updated');
            $('#profileImgUpdated').val(true).trigger('change');;
        })
    })
}

// 첨부파일 형식, 용량 체크
function checkImg(input) {
    // console.log(input.files[0]);

    if (input.files && input.files[0].size > (10 * 1024 * 1024)) {
        alert("10mb가 넘는 사진은 등록할 수 없습니다.");
        input.value = null;
        
        return false;
    }
    
    let validExtensions = ["image/jpg", "image/jpeg", "image/png"];
    if (input.files && !validExtensions.includes( input.files[0].type ) ) {
        alert("jpg, jpeg, png 파일만 등록할 수 있습니다.");
        input.value = null;
        
        return false;
    }

    return true;
}

// 새로운 프로필 이미지 미리보기
function readURL(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function(e) {
            $('.editProfileImg .imgPreview img').attr('src', e.target.result);
        }
        reader.readAsDataURL(input.files[0]);

        $('.drag_area').removeClass('active');
        $('.imgPreview').addClass('active');        
    }
}
$("#newProfileImg").change(function() {
    if ( checkImg(this) ) {
        readURL(this);
    }
});

// 유저 이름 업데이트
function updateName() {
    var name = $('#newUserName').val();
    
    const user = firebase.auth().currentUser;
    user.updateProfile({
        displayName: name,
        photoURL: "https://example.com/jane-q-user/profile.jpg"
    }).then(() => {
    }).catch((error) => {
        console.log(error);
    });  

    database.ref('users/'+uid).update({
        name: name
    })
    .then(() => {
        // console.log('name updated');
        $('#nameUpdated').val(true).trigger('change');;
    })
}

// 드래그 앤 드롭으로 이미지 첨부
var uploadFile = [];

$('.drag_area').on("dragenter", function(e) { //드래그 요소가 들어왔을떄
        $(this).addClass('drag_over');
        // console.log('drag enter');
    })
    .on("dragleave", function(e) { //드래그 요소가 나갔을때
        $(this).removeClass('drag_over');
        // console.log('drag leave');
    })
    .on("dragover", function(e) {
        e.stopPropagation();
        e.preventDefault();
        $(this).addClass('drag_over');
        // console.log('drag over');
    }).on('drop', function(e) { //드래그한 항목을 떨어뜨렸을때
        e.preventDefault();
        $(this).removeClass('drag_over');
        // console.log('drop');

        if ( checkImg(e.originalEvent.dataTransfer) ) {
            var file = e.originalEvent.dataTransfer.files[0];
            uploadFile[0] = file;

            readURL(e.originalEvent.dataTransfer);
        }
  
});
    

// 수정할 프로필 이미지 다시 선택
$('#resetImg').click(function() {
    $('#newProfileImg').val(null);
    uploadFile = [];

    $('.drag_area').addClass('active');
    $('.imgPreview').removeClass('active');
})

// 사용자 정보 수정 적용
$('.editUserInfoModal .submitBtn').click(function() {

    var name = $('#newUserName').val();
    if ( name.length < 2 || name.length > 50 ) {
        alert('이름을 2자 이상, 50자 이하로 입력해주세요.')
        return
    }

    $('.editUserInfoModal .loader').addClass('active');
    
    updateName();
    
    if ($('#newProfileImg')[0].files && $('#newProfileImg')[0].files[0]) {
        const file = $('#newProfileImg')[0].files[0];
        updateProfileImg(file);
    } else if ( uploadFile[0] ) {
        const file = uploadFile[0];
        updateProfileImg(file);
    } else {
        $('#profileImgUpdated').val(true).trigger('change');;
    }
})

// 유저 정보 수정 모달 열기
$('.user_info').on('click', '.editBtn', function() {
    $('#nameUpdated').val(false).trigger('change');;
    $('#profileImgUpdated').val(false).trigger('change');;

    const user = auth.currentUser;
    var name = user.displayName;
    $('#newUserName').val(name);

    $('.editUserInfoModal').fadeIn(100);    
});

// 업데이트 완료 여부 확인
$('.editUserInfoModal input[type="hidden"]').change(function () {
    var nameUpdated = $('#nameUpdated').val();
    var profileImgUpdated = $('#profileImgUpdated').val();
    
    // console.log('changed');
    // console.log(nameUpdated);
    // console.log(profileImgUpdated);

    if ( nameUpdated == 'true' && profileImgUpdated == 'true' ) {
        alert('성공적으로 수정되었습니다.');
        window.location.reload();
    }    
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