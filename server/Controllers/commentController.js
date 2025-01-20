import CommentModel from '../Models/CommentModel.js';
    
const commentController = {

    // 댓글 추가
    addComment: async (req, res) => {
        const { post_id, content } = req.body;
        const { user_id } = req.session.user;
        if (!content) {
            return res.status(400).json({ message: '내용을 입력해주세요.' });
        }

        try {
            const result = await CommentModel.addComment(post_id, { user_id, content });

            if (!result) {
                return res.status(404).json({ message: '댓글 추가를 실패했습니다.' });
            }

            return res.status(201).json({ message: '댓글이 등록되었습니다.' });

        } catch (error) {
            console.error('댓글 등록 중 오류 발생:', error);
            return res.status(500).json({ message: 'internal_server_error' });
        }
    },

    // 댓글 수정
    editComment: async (req, res) => {
        const { post_id, comment_id } = req.params;
        const { content } = req.body;
        const { user_id } = req.session.user;

        try {
            // 권한 확인
            const isAuthorized = await CommentModel.checkAuthorization(comment_id, user_id);
            if (!isAuthorized) {
                return res.status(403).json({ message: '댓글 작성자만 수정할 수 있습니다.' });
            }
            if (!content) {
                return res.status(400).json({ message: '내용을 입력해주세요.' });
            }

            const post = await CommentModel.patchComment(comment_id, user_id, content);

            if (!post) {
                return res.status(404).json({ message: '댓글 수정을 실패했습니다.' });
            }

            // 수정 성공
            return res.status(200).json({ message: '댓글이 수정되었습니다.' });
            
        } catch (error) {
            console.error('댓글 수정 오류 발생:', error);
            return res.status(500).json({ message: 'internal_server_error' });
        }
    },

    // 댓글 삭제
    deleteComment: async (req, res) => {
        //FIXME: 추후에 post_id 삭제 (댓글 삭제시 comment_id만 필요)
        const { post_id, comment_id } = req.params;
        const { user_id } = req.session.user;

        try {
            // 권한 확인
            const isAuthorized = await CommentModel.checkAuthorization(comment_id, user_id);
            if (!isAuthorized) {
                return res.status(403).json({ message: '댓글 작성자만 삭제할 수 있습니다.' });
            }

            const post = await CommentModel.deleteComment(comment_id);

            if (!post) {
                return res.status(404).json({ message: '댓글이 존재하지 않습니다.' });
            }

            // 삭제 성공
            return res.status(200).json({ message: '댓글이 삭제되었습니다.' });
        } catch (error) {
            console.error('댓글 삭제 오류 발생:', error);
            return res.status(500).json({ message: 'internal_server_error' });
        }
    }
};

export default commentController;