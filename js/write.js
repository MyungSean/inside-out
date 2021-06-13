// URL 파라미터에서 정보 확인하기
const url = new URL(window.location.href);
const urlParams = url.searchParams;
id = urlParams.get('id');
role = urlParams.get('for');
postId = urlParams.get('p');

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
        alert('로그인 후 글을 작성하실 수 있습니다.');
        window.location.href = "/board/list.html?id="+id;
    }
})

// 게시판 제목 표시
database.ref('board/'+id+'/info').once('value').then(function(snapshot) {
    var board_name = snapshot.val().name;
    $('.board_info h2').html(board_name);
})

// 제목, 본문 검사
function checkTitleContent() {
    var subject = $('#subject').val();
    var content = $('#content').val();

    if ( subject == "" ) {
        alert('제목을 입력해주세요.');
        $('#subject').focus();
        return false;
    }
    if ( content == "" ) {
        alert('내용을 입력해주세요.');
        $('#content').focus();
        return false;
    }
    return true;
}

// 게시물 수정
function edit() {
    if ( !checkTitleContent() ) {
        return;
    }
    
    var result = confirm('글을 수정하시겠습니까?');
    if ( !result ) {
        return
    }
    
    var subject = $('#subject').val();
    var content = $('#content').val();
    var edit_date = Date.now();
    var name = $('#name').val();
    
    if ( $('input:checkbox[id="anonymity"]').is(":checked") ) {
        var anonymity = true;
    } else {
        var anonymity = false;
    }
        
    // 게시물 수정
    database.ref('board/'+id+'/posts/'+postId).update({
        name: name,
        anonymity: anonymity,
        subject: subject,
        content: content,
        edit_date: edit_date,
    })
    .then(function() {
        window.location.href = "/board/list.html?id="+id;
    })
}

// 게시물 업로드
function write() {
    if ( !checkTitleContent() ) {
        return;
    }

    var subject = $('#subject').val();
    var content = $('#content').val();

    var result = confirm('글을 등록하시겠습니까?');
    if ( !result ) {
        return
    }

    var upload_date = Date.now();
    var name = $('#name').val();
    
    if ( $('input:checkbox[id="anonymity"]').is(":checked") ) {
        var anonymity = true;
    } else {
        var anonymity = false;
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
            anonymity: anonymity,
            number: curr_number,
            subject: subject,
            content: content,
            views: 0,
            reports: 0,
            likes: 0,
            upload_date: upload_date,
            edit_date: false,
            state: 'active',
            reply: false
        })
        .then(function() {
            window.location.href = "/board/list.html?id="+id;
        })
    })
}

if ( role == "edit" ) {
    $('#edit_post').show();
    $('#submit_post').hide();
    database.ref('board/'+id+'/posts/'+postId).once('value').then(function(snapshot) {
        console.log(snapshot.val());
        if ( !snapshot.val() ) {
            alert('잘못된 경로입니다.');
            window.history.back(-1);
        }
        var user = auth.currentUser;
        var author = snapshot.val().uid;
        if ( user.uid !== author ) {
            alert('잘못된 경로입니다.');
            window.history.back(-1);
        }

        var subject = snapshot.val().subject;
        var content = snapshot.val().content;
        var anonymity = snapshot.val().anonymity;

        $('#subject').val(subject);
        $('#content').val(content);
        if ( anonymity ) {
            $("input:checkbox[id='anonymity']").prop("checked", true);
        }
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
$('#edit_post').click( function(e){
    e.preventDefault();
    edit();
});

// 목록으로 이동
$('.backToListBtn').click(function() {
    window.location.href = "/board/list.html?id="+id;
})