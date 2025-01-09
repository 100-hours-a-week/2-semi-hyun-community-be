import { query } from './Connect_DB.js';

const LikeModel = {
    //--좋아요--
    //좋아요 업데이트 (중복 선택x)
    //FIXME : 좋아요 버튼 누르면 CSS로 색상바꾸기
    patchLike: async(user_id,post_id, isLike) => {
        try{
            if(isLike){
                //좋아요 추가
                //NOTE : on duplicate : 이미 좋아요를 눌렀다면 해당 구문 실행 (아무것도 실행x)
                const insertSql = `INSERT INTO likes VALUES (?,?) 
                                    ON DUPLICATE KEY UPDATE post_id=post_id`;
                await query(insertSql,[post_id, user_id]);

                // post 테이블의 likes 증가
                const updatePostSql = 'UPDATE post SET likes = likes + 1 WHERE post_id = ?';
                await connection.query(updatePostSql, [post_id]);

            }
            else{
                // 좋아요 제거
                const deleteSql = 'DELETE FROM likes WHERE post_id = ? AND user_id = ?';
                await connection.query(deleteSql, [post_id, user_id]);
                
                // post 테이블의 likes 감소
                const updatePostSql = 'UPDATE post SET likes = likes - 1 WHERE post_id = ?';
                await connection.query(updatePostSql, [post_id]);
            }

        }catch(error){
            console.error('좋아요 오류:', error);
            throw error;
        }

    }
}

export default LikeModel;