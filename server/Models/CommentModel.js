import { query } from './Connect_DB.js';

const CommentModel = {

    //이름도 포함하기
    //댓글 조회
    getComment: async(post_id) => {
        try{
            const sql = `SELECT comment.*, user.name, user.profile_image
                        FROM comment 
                        JOIN user
                        ON comment.user_id = user.user_id
                        WHERE post_id = ?
                        ORDER BY comment.created_at DESC`;

            const result = await query(sql,[post_id]);

            return result || '';

        }catch(error){
            console.error('게시글 목록 조회 오류:', error);
            throw error;
        }
    },

    //댓글 추가
    addComment: async(post_id, { user_id, content }) => {
        try{
            const sql = `INSERT INTO comment (user_id, post_id, content) VALUES (?, ?, ?)`;
            const values = [user_id, post_id, content];
            const result = await query(sql,values);

            console.log(result.affectedRows);
            return result.affectedRows > 0;

        }catch(error){
            console.error('게시글 추가 오류:', error);
            throw error;
        }

    },

    //댓글 수정
    patchComment: async(post_id, user_id, content) => {
        try{
            const sql = `UPDATE comment SET content =? 
                         WHERE post_id = ? AND user_id =?`;
            const values = [content, post_id, user_id];

            const result = await query(sql,values);

            return result.affectedRows > 0;

        }catch(error){
            console.error('게시글 수정 오류:', error);
            throw error;
        }
    },

    //댓글 삭제
    deleteComment: async(comment_id) => {
        try{
            const sql = `DELETE FROM comment WHERE comment_id = ?`;
            const result = await query(sql,[comment_id]);

            console.log(result.affectedRows);

            return result.affectedRows >0;

        }catch(error){
            console.error('게시글 삭제 오류:', error);
            throw error;
        }
    }
}

export default CommentModel;