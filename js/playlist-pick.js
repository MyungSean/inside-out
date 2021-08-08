// 준비중 점 추가 - 삭제 예정
function addDots() {
    var length = $('.notice_area .ready span').html().length;
    if ( length == 3 ) {
        $('.notice_area .ready span').html("");
    } else {
        $('.notice_area .ready span').append('.');
    }
}
 
setInterval(function() {
    addDots();
}, 1000);