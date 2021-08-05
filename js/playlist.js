// URL 파라미터에서 정보 확인하기
const url = new URL(window.location.href);
const urlParams = url.searchParams;
listId = urlParams.get('list');

// 플레이리스트 불러오기
allTracks = [];
database.ref('users').orderByChild('/playlists/'+listId+'/info/key').equalTo(listId).once('value').then(function(snapshot) {

    if ( snapshot.val() == null ) {
        alert('존재하지 않는 플레이리스트입니다.');
        window.location.href = "/";
    }

    var user = auth.currentUser;
    uid = Object.keys(snapshot.val())[0];

    // 현재 유저가 플레이리스트 제작자일 때만 수정 메뉴 표시
    if ( !user || user.uid !== uid ) {
        $('.playlist_menu').remove();
    } else {
        $('.playlist_menu').show();
    }

    database.ref('users/'+uid+'/playlists/'+listId).once('value').then(function(playlistSnapshot) {

        // 플레이리스트 제작자에게만 비공개 플레이리스트 보이게 하기
        var info = playlistSnapshot.val().info;
        secret = info.secret;
        if ( secret ) {
            $('.toPublicBtn').show();
            
            if ( !user ) {
                alert('이 플레이리스트는 비공개 플레이리스트입니다.');
                window.location.href = "/";
            }
            if ( user.uid !== uid ) {
                alert('이 플레이리스트는 비공개 플레이리스트입니다.');
                window.location.href = "/";
            }
        } else {
            $('.toSecretBtn').show();
        }

        
        // 플레이리스트 정보 표시
        playlistName = info.name;
        $(document).attr("title", playlistName + " | inside out");
        $('.playlist_info .name').html(playlistName);

        database.ref('users/'+uid).once('value').then(function(snapshot) {
            playlistMaker = snapshot.val().name;
            $('.playlist_maker .maker').html(playlistMaker);

            makerProfileImg = snapshot.val().photoURL;
            if ( makerProfileImg == false ) {
                makerProfileImg = "/img/default_profile_img.jpg";
            }
            $('.playlist_maker .profile img').attr('src', makerProfileImg);
        })
        upload_date = info.upload_date;
        $('.playlist_info #upload_date').html( millisecondToDate(upload_date) );


        // 플레이리스트 트랙 표시
        var musics = playlistSnapshot.val().musics;

        if ( musics == undefined ) {
            $('.noTracks').addClass('active');
            return
        }

        
        // 본인이 만든 플레이리스트일 때만 수정 메뉴 표시
        var menu = `
        <div class="menu">
            <i class="ri-more-fill dropdownBtn"></i>
            <ul class="dropdown dsdw">
                <li class="deleteTrack"><i class="ri-delete-bin-7-fill"></i><sapn>플레이리스트에서 삭제</span></li>
            </ul>
        </div>
        `;
        if ( !user ) {
            var menu = "";
        } else {
            if ( user.uid !== uid ) {
                var menu = "";
            }
        }


        for (let i = 0; i < Object.keys(musics).length; i++) {
            var music = musics[Object.keys(musics)[i]]            

            var title = music.title;
            var artist = music.artist;
            var videoId = music.videoId;
            var thumbnail = music.thumbnail;

            var li = `
            <li class="track" id="${videoId}">
                <div class="order">
                    <p>${i+1}</p>
                </div>
                <div class="info">
                    <div class="img_wrap">
                        <img src="${thumbnail}">
                    </div>
                    <div>
                        <p class="title">${title}</p>
                        <p class="artist">${artist}</p>
                    </div>
                    </div>
                ${menu}
            </li>
            `;
    
            $('.tracks').append(li);

            allTracks.push({videoId: videoId, title: title, artist:artist});
        }
    })
})


function tracksNumbering() {
    for (let i = 0; i < allTracks.length; i++) {
        $('.tracks .order p').eq(i).html(i+1);        
    }    
}


// 음악 재생

