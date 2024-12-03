const fs = require('fs');
const path = require('path');
const rootDir = path.resolve(__dirname,'../'); //NOTE: 절대경로로 해석 -> 상위 디렉토리로 이동
const postsFilePath = path.join(rootDir,'data/json/posts.json'); //폴더 경로 변경으로 수정

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
const getAllPosts = () => {
    try {
        if (!fs.existsSync(postsFilePath)) {
            return [];  // 파일이 없으면 빈 배열 반환
        }
        const postsData = fs.readFileSync(postsFilePath, 'utf8');
        return JSON.parse(postsData);
    } catch (error) {
        console.error('Error reading posts:', error);
        throw new Error('Failed to read posts');
    }
};

// 특정 게시글 조회
const getPosts = (offset, limit) => {
    const posts = getAllPosts();
    //NOTE: 유효한 범위로 제한
    const startIndex = Math.max(0, offset);
    const endIndex = Math.min(posts.length, startIndex + limit);
    
    return posts.slice(startIndex, endIndex);
}


//게시글 추가
//NOTE: {} : 객체 구조 분해 -> 매개변수 순서가 자유롭다. 기본값 설정이 쉽다.
const addPost = ({ title, content, name, user_id, imageFilename = '' }) => {
    console.log('addPost 호출');
    console.log(title, content, user_id, imageFilename);

    const posts = getAllPosts();
    
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
const getPostById = (post_id, increaseView = true) => {
    const posts = getAllPosts();
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
const patchPost = (post_id, updatedData) => {
    const posts = getAllPosts();
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
    const posts = getAllPosts();
    const post = posts.find(post => post.post_id === post_id);

    if (!post || !post.image) {
        return false;
    }

    const imagePath = path.join(rootDir,'images/',post.image);

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
const deletePost = (post_id) => {
    const posts = getAllPosts();
    const index = posts.findIndex(post => post.post_id === post_id);
    console.log(`index : ${index}`);
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
    
    const posts = getAllPosts();
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
        content: comment.content,
        created_date: new Date().toISOString(),
        updated_date: new Date().toISOString()
    };

    //댓글수 증가
    posts[postIndex].comments_count += 1;

    posts[postIndex].comments.unshift(newComment); //배열 맨앞에 추가
    await savePosts(posts);
    return true;
}

//댓글 수정
const patchComment = async(post_id,comment_id,content) => {
    const posts = getAllPosts();
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

    await savePosts(posts);
    return true;


}

//댓글 삭제
const deleteComment = async(post_id,comment_id) => {
    const posts = getAllPosts();
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

//좋아요 업데이트
const patchLike = (post_id, like) =>{

    const posts = getAllPosts();
    const postIndex = posts.findIndex(post=> post.post_id === post_id);

    if(postIndex === -1){
        return null;
    }

    posts[postIndex].likes = like;
    savePosts(posts);
    return true;

}


module.exports = {
    addPost,
    getPostById,
    getPosts,
    deletePost,
    deleteImage,
    patchPost,
    addComment,
    patchComment,
    deleteComment,
    patchLike
}