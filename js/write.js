// URL 파라미터에서 정보 확인하기
const url = new URL(window.location.href);
const urlParams = url.searchParams;
id = urlParams.get('id');

boardIdCheck(id);

// 유저 상태 확인
auth.onAuthStateChanged(user => {
    if (user) {
        var uid = user.uid;
        $('#uid').val(uid);
        database.ref('users/'+uid).once('value').then(function(snapshot) {
            var name = snapshot.val().name;
            $('#name').val(name);
        })
    } else {
        console.log('user logged out');
    }
})

// 게시판 제목 표시
database.ref('board/'+id+'/info').once('value').then(function(snapshot) {
    var board_name = snapshot.val().name;
    $('.board_info h2').html(board_name);
})

// 게시물 업로드
function write() {
    var result = confirm('글을 등록하시겠습니까?');
    console.log(result);
    if ( !result ) {
        return
    }

    var subject = $('#subject').val();
    var content = $('#content').val();
    var upload_date = Date.now();

    if ( $('input:checkbox[id="anonymity"]').is(":checked") ) {
        var name = '익명';
    } else {
        var name = $('#name').val();
    }
    
    var uid = $('#uid').val();
    
    database.ref('board/'+id+'/posts').orderByChild('number').limitToLast(1).once('value').then(function(snapshot){
        // 게시물 넘버 설정
        if ( snapshot.val() == null ) {
            var curr_number = 1
        } else {
            var first = Object.keys(snapshot.val())[0];        
            var number = snapshot.val()[first].number;
            var curr_number = number + 1;
        }
        
        // 게시물 업로드
        database.ref('board/'+id+'/posts').push().set({
            name: name,
            uid: uid,
            number: curr_number,
            subject: subject,
            content: content,
            views: 0,
            reports: 0,
            likes: 0,
            upload_date: upload_date,
            reply: false
        })
        .then(function() {
            window.location.href = "/board/list.html?id="+id;
        })
    })
}

// textarea 자동 높이 조절
$("#content").on('keydown keyup', function () {
    $(this).height(1).height( $(this).prop('scrollHeight')+12 );
});


$('#submit_post').click( function(e){
    e.preventDefault();
    write();
});

// 목록으로 이동
$('.backToListBtn').click(function() {
    window.location.href = "/board/list.html?id="+id;
})