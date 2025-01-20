import mysql from 'mysql2';
import dotenv from 'dotenv'; 
import { join } from 'path';

//환경변수 로드
dotenv.config({path:join(process.cwd(), 'server', 'config', '.env')});

//환경 변수 - DB 설정 가져오기
const { DB_HOST, DB_USER, DB_PASSWORD, DB_PROD, DB_PORT, DB_TEST } = process.env;

//DB 연결 풀 생성
const pool = mysql.createPool({
    connectionLimit: 10, // 필요에 따라 조정
    host : DB_HOST,
    user : DB_USER,
    password : DB_PASSWORD,
    database : DB_PROD,//[24.12.19]테스트 스키마 사용
    port : DB_PORT
}).promise();

//쿼리 실행 함수
//NOTE: mysql2 : promise 기본 지원
//NOTE: mysql은 쿼리결과를 [rows,field] 형태로 반환. result[0]:rows, result[1]:field(column)
const query = async(sql, values) => {
    try{
        const result = await pool.query(sql, values);
        //rows만 반환
        return result[0];
    }catch(error){
        console.error('쿼리 실행 오류:', error);
        //함수를 호출한 곳의 catch 블록으로 오류 전달
        throw error; 
    }
};

const testLog = ()=> {
    // 연결 설정 디버깅
console.log(
    join(process.cwd(), 'server', 'config', '.env'),
    'DB Connection Config:', {
    host: DB_HOST,
    user: DB_USER,
    database: DB_TEST,
    port: DB_PORT
    // password는 보안상 출력하지 않음
});
}

// DB 연결 테스트
async function testDatabaseConnection() {
    try {
        // const results = await query('SELECT 1 + 1 AS solution');
        const results = await query('show tables');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📦 Database Connection Test');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Status: ✅ Connected');
        console.log('Test Query Result:', results);
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

export {pool,query,testDatabaseConnection,testLog};

//NOTE: createConnection
// 1. 매 요청마다(사용자 별로) 새로운 연결을 생성/종료
// 2. 연결 끊김 시 수동으로 재연결 필요
//NOTE: createPool 커넥션 풀 생성
// 1. 설정 갯수의 연결을 미리 생성하고 연결을 재사용하므로 
// 2. 연걸/생성 오버헤드가 줄어든다.
// 3. 연결 끊김 시 자동으로 재연결 진행