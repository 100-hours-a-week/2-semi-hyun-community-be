//대시보드 비즈니스 로직을 처리
const {postsUpload} = require('../Service/multerConfig');
const PostService = require('../Service/PostService');



//게시글 목록 조회 - 데이터 조회
exports.getDashboardData = async(req,res) => {
    const {offset,limit} = req.query;
    try{
        const posts = await PostService.getPosts(offset,limit);

        if(!posts){
            return res.status(400).json({'message': 'invalid_post'});
        }

        return res.status(200).json(posts);

    }catch(error){
        console.error('Error fetching dashboard data:', error);
        return res.status(500).json({message : 'internal_server_error'});
    }
}

//게시글 상세 조회 - 데이터 조회
exports.getPostData = async (req,res) => {
    //NOTE: params : url파라미터를 가져옴
    const { post_id } = req.params;

    try{
        // NOTE: getPostById가 동기 함수여도 await는 정상 작동
        // NOTE:await Promise.resolve(getPostById(post_id))와 동일하게 처리됨
        // getPostById: post 조회 + 조회수 증가
        const post = await PostService.getPostById(post_id);
        

        if(!post){
            return res.status(400).json({message : 'invalid_post_id'})
        }

        // await PostService.updatePost(post_id, { view: post.view });
        // await PostService.addView(post_id);
        
        return res.status(200).json(post);

    }catch(error){
        res.status(500).json({message : 'internal_server_error'});
        console.error('Error fetching post data:', error);
    }
}

//게시글 추가
//NOTE: 미들웨어+요청처리 -> 배열로 순서대로 처리
exports.postAddPost = [postsUpload.single('image'), async(req,res) => {
    const {title, content, name, user_id} = req.body;

    //FIXME: 입력타입 검증
    if (!title || !content || !user_id) {
        return res.status(400).json({ message: 'missing_required_fields' });
    }

    try{
        const newPost = await PostService.addPost({
            title,
            content,
            name,
            user_id,
            imageFilename: req.file ? req.file.filename : ''
        });

        res.status(201).json({
            message: 'post created successfully',
            post_id: newPost.post_id
        });

    }catch(error){
        console.error('Error creating post:', error);
        return res.status(500).json({ message: 'server_error' });
    }
}];


//게시글 수정 요청
exports.patchEditPost = [postsUpload.single('image'),async(req, res) => {
    const {post_id} = req.params;
    const {title, content} = req.body;

    try{
        //이미지가 있을경우
        if(req.file){
            //기존 이미지 삭제
            await PostService.deleteImage(post_id);
        }

        //게시글 수정
        const post = PostService.patchPost(post_id,{
            title,
            content,
            image: req.file ? req.file.filename: undefined
        });

        if(!post){
            return res.status(404).json({message: 'post_not_found'});
        }

        //수정완료. send로 응답 보내기.
        return res.status(204).send();

    }catch(error){
        console.error('Error patching post:', error);
        return res.status(500).json({message: 'internal_server_error'});
    }

}];


//게시글 삭제
exports.deletePost = async (req,res)=>{
    const { post_id } = req.params;

    try{
        const result = await PostService.deletePost(post_id);
        if(!result) {
            return res.status(404).json({message : 'invalid_post_id'});
        }

        return res.status(204).send();

    }catch(error){
        console.error('Error deleting post:', error);
        return res.status(500).json({message : 'internal_server_error'});
    }
}

//좋아요 업데이트
exports.patchLike = async (req,res) => {
    const {post_id} = req.params;
    const {likes} = req.body;

    try{
        const post = PostService.patchLike(post_id,likes);

        if(!post){
            return res.status(404).send();
        }
    
        return res.status(204).send();

    }catch(error){
        console.error('Error deleting post:', error);
        return res.status(500).json({message : 'internal_server_error'});
    }
}
