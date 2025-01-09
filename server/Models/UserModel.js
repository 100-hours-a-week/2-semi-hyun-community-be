import { query } from './Connect_DB.js';

const UserModel = {
    
    //--회원가입--

    // 사용자 추가 (회원가입)
    addUser: async (userData) => {
        try {
            const sql = `INSERT INTO user (user_id, name, email, password, profile_image) VALUES (?, ?, ?, ?, ?)`;
            const values = [
                userData.user_id, 
                userData.name, 
                userData.email,
                userData.password,
                userData.profile_image
            ];
            const result = await query(sql, values);

            console.log(result);
            //실제로 추가된 행이 있는지
            return result.affectedRows > 0;
        } catch (error) {
            console.error('사용자 추가 오류:', error);
            throw error;
        }
    },

    // 이메일 중복 체크
    checkEmail: async (email) => {
        try{
            const sql = 'SELECT * FROM user WHERE email = ?';
            const result = await query(sql,[email]);

            // 데이터가 있다면 true, 없으면 false 반환
            return result.length > 0;

        }catch(error){
            console.error('이메일 중복 체크 오류:', error);
            throw error;
        }
    },

    // 이름 중복 체크
    checkName: async (name) => {
        try{
            const sql = 'SELECT * FROM user WHERE name = ?';
            const result = await query(sql,[name]);
            
            // 데이터가 있다면 true, 없으면 false 반환
            return result.length > 0;

        }catch(error){
            console.error('이름 중복 체크 오류:', error);
            throw error;
        }
    },

    //--로그인--

    // 이메일 조회 (로그인)
    getUserByEmail: async (email) => {
        try{
            const sql = `SELECT * FROM user WHERE email = ?`;
            const result = await query(sql, [email]);
            
            //NOTE : result : [{}]로 반환
            return result[0];
        } catch (error) {
            console.error('이메일 조회 오류:', error);
            throw error;
        }
    },

    // 로그인 시간 업데이트
    updateLoginTime : async (user_id) => {
        try{
            const sql = `UPDATE user SET updated_at = CURRENT_TIMESTAMP WHERE user_id = ?`;
            const result = await query(sql,[user_id]);

            return result.affectedRows > 0;
        }catch(error){
            console.error('로그인 시간 업데이트 오류:', error);
            throw error;
        }
    },

    //--권한 확인--

    // 특정 데이터 조회
    getUserById: async (user_id) => {
        try{
            const sql = `SELECT * FROM user WHERE user_id = ?`;
            const result = await query(sql,[user_id]);

            //데이터가 없으면 undefined가 아닌 null 반환
            return result.length >0 ? result[0] : null;

        }catch(error){
            console.error('특정 데이터 조회 오류:', error);
            throw error;
        }
    },

    //note: 안쓰면 삭제
    // 사용자 권한 확인
    checkAuthorization: async (user_id) => {
        //사용자 조회
        const isAuthorized = await getUserById(user_id);

        if(!isAuthorized){
            return false;
        }
        console.log(isAuthorized.user_id)

        return isAuthorized.user_id === user_id;
    },




    //--정보 수정--

    // 사용자 정보 수정 (닉네임, 사진)
    patchUser: async (user_id, userData) => {
        try{
            //동적 SQL
            //1.기본 업데이트 쿼리
            let sql = 'UPDATE user SET name = ?, updated_at = CURRENT_TIMESTAMP';
            const values = [userData.name];

            //2.profile_image가 존재하면 추가
            if(userData.profile_image){
                sql += `, profile_image = ?`;
                values.push(userData.profile_image);
            }

            //3.where 추가
            sql += `WHERE user_id = ?`;
            values.push(user_id);

            //4.쿼리 실행
            const result = await query(sql,values)

            // 실제로 업데이트된 행이 있는지 확인
            return result.affectedRows > 0;

            
        }catch(error){
            console.error('사용자 정보 수정 오류:', error);
            throw error;
        }
    },

    // 비밀번호 수정
    patchPassword: async (user_id, password) => {
        try{
            const sql = 'UPDATE user SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?';
            const values = [password,user_id];
            const result = await query(sql,values);

            // 실제로 업데이트된 행이 있는지 확인
            return result.affectedRows > 0;

        }catch(error){
            console.error('비밀번호 수정 오류',error);
            throw error;
        }
    },

    // 사용자 삭제
    deleteUser: async (user_id) => {
        try{
            const sql = 'DELETE FROM user WHERE user_id = ?';
            const result = await query(sql,[user_id]);

            return result.affectedRows > 0;

        }catch(error){
            console.error('회원 탈퇴 오류',error);
            throw error;
        }
    }
};

export default UserModel;