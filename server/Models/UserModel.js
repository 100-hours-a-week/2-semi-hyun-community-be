import { query } from './Connect_DB.js';

const UserModel = {
    // 사용자 권한 확인
    checkAuthorization: async (user_id) => {},

    // 특정 데이터 조회
    getUserById: async (user_id) => {},

    // 사용자 추가
    addUser: async (userData) => {
        try {
            const sql = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
            const values = [userData.name, userData.email, userData.password];
            const result = await query(sql, values);
            return result.insertId;
        } catch (error) {
            console.error('사용자 추가 오류:', error);
            throw error;
        }
    },

    // 사용자 정보 수정
    patchUser: async (user_id, userData) => {},

    // 비밀번호 수정
    patchPassword: async (user_id, password) => {},

    // 사용자 삭제
    deleteUser: async (user_id) => {},

    // 이메일 중복 체크
    checkEmail: async (email) => {},

    // 이름 중복 체크
    checkName: async (name) => {}
};

export default UserService;