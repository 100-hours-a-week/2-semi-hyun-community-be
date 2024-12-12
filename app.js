//환경변수 로드 패키지 + dotenv.config(): 실제로 .env 파일을 읽음
import dotenv from 'dotenv'; dotenv.config();
import express from 'express';
import session from 'express-session';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { PORT, CORS_OPTIONS } from './server/config/express-config.js';

// ES 모듈에서 __dirname 사용하기 위한 설정
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = PORT;

//json 파싱 미들웨어
app.use(express.json());

//이미지 정적파일 제공
//NOTE: /images 경로를 통해 접근할 시 디렉토리에 저장된 이미지를 사용할 수 있다.
app.use('/images', express.static(path.join(__dirname, 'server/data/images')));

//cors 미들웨어 설정
app.use(cors(CORS_OPTIONS));

//세션 미들웨어 설정
app.use(session({
    secret: 'your_secret_key',   // 세션 암호화 키
    resave: false,               // 세션을 매번 저장할지 여부
    saveUninitialized: true,     // 초기화되지 않은 세션을 저장할지 여부 (true는 세션 생성 시 저장)
    cookie: { 
        secure: false,  // HTTPS에서만 쿠키를 사용할지 여부 (true는 HTTPS에서만 사용)
        httpOnly : true, // js로 쿠키 접근 금지
        maxAge: 24 * 60 * 60 * 1000 // 24시간
    }    
  }));


//MYSQL 연결
// const db = require('./server/models/db');


//로깅 설정
const loggingMiddleware = require('./server/Middlewares/loggingMiddleware');
app.use(loggingMiddleware);



//라우트 설정
import authRoutes from './server/Routes/authRoutes.js'; //폴더 경로
import dashboardRoutes from './server/Routes/dashboardRoutes.js';
import userRoutes from './server/Routes/userRoutes.js';


app.use('/api/v1/auth',authRoutes);
app.use('/api/v1/posts',dashboardRoutes);
app.use('/api/v1/users',userRoutes);


app.listen(port, () => {
  console.log(`--Backend Server Start-- ${new Date().toISOString()} - Port: ${port}`);
  });