import { query } from './db.js';

const UserService = {
    // 모든 사용자 조회
    getAllUsers: async () => {
        try {
            const sql = 'SELECT * FROM users'; // 테이블 이름에 맞게 수정
            const users = await query(sql);
            return users;
        } catch (error) {
            console.error('사용자 조회 오류:', error);
            throw error;
        }
    },

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

    // 기타 사용자 관련 함수...
};

export default UserService;