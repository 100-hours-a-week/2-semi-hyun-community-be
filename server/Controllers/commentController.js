import PostService from '../Service/PostService.js';

const commentController = {
    //댓글추가
    addComment: async (req, res) => {
        const {post_id, content} = req.body;
        const {user_id, name} = req.session.user;
        if(!content) {
            return res.status(400).json({message: '내용을 입력해주세요.'});
        }

        try {
            const result = await PostService.addComment(post_id, {user_id, name, content});

            if(!result) {
                return res.status(404).json({message: '게시글을 찾을 수 없습니다.'});
            }

            return res.status(201).json({message: '댓글이 등록되었습니다.'});

        } catch(error) {
            console.error('댓글 등록 중 오류 발생:', error);
            return res.status(500).json({message: 'internal_server_error'});
        }
    },

    //댓글 수정
    editComment: async (req, res) => {
        const {post_id, comment_id} = req.params;
        const {content} = req.body;
        const {user_id} = req.session.user;

        //권한 확인 
        const isAuthorized = PostService.checkAuthorization(post_id, user_id, comment_id, 'comment');  
        if(!isAuthorized) {
            return res.status(403).json({message: '게시글 작성자만 수정할 수 있습니다.'});
        }   

        if(!content) {
            return res.status(400).json({message: '내용을 입력해주세요.'});
        }
        const post = await PostService.patchComment(post_id, comment_id, content);

        if(!post) {
            return res.status(404).json({message: '게시글을 찾을 수 없습니다.'});
        }

        //수정 성공
        return res.status(200).json({message: '댓글이 수정되었습니다.'});
    },

    //댓글 삭제
    deleteComment: async (req, res) => {
        const {post_id, comment_id} = req.params;
        const {user_id} = req.session.user;

        //권한 확인
        const isAuthorized = PostService.checkAuthorization(post_id, user_id, comment_id, 'comment');  
        if(!isAuthorized) {
            return res.status(403).json({message: '게시글 작성자만 삭제할 수 있습니다.'});
        }

        const post = await PostService.deleteComment(post_id, comment_id);

        if(!post) {
            return res.status(404).json({message: '댓글이 존재하지 않습니다.'});
        }

        //NOTE : fetch : json()을 사용하기 위해 204 대신 json 포함해서 전송
        return res.status(200).json({message: '댓글이 삭제되었습니다.'});
    }
};


//댓글 수정
exports.editComment = async(req,res)=> {
    const {post_id,comment_id} = req.params;
    const {content} = req.body;
    const {user_id} = req.session.user;

    //권한 확인 
    const isAuthorized = await PostService.checkAuthorization(post_id, user_id, comment_id,'comment');  
    if(!isAuthorized){
        return res.status(403).json({message : '게시글 작성자만 수정할 수 있습니다.'});
    }   

    if(!content){
        return res.status(400).json({message: '내용을 입력해주세요.'});
    }
    const post = await PostService.patchComment(post_id,comment_id,content);

    if(!post){
        return res.status(404).json({message: '게시글을 찾을 수 없습니다.'});
    }

    //수정 성공
    return res.status(200).json({message: '댓글이 수정되었습니다.'});
};

//댓글 삭제
exports.deleteComment = async (req,res)=> {
    const {post_id,comment_id} = req.params;
    const {user_id} = req.session.user;

    //권한 확인
    const isAuthorized = await PostService.checkAuthorization(post_id, user_id, comment_id,'comment');  
    if(!isAuthorized){
        return res.status(403).json({message : '게시글 작성자만 삭제할 수 있습니다.'});
    }

    const post = await PostService.deleteComment(post_id,comment_id);

    if(!post){
        return res.status(404).json({message: '댓글이 존재하지 않습니다.'});
    }

    //NOTE : fetch : json()을 사용하기 위해 204 대신 json 포함해서 전송
    return res.status(200).json({message: '댓글이 삭제되었습니다.'});
};

export default commentController;