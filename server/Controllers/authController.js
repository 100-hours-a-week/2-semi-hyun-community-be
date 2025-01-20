import UserModel from '../Models/UserModel.js';
import bcrypt from 'bcrypt';
import { v4 } from 'uuid';

// 객체 리터럴 패턴
const authController = {

    // 로그인 처리
    postLogin: async (req, res) => {
        const { email, password } = req.body;

        // 데이터 유효성 검사
        // 1. 비밀번호 또는 이메일이 입력되지 않은 경우
        if (!email || !password) {
            return res.status(400).json({ message: '모든 필드를 입력해주세요.' });
        }
    
        try {
            const user = await UserModel.getUserByEmail(email);
    
            // if undefined = false
            if (!user) { 
                return res.status(401).json({
                    message: '이메일이 존재하지 않습니다.'
                });
            }
    
            // 비밀번호 비교 (bcrypt 사용)
            const isPasswordValid = await bcrypt.compare(password, user.password);

            if(!isPasswordValid){
                return res.status(401).json({
                    message: '비밀번호를 다시 입력해주세요.'
                });
            }
    
            // --로그인 성공--
            // 사용자 세션 데이터 생성
            const sessionData = {
                user_id: user.user_id,
                name: user.name,
                email: user.email
            };
    
            // 세션에 사용자 정보 저장
            req.session.user = sessionData;
    
            //로그인 시간 업데이트
            await UserModel.updateLoginTime(user.user_id);
    
            //[Update] 세션 저장 후 응답
            req.session.save((err) => {
                if (err) {
                    console.error('세션 저장 중 오류 발생:', err);
                    return res.status(500).json({ message: '세션 저장 중 오류가 발생했습니다.' });
                }
    
                res.status(200).json({
                    message: '로그인을 성공했습니다.',
                    name : user.name,
                });
            });
    
        } catch (error) {
            console.error('로그인 처리 중 오류 발생:', error);
            return res.status(500).json({
                status: 'error',
                message: '로그인 중 오류가 발생했습니다.'
            });
        }
    },

    // 회원가입 처리
    postSignUp: async (req, res) => {
        const { name, email, password, passwordCheck } = req.body; // 입력한 정보 가져옴
        let userData;

        // 데이터 유효성 검사
        // NOTE : 이미지 파일 -> req.file로 확인
        if (!name || !email || !password || !passwordCheck || !req.file) { 
            return res.status(400).json({ message: "모든 필드를 입력해주세요." });
        }
        if (password !== passwordCheck) {
            return res.status(400).json({ message: "비밀번호가 일치하지 않습니다." });
        }

        try {
            // FIXME : 이메일 중복 검사를 회원가입 요청 전에 처리
            // 비밀번호 해싱
            const hashedPassword = await bcrypt.hash(password,10);

            // --회원가입 성공--
            userData = {
                user_id: v4(),
                name,
                email,
                password: hashedPassword,
                profile_image: req.file.filename,
            };

            await UserModel.addUser(userData);

            // 성공 응답 -> 회원가입 완료 후 로그인 화면으로 리디렉션
            res.status(201).json({
                //FIXME: status,data 필요없으면 삭제
                status: 'success',
                message: '회원가입 완료. 로그인 화면으로 이동',
                data: {}
            });

        } catch (error) {
            console.error('회원가입 처리 중 오류 발생:', error);
            res.status(500).json({
                status: 'error',
                message: '회원가입 중 오류가 발생했습니다.',
                data: null,
            });
        }
    },

    // 로그아웃
    postLogout: (req, res) => {
        // 세션이 있을 경우
        // 세션 삭제 완료 후 쿠키 제거
        if (req.session.user) {
            // destroy: 비동기 작업
            req.session.destroy(err => {
                if (err) {
                    return res.status(500).json({ message: '로그아웃 처리 중 오류가 발생했습니다.' });
                }

                // 세션 쿠키 제거
                // NOTE : connect: 세션 미들웨어 이름 / sid: session id 
                res.clearCookie('connect.sid');
                return res.status(200).json({ message: '로그아웃 되었습니다' });
            });
        } else {
            return res.status(200).json({ message: '이미 로그아웃 되었습니다' });
        }
    },

    // 이메일 중복 체크
    postCheckEmail: async (req, res) => {
        const { email } = req.body;

        try{
            const isDuplicate = await UserModel.checkEmail(email);
            return res.status(200).json({ isDuplicate });

        }catch(error){
            console.error('이메일 중복 체크 오류:', error);
            return res.status(500).json({ message: '이메일 중복 체크 중 오류가 발생했습니다.' });
        }
    },

    // 닉네임 중복 체크
    postCheckName: async (req, res) => {
        const { name } = req.body;

        try{
            const isDuplicate = await UserModel.checkName(name);
            return res.status(200).json({ isDuplicate });

        }catch(error){
            console.error('이메일 중복 체크 오류:', error);
            return res.status(500).json({ message: '이메일 중복 체크 중 오류가 발생했습니다.' });
        }
    }
};

export default authController;