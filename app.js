import express from 'express';
import dotenv from 'dotenv';
import session from 'express-session';
import helmet from 'helmet';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

//환경변수 로드
const env = process.env.NODE_ENV || 'development';

dotenv.config({ path: `server/config/.env.${env}`});


// ES 모듈에서 __dirname 사용하기 위한 설정
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const app = express();
const port = 3000;

//cors 미들웨어 설정
app.use(cors(
  {
    origin : process.env.CORS_ORIGIN,
    credentials : true
  }
));

//보안 미들웨어 설정
app.use(helmet({

  //CSP 설정
  contentSecurityPolicy: {
    directives: {
      "default-src": ["'self'", "http://localhost:8081"],
      "script-src": ["'self'", "'unsafe-inline'", "http://localhost:8081"], 
      "style-src": ["'self'", "'unsafe-inline'", "http://localhost:8081"],
      "img-src": ["'self'", "data:", "http://localhost:8081"]
    }
  },

  // X-Frame-Options 설정
  frameguard :{
    action: "deny" //프레임에서 렌더링 완전 차단
  },

  noSniff : true, // MIME 타입 스니핑 방지

  crossOriginResourcePolicy: {
    policy: "cross-origin" // 프론트-백엔드 통신 허용
  }

}));

//json 파싱 미들웨어
app.use(express.json());

//이미지 정적파일 제공
//NOTE: /images 경로를 통해 접근할 시 디렉토리에 저장된 이미지를 사용할 수 있다.
app.use('/images', express.static(path.join(__dirname, 'server/data/images')));

//세션 미들웨어 설정
app.use(session({
    secret: process.env.SESSION_SECRET,   // 세션 암호화 키
    resave: false,               // 세션을 매번 저장할지 여부
    saveUninitialized: true,     // 초기화되지 않은 세션을 저장할지 여부 (true는 세션 생성 시 저장)
    cookie: { 
        secure: false,  // HTTPS에서만 쿠키를 사용할지 여부 (true는 HTTPS에서만 사용)
        httpOnly : true, // js로 쿠키 접근 금지
        maxAge: 86400000 // 24시간, 문자열->숫자
    }    
  }));


//MYSQL 연결
import { testDatabaseConnection } from './server/Models/Connect_DB.js'; // db 모듈에서 query 함수 임포트

testDatabaseConnection();

//로깅 설정
import loggingMiddleware from './server/Middlewares/loggingMiddleware.js';
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