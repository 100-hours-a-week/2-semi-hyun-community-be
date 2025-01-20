import { pool,query } from './Connect_DB.js';

const LikeModel = {
    //좋아요 상태 반환
    getLikeStatus: async(user_id, post_id) => {
        try{
            const sql = 'SELECT COUNT(*) as cnt FROM likes WHERE user_id = ? AND post_id = ?';
            const values = [user_id,post_id];
            const result = await query(sql,values);

            //1이상이면 좋아요 클릭 -> true
            console.log('cnt:',result.cnt);
            return result[0].cnt > 0;

        }catch(error){
            console.error('좋아요 상태 확인 오류',error);
            throw error;
        }
    },


    //좋아요 업데이트 (중복 삽입x)
    //FIXME : 좋아요 버튼 누르면 CSS로 색상바꾸기
    patchLike: async(user_id, post_id, isLike) => {
        const connection = await pool.getConnection(); // 풀에서 연결 가져오기

        try{
            await connection.beginTransaction(); // 트랜잭션 시작

            if(isLike){

                //좋아요 추가
                //NOTE : on duplicate : 이미 좋아요를 눌렀다면 해당 구문 실행 (아무것도 실행x)
                const insertSql = `INSERT INTO likes (post_id, user_id) VALUES (?,?) ON DUPLICATE KEY UPDATE post_id=post_id`;
                await connection.query(insertSql,[post_id, user_id]);

                // post 테이블의 likes 증가
                const updateSql = 'UPDATE post SET likes = likes + 1 WHERE post_id = ?';
                await connection.query(updateSql, [post_id]);

                // const isCommit = insertResult.affectedRows>0 && updateResult.affectedRows>0;
            }
            else{
                // 좋아요 제거
                const deleteSql = 'DELETE FROM likes WHERE post_id = ? AND user_id = ?';
                await connection.query(deleteSql, [post_id, user_id]);
                
                // post 테이블의 likes 감소
                const updateSql = 'UPDATE post SET likes = likes - 1 WHERE post_id = ?';
                await connection.query(updateSql, [post_id]);

                // const isCommit = deleteResult.affectedRows>0 && updateResult.affectedRows>0;
            }

            //트랜잭션 커밋
            await connection.commit();
            return true;

        }catch(error){
            try{
                await connection.rollback();
            } catch(rollbackError){
                console.error('롤백 실패:',rollbackError);
            }
            console.error('좋아요 오류:', error);
            throw error;

        } finally{
            //커넥션 반환
            connection.release();
        }

    }
}

export default LikeModel;