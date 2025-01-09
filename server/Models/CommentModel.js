import { query } from './Connect_DB.js';

const CommentModel = {

    //댓글 조회
    getComment: async(post_id) => {
        try{
            const sql = `SELECT * FROM comment WHERE post_id = ?`;

            const result = await query(sql,[post_id]);

            return result || '';

        }catch(error){
            console.error('게시글 목록 조회 오류:', error);
            throw error;
        }
    },

    //댓글 추가
    addComment: async() => {},

    //댓글 수정
    patchComment: async() => {},

    //댓글 삭제
    deleteComment: async() => {},
}

export default CommentModel;