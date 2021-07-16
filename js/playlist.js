// URL 파라미터에서 정보 확인하기
const url = new URL(window.location.href);
const urlParams = url.searchParams;
list = urlParams.get('list');
console.log(list);

database.ref('users').orderByChild('').once('value').then(function(snapshot) {
    console.log(snapshot.val());
})

// 유저 상태 확인
auth.onAuthStateChanged(user => {
    if (user) {
    } else {
    }
})