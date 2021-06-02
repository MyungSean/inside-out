// 게시물 업로드
function write() {
    var password = $('#password').val();
    var name = $('#name').val();
    var subject = $('#subject').val();
    var content = $('#content').val();
    var upload_date = Date.now();

    console.log(0);
    database.ref('board/music/posts').orderByChild('number').limitToLast(1).once('value').then(function(snapshot){
        // 게시물 넘버 설정
        if ( snapshot.val() == null ) {
            var curr_number = 1
        } else {
            var first = Object.keys(snapshot.val())[0];        
            var number = snapshot.val()[first].number;
            var curr_number = number + 1;
        }
        
            // 게시물 업로드
            database.ref('board/music/posts').push().set({
                name: name,
                password: password,
                number: curr_number,
                subject: subject,
                content: content,
                views: 0,
                reports: 0,
                recommendations: 0,
                upload_date: upload_date,
                reply: false
            })
    })
}

$('#submit_post').click( function(e){
    e.preventDefault();
    
    write();
});