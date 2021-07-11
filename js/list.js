// URL 파라미터에서 정보 확인하기
const url = new URL(window.location.href);
const urlParams = url.searchParams;
id = urlParams.get('id');
page = urlParams.get('page');

boardIdCheck(id);

if ( page == null ) {
    page = 1;
}

// 전체 게시글 정보 확인
database.ref('board/'+id+'/posts').once('value').then(function(snapshot) {
    var total_posts = Object.keys(snapshot.val()).length; // 전체 게시글 수
    var load_pages = 20; // 한 번에 로드하는 게시글 수
    loadPosts(total_posts, load_pages);
    createPageNav(total_posts, load_pages);
})

// 게시글 불러오기
function loadPosts(total_posts, load_pages) {
    var end = total_posts - ( page - 1 ) * load_pages;
    var start = end - load_pages + 1;
    if ( start < 0 ) {
        var start = 0;
    }
    database.ref('board/'+id+'/posts').orderByChild('number').startAt(start).endAt(end).once('value').then(function(snapshot) {
            snapshot.forEach(childSnapshot => {
                
            var number = childSnapshot.val().number;
            var subject = childSnapshot.val().subject;
            var name = childSnapshot.val().name;
            var uid = childSnapshot.val().uid;
            var anonymity = childSnapshot.val().anonymity;
            var reply = childSnapshot.val().reply;
            var reply_cnt = Object.keys(reply).length;
            var upload_date = childSnapshot.val().upload_date;
            var views = childSnapshot.val().views;
            var likes = childSnapshot.val().likes;

            // 삭제된 게시물 표시하지 않기
            var state = childSnapshot.val().state;
            if ( state == 'deleted') {
                var tr = `
                <tr>
                <td>${number}</td>
                <td class="deleted">삭제된 글입니다.</td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                </tr>
                `;
                $('.board table tbody').prepend(tr);
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
            }            if ( reply_cnt > 0 ) {
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
    
            $('.board table tbody').prepend(tr);
        });
    })    
}

function createPageNav(total_posts, load_pages) {
    var pages = Math.ceil( total_posts / load_pages );
    for (let i = 0; i < pages; i++) {
        var page_nav = `<span name="${i+1}">[${i+1}]</span>`
        $('.page_nav').append(page_nav);
    }

    $('.page_nav span').eq(page-1).css('font-weight', 'bold');
}

$('.page_nav').on('click', 'span', function() {
    var target_page = $(this).attr('name');
    var target_url = window.location.pathname + '?id='+id+'&page='+target_page;
    window.location = target_url;
})


// 게시판 정보 표시
database.ref('board/'+id+'/info').once('value').then(function(snapshot) {
    var name = snapshot.val().name;
    var description = snapshot.val().description;

    $('.board_info h2').html(name);
    $('.board_info p').html(description);
})


// 글쓰기
$('.writeBtn').click(function() {
    var user = auth.currentUser;
    if ( user ) {
        window.location = "/board/write.html?id="+id;
    } else {
        alert("로그인 후 글을 작성하실 수 있습니다.");
    }
})