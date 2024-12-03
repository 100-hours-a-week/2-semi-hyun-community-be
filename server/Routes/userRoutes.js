const express = require('express');
const router = express.Router(); 
const authMiddleware = require('../Middlewares/authMiddleware');
const userController = require('../Controllers/users/userController');

//회원정보 수정(닉네임) 페이지 로드
router.get('/me', authMiddleware, userController.getEditUser);

//회원정보 수정(닉네임) 데이터 조회
router.get('/me/data', authMiddleware, userController.getEditUserData);

//회원정보 수정 : 닉네임, 프로필 사진
router.patch('/me/user_info', authMiddleware, userController.patchUserInfo);

//회원정보 수정(비밀번호) 페이지 라우트
router.get('/me/password', authMiddleware, userController.getEditPassword);

//회원정보 수정 : 패스워드
router.patch('/me/password', authMiddleware, userController.patchPassword);

//회원정보 삭제
router.delete('/me',authMiddleware, userController.deleteUser);

//라우터 객체를 모듈로 내보내기
//NOTE: 다른 파일에서 라우터를 쉽게 가져와 사용할 수 있다. + 재사용성
module.exports = router; 