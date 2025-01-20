import { pool,query } from './Connect_DB.js';

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
        const connection = await pool.getConnection(); // 풀에서 연결 가져오기
        try {
            await connection.beginTransaction(); // 트랜잭션 시작

            const insertSql = `INSERT INTO comment (user_id, post_id, content) VALUES (?, ?, ?)`;
            const values = [user_id, post_id, content];
            const insertResult = await connection.query(insertSql, values);

            const updateSql = `UPDATE post SET comments=comments+1 WHERE post_id = ?`;
            const updateResult = await connection.query(updateSql, [post_id]);

            if(insertResult[0].affectedRows > 0 && updateResult[0].affectedRows > 0){
                await connection.commit(); // 트랜잭션 커밋
                return true;
            }else{
                await connection.rollback(); // 오류 발생시 롤백
                return false;
            }

        } catch(error) {
            await connection.rollback(); // 오류 발생시 롤백
            console.error('댓글 추가 오류:', error);
            throw error;
        } finally {
            connection.release(); // 커넥션 반환
        }
    },

    //댓글 수정
    patchComment: async(comment_id, user_id, content) => {
        try{
            const sql = `UPDATE comment SET content =? 
                         WHERE comment_id = ? AND user_id =?`;
            const values = [content, comment_id, user_id];

            const result = await query(sql,values);

            return result.affectedRows > 0;

        }catch(error){
            console.error('댓글 수정 오류:', error);
            throw error;
        }
    },

    //댓글 삭제
    deleteComment: async(post_id,comment_id) => {
        const connection = await pool.getConnection(); // 풀에서 연결 가져오기
        try {
            await connection.beginTransaction(); // 트랜잭션 시작

            const deleteSql = `DELETE FROM comment WHERE comment_id = ?`;
            const deleteResult = await connection.query(deleteSql, [comment_id]);

            const updateSql = `UPDATE post SET comments=comments-1 WHERE post_id = ?`;
            const updateResult = await connection.query(updateSql, [post_id]);

            if(deleteResult[0].affectedRows > 0 && updateResult[0].affectedRows > 0){
                await connection.commit(); // 트랜잭션 커밋
                return true;
            }else{
                await connection.rollback(); // 오류 발생시 롤백
                return false;
            }

        } catch(error) {
            await connection.rollback(); // 오류 발생시 롤백
            console.error('댓글 삭제 오류:', error);
            throw error;
        } finally {
            connection.release(); // 커넥션 반환
        }
    },


    //--권한 확인--
    //작성자 권한 확인
    checkAuthorization: async(comment_id, user_id) => {
        try{
            const sql = 'SELECT COUNT(*) AS count FROM comment WHERE comment_id = ? AND user_id = ?';
            const values = [comment_id, user_id];
            const result = await query(sql,values);

            return result[0].count>0;

        }catch(error){
            console.error('특정 댓글 조회 오류:', error);
            throw error;
        }
    }
}

export default CommentModel;