const path = require('path'); //디렉토리 경로를 다루는 기본 모듈
const upload = require('../community/JS/DashBoard/features/multerConfig');
const PostService = require('../community/JS/DashBoard/features/PostService');

//게시글 수정 페이지 로드
exports.getEditPost = (req, res) => {
    res.sendFile(path.join(__dirname, '../community/HTML', 'EditPost.html'));
};

//게시글 수정 요청
exports.patchEditPost = [upload.single('image'),async(req, res) => {
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
