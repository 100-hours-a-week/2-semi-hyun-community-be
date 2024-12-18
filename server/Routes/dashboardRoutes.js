const express = require('express');
const router = express.Router();
const dashboardController = require('../Controllers/dashboardController');
const commentController = require('../Controllers/commentController');
const authMiddleware = require('../Middlewares/authMiddleware');


//게시글 목록조회 - 데이터 조회
router.get('/data', authMiddleware, dashboardController.getDashboardData);

//게시글 추가
router.post('/',authMiddleware,dashboardController.postAddPost);

//게시글 상세조회 - 데이터 조회 + 게시글 수정 - 데이터 조회
router.get('/:post_id/data',authMiddleware,dashboardController.getPostData);

//게시글 권한 확인
router.get('/:post_id/check',authMiddleware,dashboardController.checkAuthorization);

//게시글 수정 요청
router.patch('/:post_id',authMiddleware,dashboardController.patchEditPost);

//게시글 삭제
router.delete('/:post_id',authMiddleware,dashboardController.deletePost);

//댓글 등록
router.post('/:post_id/comments',authMiddleware,commentController.addComment);

//댓글 수정
router.patch('/:post_id/comments/:comment_id',authMiddleware,commentController.editComment);

//댓글 삭제
router.delete('/:post_id/comments/:comment_id',authMiddleware,commentController.deleteComment);

//좋아요 업데이트
router.patch('/:post_id/like',authMiddleware,dashboardController.patchLike);


//NOTE: 라우터 객체를 모듈로 내보내기 -> 주서버에 모두 작성하지 않아도됨
module.exports = router;