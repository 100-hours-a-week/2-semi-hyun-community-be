import express from 'express';
import {profileUpload} from '../Service/multerConfig.js';
import authMiddleware from '../Middlewares/authMiddleware.js';
import userController from '../Controllers/userController.js';

const router = express.Router();

//FIXME: 필요없으면 삭제
//프로필 사진 조회
router.get('/:user_id/profile', authMiddleware, userController.getProfileImage);

//회원정보 수정(닉네임) 데이터 조회
router.get('/me/data', authMiddleware, userController.getEditUserData);

//회원정보 수정 : 닉네임, 프로필 사진
router.patch('/me/user_info', authMiddleware, profileUpload.single('image'), userController.patchUserInfo);


//회원정보 수정 : 패스워드
router.patch('/me/password', authMiddleware, userController.patchPassword);

//회원 탈퇴
router.delete('/me',authMiddleware, userController.deleteUser);

// 회원정보 수정(비밀번호) 페이지 라우트
router.get('/me/header_image', authMiddleware, userController.getHeaderImage);

//라우터 객체를 모듈로 내보내기
//NOTE: 다른 파일에서 라우터를 쉽게 가져와 사용할 수 있다. + 재사용성
export default router; 