// 전체 음악 재생
$('.playAllBtn').click(function() {
    playlist = allTracks;
    playMusic(playlist);
})

// 단일 곡 재생
$(document).on('click', '.tracks .info', function() {
    var videoId = $(this).closest('.track').attr('id');
    var title = $(this).closest('.track').find('.title').html();
    var artist = $(this).closest('.track').find('.artist').html();

    playlist = [{videoId: videoId, title: title, artist: artist}];
    playMusic(playlist);
})


// 플레이리스트 메뉴

// 플레이리스트 정보 수정
$('.editBtn').click(function() {
    var currName = $('.playlist_info .name').html();
    $('#newName').val(currName);
    $('.editPlaylistInfoModal .editName p span').html(currName.length);

    $('.editPlaylistInfoModal').fadeIn(100);
})
$('.editPlaylistInfoModal .submitBtn').click(function() {
    var newName = $('#newName').val();

    if ( newName.length < 2 ) {
        alert('플레이리스트의 이름을 한 글자 이상 입력해주세요.');
        return;
    }

    var user = auth.currentUser;
    database.ref('users/'+user.uid+'/playlists/'+listId+'/info').update({
        name: newName
    })
    .then(function() {
        $('.playlist_info .name').html(newName);
        $('.editPlaylistInfoModal').fadeOut(100);
    })
})

// 플레이리스트 공개, 비공개 설정
$('.toSecretBtn').click(function() {
    var user = auth.currentUser;
    database.ref('users/'+user.uid+'/playlists/'+listId+'/info').update({
        secret: true
    })
    .then(function() {
        $('.toSecretBtn').hide();
        $('.toPublicBtn').show();
        alert('플레이리스트를 비공개로 전환했습니다.');
    })
})
$('.toPublicBtn').click(function() {
    var user = auth.currentUser;
    database.ref('users/'+user.uid+'/playlists/'+listId+'/info').update({
        secret: false
    })
    .then(function() {
        $('.toSecretBtn').show();
        $('.toPublicBtn').hide();
        alert('플레이리스트를 공개로 전환했습니다.');
    })
})

// 플레이리스트 삭제
$('.deletePlaylistBtn').click(function() {
    var title = $('.playlist_info .name').html();
    
    var r = confirm('삭제한 플레이리스트는 복구할 수 없습니다. "'+title+'" 플레이리스트를 삭제하시겠습니까?');

    if ( r ) {
        var user = auth.currentUser;
        database.ref('users/'+user.uid+'/playlists/'+listId).remove()
        .then(function(){
            window.history.back();
        });
    }
})


// 트랙 메뉴

// 플레이리스트 드롭다운 메뉴 열기
$(document).on('click', '.tracks .dropdownBtn', function(e) {
    e.stopPropagation();
    $('.dropdown').not($(this).siblings('.dropdown')).fadeOut(50);
    $(this).siblings('.dropdown').fadeToggle(50);
})
$(document).on('click', function() {
    $('.dropdown').fadeOut(50);
})

// 곡을 플레이리스트에서 삭제
$(document).on('click', '.tracks .dropdown .deleteTrack', function(e) {
    e.stopPropagation();

    var user = auth.currentUser;
    var playlistId = listId;
    var videoId = $(this).closest('.track').attr('id');
    
    database.ref('users/'+user.uid+'/playlists/'+playlistId+'/musics').orderByChild('videoId').equalTo(videoId).once('value').then(function(snapshot) {
        var music_ids = Object.keys(snapshot.val());

        for (let i = 0; i < music_ids.length; i++) {
            const musicId = music_ids[i];
            database.ref('users/'+user.uid+'/playlists/'+playlistId+'/musics/'+musicId).remove()
            .then(function(){
                $('#'+videoId).remove();

                const itemToFind = allTracks.find(function(item) {return item.videoId === videoId});
                const itemIdx = allTracks.indexOf(itemToFind);
                if ( itemIdx > -1 ) {
                    allTracks.splice(itemIdx, 1);
                }

                tracksNumbering();
            });
        }
    })
})