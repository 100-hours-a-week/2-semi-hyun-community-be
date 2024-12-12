const SignUp = require('../Service/SignUpJson');
const TimeStamp = require('../Service/TimeStamp');
const { v4 } = require('uuid');


// 로그인 처리
exports.postLogin = async (req, res) => {
    const { email, password } = req.body;

    // 데이터 유효성 검사
    // 1. 비밀번호 또는 이메일이 입력되지 않은 경우
    if (!email || !password) {
        return res.status(400).json({ message: '모든 필드를 입력해주세요.' });
    }

    try {
        const users = await SignUp.readUser(); // 비동기 작업 -> 목록 읽기 (프로미스가 해결될때까지 기다림)
        const user = users.find((user) => user.email === email); //없으면 undefined

        //if undefined = false
        if (!user) { 
            return res.status(401).json({
                message:'이메일이 존재하지 않습니다.'
            });
        }

        // 비밀번호 다시 입력
        // FIXME : 비밀번호 암호화 과정 + 비교 과정 필요
        if (user.password !== password) { 
            return res.status(401).json({
                message:'비밀번호를 다시 입력해주세요.'
            });
        }

        // --로그인 성공--
        // 사용자 세션 데이터 생성
        const sessionData = {
            user_id : user.user_id,
            name: user.name,
            email: user.email
        };

        // 세션에 사용자 정보 저장
        req.session.user = sessionData;

        //FIXME : 사용자 json 데이터 업데이트 -> 지금은 시간만 업데이트 하면 되서 안함
        // const updated_at = TimeStamp.getTime();

        //[Update] 세션 저장 후 응답
        req.session.save((err)=>{
            if(err){
                console.error('세션 저장 중 오류 발생:', err);
                return res.status(500).json({message: '세션 저장 중 오류가 발생했습니다.'});
            }

            res.status(200).json({
                message: '로그인을 성공했습니다.',
                data: { name: user.name, user_id: user.user_id }
            });

        });

    } catch (error) {
        console.error('로그인 처리 중 오류 발생:', error);
        return res.status(500).json({
            status: 'error',
            message: '로그인 중 오류가 발생했습니다.'
        });
    }
};


//회원가입 처리
exports.postSignUp = async (req, res) => {
    const { name, email, password, passwordCheck} = req.body; //입력한 정보 가져옴
    let userData;

    //데이터 유효성 검사
    //NOTE : 이미지 파일 -> req.file로 확인
    if (!name || !email || !password ||!passwordCheck || !req.file) { 
        return res.status(400).json({message:"모든 필드를 입력해주세요."});
    }
    if(password !== passwordCheck){
        return res.status(400).json({message:"비밀번호가 일치하지 않습니다."});
    }

    try {
        const users = await SignUp.readUser();
        
        //중복 이메일 검사
        if (users.find((user) => user.email === email)) {
            return res.status(409).json({message:"already_exist"});
        }
        
        // --회원가입 성공--

        userData = {
            user_id: v4(),
            name: name,
            email: email,
            password: password,
            image: req.file.filename,
            created_date: TimeStamp.getTime(),
            updated_date : TimeStamp.getTime()
        };
        users.push(userData); //새로운 사용자 추가
        await SignUp.writeUser(users); //덮어쓰기

        //성공 응답 -> 회원가입 완료 후 로그인 화면으로 리디렉션
        console.log('회원가입 성공, 응답 전송');
        res.status(201).json({
            status: 'success',
            message : '회원가입 완료. 로그인 화면으로 이동',
            data:{}
        });

        //1초 후 로그인 화면으로
        //setTimeout(() => {res.redirect('/login')}, 1000);

    } catch (error) {
        console.error('회원가입 처리 중 오류 발생:', error);
        res.status(500).json({
            status: 'error',
            message: '회원가입 중 오류가 발생했습니다.',
            data: null,
        });
    }
};

//로그아웃
exports.postLogout = (req,res) => {
    
    //세션이 있을경우
    //세션 삭제 완료 후 쿠키 제거
    if(req.session.user){
        //destroy:비동기작업
        req.session.destroy(err => {
            if(err){
                return res.status(500).json({message: '로그아웃 처리 중 오류가 발생했습니다.'});
            }

            //세션 쿠키 제거
            //NOTE : connect: 세션 미들웨어 이름 / sid: session id 
            res.clearCookie('connect.sid');
            return res.status(200).json({message : '로그아웃 되었습니다'});
        });
    }
    else{
        return res.status(200).json({message : '이미 로그아웃 되었습니다'});
    }


}