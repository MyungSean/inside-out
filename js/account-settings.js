// 유저 상태 확인
auth.onAuthStateChanged(user => {
    if (user) {
    } else {
        window.location.href = "/";
    }
})

// 계정 삭제
$('#closeAccountBtn').click(function() {
    $('.closeAccountModal').fadeIn(100);
})
$('.closeAccountModal .submitBtn').click(function() {
    $('.closeAccountModal .loader').addClass('active');

    const user = firebase.auth().currentUser;

    database.ref('users/'+user.uid).remove().then(function() {

        user.delete().then(() => {
            alert('성공적으로 계정이 삭제됐습니다.');
        }).catch((error) => {
            console.log(error.message);
            alert('계정 삭제 과정에서 오류가 발생했습니다. 잠시 후에 다시 시도해주세요.');
        });
            
    })
})
