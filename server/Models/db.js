import mysql from 'mysql2';
import dotenv from 'dotenv'; 

//환경변수 로드
dotenv.config();

//환경 변수 - DB 설정 가져오기
const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT, DB_TEST } = process.env;

//DB 연결 풀 생성
const pool = mysql.createPool({
    connectionLimit: 10, // 필요에 따라 조정
    host : DB_HOST,
    user : DB_USER,
    password : DB_PASSWORD,
    database : DB_TEST,//[24.12.19]테스트 스키마 사용
    port : DB_PORT
})

//쿼리 실행 함수
const query = (sql, values) => {
    return new Promise((resolve, reject) => {
        pool.query(sql, values, (error,result) => {
            if(error) reject(error);
            resolve(result);    
        });
    });
};

// DB 연결 테스트
async function testDatabaseConnection() {
    try {
        const results = await query('SELECT 1 + 1 AS solution');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📦 Database Connection Test');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Status: ✅ Connected');
        console.log('Test Query Result:', results[0].solution);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    } catch (err) {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📦 Database Connection Test');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Status: ❌ Connection Failed');
        console.log('Error:', err.message);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    }
}

export {query,testDatabaseConnection};

//NOTE: createConnection
// 1. 매 요청마다(사용자 별로) 새로운 연결을 생성/종료
// 2. 연결 끊김 시 수동으로 재연결 필요
//NOTE: createPool 커넥션 풀 생성
// 1. 설정 갯수의 연결을 미리 생성하고 연결을 재사용하므로 
// 2. 연걸/생성 오버헤드가 줄어든다.
// 3. 연결 끊김 시 자동으로 재연결 진행