//로그인, 회원가입 라우트트 설정하는 파일
import express from 'express';
//NOTE: express.Router 라우터 객체 생성 -> 라우터를 하나로 그룹화
// ㄴ라우터를 모듈화 하고 구조적으로 관리 가능
import {profileUpload} from '../Service/multerConfig.js';
import authController from '../Controllers/authController.js';

const router = express.Router(); 


//로그인 처리 (POST)
router.post('/login',authController.postLogin);

//회원가입 처리 라우트 (POST)
router.post('/signUp',profileUpload.single('image'),authController.postSignUp);

//이메일 중복 체크 라우트 (POST)
router.post('/check-email',authController.postCheckEmail);

//닉네임 중복 체크 라우트 (POST)
router.post('/check-name',authController.postCheckName);

//로그아웃 라우트
router.post('/logout', authController.postLogout);


//라우터 객체를 모듈로 내보내기
//NOTE: 다른 파일에서 라우터를 쉽게 가져와 사용할 수 있다. + 재사용성
export default router; 
