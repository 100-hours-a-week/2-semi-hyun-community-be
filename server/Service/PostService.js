import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname,'../'); //NOTE: 절대경로로 해석 -> 상위 디렉토리로 이동
const postsFilePath = path.join(rootDir,'data/json/posts.json'); //폴더 경로 변경으로 수정

const PostService = {
    //작성자 권한 확인
    checkAuthorization: async(post_id, user_id, comment_id=null, type = 'post') => {
        const posts = await PostService.getAllPosts();
        if(type === 'post'){
            const post = posts.find(post => post.post_id === post_id);
            if (!post) return false;
            return post.user_id === user_id;
        }
        else if(type === 'comment'){
            const post = posts.find(post => post.post_id === post_id);
            const comment = post?.comments?.find(comment => comment.comment_id === comment_id);
            if (!comment) return false;
            return comment.user_id === user_id;
        }
    },

    //게시글 저장
    savePosts: (posts) => {
        try {
            fs.writeFileSync(postsFilePath, JSON.stringify(posts, null, 2));
            return true;
        } catch (error) {
            console.error('Error writing posts:', error);
            throw new Error('Failed to save posts');
        }  
    },

    // 모든 게시글 조회
    getAllPosts: async() => {
        try {
            if (!fs.existsSync(postsFilePath)) {
                return [];
            }
            const postsData = await fs.promises.readFile(postsFilePath, 'utf8');
            return JSON.parse(postsData);
        } catch (error) {
            console.error('Error reading posts:', error);
            throw new Error('Failed to read posts');
        }
    },

    // 특정 게시글 조회
    getPosts: async(offset, limit) => {
        const posts = await PostService.getAllPosts();
        const startIndex = Math.max(0, offset);
        const endIndex = Math.min(posts.length, startIndex + limit);

        return posts.slice(startIndex, endIndex);
    },

    //게시글 추가
    //NOTE: {} : 객체 구조 분해 -> 매개변수 순서가 자유롭다. 기본값 설정이 쉽다.
    addPost: async({ title, content, name, user_id, imageFilename = '' }) => {
        const posts = await PostService.getAllPosts();

        const newPost = {
            post_id: Date.now().toString(),
            title,
            content,
            image: imageFilename,
            name,
            user_id,
            created_date: new Date().toISOString(),
            updated_date: new Date().toISOString(),
            views: 0,
            likes: 0,
            comments_count: 0,
            profile_image_path: "",
            comments: []
        };

        posts.unshift(newPost);
        PostService.savePosts(posts);
        return newPost;
    },

    // id로 게시글 조회 + 조회수 증가
    getPostById: async(post_id, increaseView = true) => {
        const posts = await PostService.getAllPosts();
        const postIndex = posts.findIndex(post => post.post_id === post_id);

        if(postIndex === -1) return null;

        if(increaseView){
            posts[postIndex].views += 1;
            PostService.savePosts(posts);
        }

        return posts[postIndex];
    },

    //게시글 수정
    patchPost: async(post_id, updatedData) => {
        const posts = await PostService.getAllPosts();
        const postIndex = posts.findIndex(post => post.post_id === post_id);
        if(postIndex === -1) return null;

        posts[postIndex] = {
            ...posts[postIndex],        // 1. 기존 게시글의 모든 속성을 복사
            title: updatedData.title,   // 2. 새로운 제목으로 덮어쓰기
            content: updatedData.content,
            image: updatedData.image ?? posts[postIndex].image,
            updated_date: new Date().toISOString()
        };
        
        PostService.savePosts(posts);
        return true;
    },

    //이미지 삭제
    deleteImage: async(post_id) => {
        const posts = await PostService.getAllPosts();
        const post = posts.find(post => post.post_id === post_id);

        if (!post?.image) return false;

        const imagePath = path.join(rootDir,'data','images',post.image);

        try{
            await fs.promises.unlink(imagePath);
            return true;
        }catch(error){
            console.error('Error deleting image:', error);
            return false;
        }
    },

    //게시글 삭제
    deletePost: async(post_id) => {
        const posts = await PostService.getAllPosts();
        const index = posts.findIndex(post => post.post_id === post_id);
        if(index !== -1){
            posts.splice(index,1);
            PostService.savePosts(posts);
            return true;
        }
        return false;
    },

    //댓글 작성
    addComment: async(post_id, comment) => {
        const posts = await PostService.getAllPosts();
        const postIndex = posts.findIndex(post => post.post_id === post_id);

        if(postIndex === -1) return null;

        const newComment = {
            comment_id: Date.now().toString(),
            user_id: comment.user_id,
            post_id,
            name: comment.name,
            content: comment.content,
            created_date: new Date().toISOString(),
            updated_date: new Date().toISOString()
        };

        posts[postIndex].comments_count += 1;
        posts[postIndex].comments.unshift(newComment);
        PostService.savePosts(posts);
        return true;
    },

    //댓글 수정
    patchComment: async(post_id, comment_id, content) => {
        const posts = await PostService.getAllPosts();
        const post = posts.find(post => post.post_id === post_id);
        if(!post) return null;

        const commentIndex = post.comments.findIndex(comment => comment.comment_id === comment_id);
        if(commentIndex === -1) return null;

        post.comments[commentIndex] = {
            ...post.comments[commentIndex],
            content,
            updated_date: new Date().toISOString()
        };

        PostService.savePosts(posts);
        return true;
    },

    //댓글 삭제
    deleteComment: async(post_id, comment_id) => {
        const posts = await PostService.getAllPosts();
        const post = posts.find(post => post.post_id === post_id);

        if(!post) return false;

        const commentIndex = post.comments.findIndex(comment => comment.comment_id === comment_id);

        if(commentIndex !== -1){
            post.comments.splice(commentIndex,1);
            post.comments_count -= 1;
            PostService.savePosts(posts);
            return true;
        }
        return false;
    },

    // 사용자 관련 데이터 삭제
    deleteUserRelatedData: async(user_id) => {
        const posts = await PostService.getAllPosts();
        
        for (let i = posts.length - 1; i >= 0; i--) {
            const post = posts[i];
            
            if (post.user_id === user_id) {
                if (post.image) {
                    await PostService.deleteImage(post.post_id);
                }
                posts.splice(i, 1);
            } else {
                for (let j = post.comments.length - 1; j >= 0; j--) {
                    if (post.comments[j].user_id === user_id) {
                        post.comments.splice(j, 1);
                        post.comments_count -= 1;
                    }
                }
            }
        }
        
        PostService.savePosts(posts);
        return true;
    },

    //좋아요 업데이트
    patchLike: async(post_id, like) => {
        const posts = await PostService.getAllPosts();
        const postIndex = posts.findIndex(post => post.post_id === post_id);

        if(postIndex === -1) return null;

        posts[postIndex].likes = like;
        PostService.savePosts(posts);
        return true;
    }
};

export default PostService;