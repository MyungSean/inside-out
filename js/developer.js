// 새소식 토글
$(document).on('click', '.news .news-heading', function() {
    $('.news-body').not($(this).siblings('.news-body')).slideUp(200);
    $(this).siblings('.news-body').slideToggle(200);
})



// 후원 모달 열기
$('.donationModalBtn').click(function() {
    $('.donationModal').fadeIn(100);
})



// 사용자 의견 불러오기
database.ref('board/user-comment/posts').on('child_added', function(snapshot) {
    var comment = snapshot.val().comment;
    var comment = comment.replaceAll('\n', '<br>');
    
    var name = snapshot.val().name;

    var li = `
            <li class="comment">
                <p class="name">${name}</p>
                <p>${comment}</p>
            </li>`;
    
    $('.comments').prepend(li);
})
// 사용자 의견 추가
$('#commentSubmitBtn').click(function(e) {
    e.preventDefault();

    var comment = $('#comment').val();
    var name = $('#name').val();

    if ( comment == "" ) {
        alert('코멘트를 입력해주세요.');
        return;
    }
    if ( name == "" ) {
        alert('이름을 입력해주세요.');
        return;
    }

    database.ref('board/user-comment/posts').push().set({
        comment: comment,
        name: name,
        upload_date: Date.now()
    })
    .then(function() {
        $('#comment').val("");
        $('#name').val("");
        
        $('.comments').animate({
            scrollTop: 0
        }, 1000);
    })
})



// 후원 모달
// 후원 계좌번호 클립보드에 복사
$('.donationModal .copyBtn').click(function() {
    var account = "명시연 3333-20-8723805"
    var $temp = $("<input>");
    $("body").append($temp);
    $temp.val(account).select();
    document.execCommand("copy");
    $temp.remove();

    $('.donationModal .copied').fadeIn(100, function() {
        setTimeout( function() {
            $('.donationModal .copied').fadeOut(100)
        }, 1000);
    });
})