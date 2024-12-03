const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const app = express();
const port = 8080;

// form태그-data 파싱
app.use(express.urlencoded({ extended: true })); 

//json 파싱 미들웨어
app.use(express.json());

//cors 미들웨어 설정
app.use(cors({
  origin : 'http://localhost:3000', //프론트 서버 주소
  credentials : true
}));

//세션 미들웨어 설정
app.use(session({
    secret: 'your_secret_key',   // 세션 암호화 키
    resave: false,               // 세션을 매번 저장할지 여부
    saveUninitialized: true,     // 초기화되지 않은 세션을 저장할지 여부
    cookie: { 
        secure: false,  // HTTPS에서만 쿠키를 사용할지 여부 (true는 HTTPS에서만 사용)
        httpOnly : true, // js로 쿠키 접근 금지
        maxAge: 24 * 60 * 60 * 1000 // 24시간
    }    
  }));

//라우트 설정
const authRoutes = require('./routes/authRoutes'); //폴더 경로
const dashboardRoutes = require('./routes/dashboardRoutes');
const userRoutes = require('./routes/userRoutes');


app.use('/api/v1/auth',authRoutes);
app.use('/api/v1/posts',dashboardRoutes);
app.use('/api/v1/users',userRoutes);


app.listen(port, function () {
    console.log(`Server is running on http://localhost:${port}/api/v1/auth/login`)});