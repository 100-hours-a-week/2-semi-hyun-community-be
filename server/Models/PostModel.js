import { query } from './Connect_DB.js';

const PostModel = {

    //--게시글--
    //게시글 목록 조회
    getPosts : async(offset, limit) => {
        try{
            const sql = `SELECT post.*, user.name, user.profile_image 
            FROM post
            JOIN user
            ON post.user_id = user.user_id
            ORDER BY post.created_at DESC
            LIMIT ? OFFSET ?`;
            //문자열 -> 숫자로 변환
            const values = [Number(limit),Number(offset)];

            //NOTE : query에서 이미 데이터 배열만 반환. result : 배열의 첫번째 요소만 가져옴
            const result = await query(sql,values);
            //모든 쿼리값 반환
            return result || '';

        }catch(error){
            console.error('게시글 목록 조회 오류:', error);
            throw error;
        }
    },

    //특정 게시물 조회
    getPostById : async(post_id) => {
        try{
            const sql = `SELECT post.*, user.name, user.profile_image 
                        FROM post
                        JOIN user
                        ON post.user_id = user.user_id
                        WHERE post.post_id = ?`;
                        
            const result = await query(sql,[post_id]);

            //배열 벗겨서 주기
            return result[0];
            

        }catch(error){
            console.error('특정 게시글 조회 오류:', error);
            throw error;
        }
    },

    //조회수 증가
    incrementView : async(post_id) => {
        try{
            const sql = `UPDATE post SET views = views + 1 WHERE post_id = ?`
            const result = await query(sql,[post_id]);


            return result.affectedRows > 0;

        }catch(error){
            throw error;
        }
    },

    //게시글 추가
    addPost : async({ title, content, user_id, imageFilename}) => {
        try{
            const sql = `INSERT INTO post (user_id, title, content, post_image) VALUES (?, ?, ?, ?)`;
            const values = [user_id, title, content, imageFilename ? imageFilename : null];
            const result = await query(sql,values);

            //결과 반환 -> respond data : post_id
            return result.insertId;

        }catch(error){
            console.error('게시글 추가 오류:', error);
            throw error;
        }
    },

    //게시글 수정
    patchPost : async(post_id, updatedData) => {
        try{
            //동적 SQL
            let sql = `UPDATE post SET title = ?, content = ?`;
            const values = [updatedData.title, updatedData.content];

            if(updatedData.post_image){
                sql += `, post_image = ?`;
                values.push(updatedData.post_image);
            }

            sql += ` WHERE post_id = ?`
            values.push(post_id);

            const result = await query(sql,values);

            return result.affectedRows > 0;

        }catch(error){
            console.error('게시글 수정 오류:', error);
            throw error;
        }
    },

    // 게시글 이미지 가져오기
    getPostImage: async (post_id) => {
        try{
            const sql = `SELECT post_image FROM post WHERE post_id = ?`;
            const result = await query(sql,[post_id]);

            return result[0].post_image;

        }catch(error){
            console.error('게시글 이미지 조회 오류:', error);
            throw error;
        }
    },

    //게시글 삭제
    deletePost: async (post_id) => {
        try{
            const sql = `DELETE FROM post WHERE post_id = ?`;
            const result = await query(sql,[post_id]);

            console.log(result.affectedRows);

            return result.affectedRows > 0;

        }catch(error){
            console.error('게시글 삭제 오류:', error);
            throw error;
        }
    },

    //사진 삭제
    updatePostImage : async(post_id) => {
        try{
            const sql = 'UPDATE post SET post_image=NULL WHERE post_id = ?';
            const result = await query(sql,[post_id]);

            return result.affectedRows >0;
        }catch(error){
            console.error('기존 사진 삭제 오류:', error);
            throw error;
        }

    },
    //작성자 권한 확인
    //현재 user_id 와 post_id의 user_id를 비교해야한다.
    checkAuthorization: async(post_id, user_id) => {
        try{
            const sql = 'SELECT COUNT(*) AS count FROM post WHERE post_id = ? AND user_id = ?';
            const values = [post_id, user_id];
            const result = await query(sql,values);

            return result[0].count>0;

        }catch(error){
            console.error('특정 게시글 조회 오류:', error);
            throw error;
        }
    }

}

export default PostModel;