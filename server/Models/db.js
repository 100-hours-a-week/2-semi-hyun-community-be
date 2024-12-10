//NOTE: createConnection
// 1. 매 요청마다(사용자 별로) 새로운 연결을 생성/종료
// 2. 연결 끊김 시 수동으로 재연결 필요
//NOTE: createPool 커넥션 풀 생성
// 1. 설정 갯수의 연결을 미리 생성하고 연결을 재사용하므로 
// 2. 연걸/생성 오버헤드가 줄어든다.
// 3. 연결 끊김 시 자동으로 재연결 진행

const sql = require('mysql')
const dbConfig = require('./')

const pool = sql.createPool({

})