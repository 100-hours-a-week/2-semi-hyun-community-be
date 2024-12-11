const fs = require('fs');
const path = require('path');
const rootDir = path.resolve(__dirname,'../'); //NOTE: 절대경로로 해석 -> 상위 디렉토리로 이동
const postsFilePath = path.join(rootDir,'data/json/posts.json'); //폴더 경로 변경으로 수정

//작성자 권한 확인
const checkAuthorization = async(post_id, user_id, comment_id=null, type = 'post') => {
    const posts = await getAllPosts();
    if(type === 'post'){
        const post = posts.find(post => post.post_id === post_id);
        if (!post) return false;
        return post.user_id === user_id;
    }
    else if(type === 'comment'){
        const post = posts.find(post => post.post_id === post_id);
        const comment = post.comments.find(comment => comment.comment_id === comment_id);
        if (!comment) return false;
        return comment.user_id === user_id;
    }
}

//게시글 저장
const savePosts = (posts) => {
    try {
        fs.writeFileSync(postsFilePath, JSON.stringify(posts, null, 2));
        return true;
    } catch (error) {
        console.error('Error writing posts:', error);
        throw new Error('Failed to save posts');
    }  
};

// 모든 게시글 조회
const getAllPosts = async() => {
    try {
        if (!fs.existsSync(postsFilePath)) {
            return [];  // 파일이 없으면 빈 배열 반환
        }
        const postsData = await fs.promises.readFile(postsFilePath, 'utf8');
        return JSON.parse(postsData);
    } catch (error) {
        console.error('Error reading posts:', error);
        throw new Error('Failed to read posts');
    }
};

// 특정 게시글 조회
const getPosts = async(offset, limit) => {
    const posts = await getAllPosts();
    //NOTE: 유효한 범위로 제한
    const startIndex = Math.max(0, offset);
    const endIndex = Math.min(posts.length, startIndex + limit);

    return posts.slice(startIndex, endIndex);
}


//게시글 추가
//NOTE: {} : 객체 구조 분해 -> 매개변수 순서가 자유롭다. 기본값 설정이 쉽다.
const addPost = async({ title, content, name, user_id, imageFilename = '' }) => {
    const posts = await getAllPosts();

    //NOTE: 이미지 경로 설정 제외. 정보보안이슈

    const newPost = {
        post_id: Date.now().toString(), //NOTE:현재시간을 밀리초 단위로 반환
        title,
        content,
        image: imageFilename,
        name,
        user_id,
        created_date: new Date().toISOString(),
        updated_date: new Date().toISOString(),
        views: 0, //숫자로 변경
        likes: 0,
        comments_count: 0,
        profile_image_path: "",
        comments: []
    };

    posts.unshift(newPost);
    savePosts(posts);
    return newPost;
};


// id로 게시글 조회 + 조회수 증가
const getPostById = async(post_id, increaseView = true) => {
    const posts = await getAllPosts();
    const postIndex = posts.findIndex(post => post.post_id === post_id);

    if(postIndex === -1){
        return null;
    }

    if(increaseView){
        posts[postIndex].views +=1;
        savePosts(posts);
    }


    return posts[postIndex];

};


//게시글 수정
const patchPost = async (post_id, updatedData) => {
    const posts = await getAllPosts();
    const postIndex = posts.findIndex(post => post.post_id === post_id);
    if(postIndex === -1){
        return null
    }

    //바뀐 데이터로 수정
    posts[postIndex] = {
        ...posts[postIndex],     // 1. 기존 게시글의 모든 속성을 복사
        title: updatedData.title,     // 2. 새로운 제목으로 덮어쓰기
        content: updatedData.content, 
        image: updatedData.image? updatedData.image : posts[postIndex].image, //update 이미지 없으면 기존이미지 유지
        updated_date: new Date().toISOString()
    };
    savePosts(posts);
    return true;
}

