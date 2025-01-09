import express from 'express';
import {postsUpload} from '../Service/multerConfig.js';
import dashboardController from '../Controllers/dashboardController.js';
import commentController from '../Controllers/commentController.js';
import authMiddleware from '../Middlewares/authMiddleware.js';

const router = express.Router();


//게시글 목록조회 - 데이터 조회
router.get('/data', authMiddleware, dashboardController.getDashboardData);

//게시글 추가
router.post('/',authMiddleware,postsUpload.single('image'),dashboardController.postAddPost);

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
export default router;