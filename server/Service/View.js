//key-value
const viewedPostByIp = new Map();

export const checkIP = (ip_address, post_id) => {

    const currentTime = Date.now();
    const viewedPosts = viewedPostByIp.get(ip_address) || {};

    //일정 시간 내에 조회했는지 확인 + 조회했었는지
    if (!viewedPosts[post_id] || 
        currentTime - viewedPosts[post_id] > 3600000) {
            
            //조회 기록 업데이트
            viewedPosts[post_id] = currentTime; //{ "post1": 1623456789 }
            viewedPostByIp.set(ip_address,viewedPosts)
            //조회수 증가
            return true;
        }
    else{
        return false;
    }

}

/*
// Map 구조
viewedPostByIp = {
    "192.168.1.1": {  // ip_address
        "post1": 1623456789,  // post_id: timestamp
        "post2": 1623456790
    },
    "192.168.1.2": {
        "post3": 1623456791
    }
}
*/