//이미지 삭제.
const deleteImage = async(post_id) => {
    //게시글 정보 가져오기
    const posts = await getAllPosts();
    const post = posts.find(post => post.post_id === post_id);

    if (!post || !post.image) {
        return false;
    }

    const imagePath = path.join(rootDir,'data','images',post.image);

    try{
        //이미지 삭제
        //NOTE : unlink is using the callback-based API. not the promise-based API.
        await fs.promises.unlink(imagePath);
        return true;
    }catch(error){
        console.error('Error deleting image:', error);
        return false;
    }
}

//게시글 삭제
const deletePost = async(post_id) => {
    const posts = await getAllPosts();
    const index = posts.findIndex(post => post.post_id === post_id);
    if(index !== -1){
        posts.splice(index,1);
        savePosts(posts);
        return true;//이게 없어서 false가 반환됐다..
    }
    else {
        return false;
    }
}

//댓글 작성
const addComment = async(post_id, comment) => {

    const posts = await getAllPosts();
    //NOTE : 수정/삭제할 때는 findIndex 사용
    const postIndex = posts.findIndex(post => post.post_id === post_id);

    if(postIndex === -1){
        return null;
    }

    //댓글추가
    const newComment = {
        comment_id : Date.now().toString(),
        user_id: comment.user_id,
        post_id,
        name: comment.name, //[24.12.11]FIX : 세션에서 name 가져오기
        content: comment.content,
        created_date: new Date().toISOString(),
        updated_date: new Date().toISOString()
    };

    //댓글수 증가
    posts[postIndex].comments_count += 1;

    posts[postIndex].comments.unshift(newComment); //배열 맨앞에 추가
    savePosts(posts);
    return true;
}

//댓글 수정
const patchComment = async(post_id,comment_id,content) => {
    const posts = await getAllPosts();
    const post = posts.find(post => post.post_id === post_id);
    if(!post){
        return null;
    }

    const commentIndex = post.comments.findIndex(comment => comment.comment_id === comment_id);
    if(commentIndex === -1){
        return null;
    }

    //바뀐 데이터로 수정
    post.comments[commentIndex] = {
        ...post.comments[commentIndex],     // 기존 게시글 모든 속성을 복사
        content: content,                   // 새로운 내용으로 덮어쓰기     
        updated_date: new Date().toISOString()
    };

    savePosts(posts);
    return true;


}

//댓글 삭제
const deleteComment = async(post_id,comment_id) => {
    const posts = await getAllPosts();
    const post = posts.find(post => post.post_id === post_id);

    if(!post) return false;

    const commentIndex = post.comments.findIndex(comment => comment.comment_id === comment_id);

    if(commentIndex !== -1){
        post.comments.splice(commentIndex,1);
        post.comments_count -=1; //댓글 수 감소
        savePosts(posts);
        return true;
    }
    else {
        return false;
    }
}

// 사용자 관련 데이터 삭제
const deleteUserRelatedData = async(user_id) => {
    const posts = await getAllPosts();
    
    // 게시글과 관련 이미지 삭제를 위해 역순으로 순회
    for (let i = posts.length - 1; i >= 0; i--) {
        const post = posts[i];
        
        if (post.user_id === user_id) {
            // 게시글에 이미지가 있다면 먼저 삭제 -> 의존성 처리
            if (post.image) {
                await deleteImage(post.post_id);
            }
            // 게시글 삭제
            posts.splice(i, 1);
        } else {
            // 댓글 삭제를 위해 역순으로 순회
            for (let j = post.comments.length - 1; j >= 0; j--) {
                if (post.comments[j].user_id === user_id) {
                    post.comments.splice(j, 1);
                    post.comments_count -= 1; // 댓글 수 감소
                }
            }
        }
    }
    
    savePosts(posts);
    return true;
}
//좋아요 업데이트
const patchLike = async(post_id, like) =>{

    const posts = await getAllPosts();
    const postIndex = posts.findIndex(post=> post.post_id === post_id);

    if(postIndex === -1){
        return null;
    }

    posts[postIndex].likes = like;
    savePosts(posts);
    return true;

}


module.exports = {
    checkAuthorization,
    addPost,
    getPostById,
    getPosts,
    deletePost,
    deleteImage,
    patchPost,
    addComment,
    patchComment,
    deleteComment,
    deleteUserRelatedData,
    patchLike
}