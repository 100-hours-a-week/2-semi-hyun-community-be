import { deletePostImage } from '../Service/ImageHandler.js';
import {checkIP} from '../Service/View.js';
import PostModel from '../Models/PostModel.js';
import CommentModel from '../Models/CommentModel.js';
import LikeModel from '../Models/LikeModel.js';

const dashboardController = {
    // 게시글 권한 확인
    checkAuthorization: async (req, res) => {
        const { post_id } = req.params;
        const { user_id } = req.session.user;

        try {
            const isAuthorized = await PostModel.checkAuthorization(post_id, user_id);
            if (!isAuthorized) {
                return res.status(403).json({ message: '삭제 권한이 없습니다.' });
            }

            return res.status(200).json({ message: 'success' });
        } catch (error) {
            console.error('Error checking authorization:', error);
            return res.status(500).json({ message: 'internal_server_error' });
        }
    },

    // 게시글 목록 조회 - 데이터 조회
    getDashboardData: async (req, res) => {
        const { offset, limit } = req.query;
        try {
            const posts = await PostModel.getPosts(offset, limit);

            // 데이터가 없는 경우 빈 배열 반환
            if (!posts || posts.length === 0) {
                return res.status(200).json([]);
            }

            return res.status(200).json(posts);

        } catch (error) {
            console.error('게시글 목록 조회 오류:', error);
            return res.status(500).json({ message: 'internal_server_error' });
        }
    },

    // 게시글 상세 조회 - 데이터 조회
    getPostData: async (req, res) => {
        const { post_id } = req.params;
        const { user_id } = req.session.user;

        try {
            const post = await PostModel.getPostById(post_id);
            const comment = await CommentModel.getComment(post_id);
            const is_liked = await LikeModel.getLikeStatus(user_id,post_id);

            if (!post) {
                return res.status(404).json({ message: '게시글을 찾을 수 없습니다' });
            }

            //FIXME : 조회수 증가 추가 + req.ip로는 ip주소 get x
            /*
            if(checkIP(ip_address,post_id)){
                await PostModel.incrementView(post_id);
            }*/


            return res.status(200).json({
                post : post,
                comment : comment,
                is_liked : is_liked
            });

        } catch (error) {
            console.error('Error fetching post data:', error);
            return res.status(500).json({ message: 'internal_server_error' });
        }
    },

    //게시글 수정- 게시글 조회
    getEditPostData: async (req,res) => {
        const { post_id } = req.params;
        const { user_id } = req.session.user;

        try {
            const post = await PostModel.getPostById(post_id);

            if (!post) {
                return res.status(404).json({ message: '게시글을 찾을 수 없습니다' });
            }

            return res.status(200).json(post);

        } catch (error) {
            console.error('Error fetching post data:', error);
            return res.status(500).json({ message: 'internal_server_error' });
        }

    },

    // 게시글 추가
    // NOTE: 미들웨어+요청처리 -> 배열로 순서대로 처리
    postAddPost: async (req, res) => {
        const { title, content} = req.body;
        const { user_id } = req.session.user;

        // FIXME: 입력타입 검증
        if (!title || !content || !user_id) {
            return res.status(400).json({ message: 'missing_required_fields' });
        }

        try {
            const newPostId = await PostModel.addPost({
                title,
                content,
                user_id,
                imageFilename: req.file ? req.file.key : undefined
                });

            return res.status(201).json({
                message: 'post created successfully',
                post_id: newPostId
            });
        } catch (error) {
            console.error('Error creating post:', error);
            return res.status(500).json({ message: 'server_error' });
        }
    },

    // 게시글 수정 요청
    patchEditPost: async (req, res) => {
            const { post_id } = req.params;
            const { title, content, isImageDeleted } = req.body;

            try {
                // 이미지를 수정할 경우 / 이미지 삭제
                if (req.file || isImageDeleted) {

                    // 기존 이미지 삭제
                    const post_image = await PostModel.getPostImage(post_id);
                    if (post_image) {
                        await deletePostImage(post_image);
                    }

                    //사진만 삭제 -> DB 업데이트
                    if(isImageDeleted){
                        
                        await PostModel.updatePostImage(post_id);
                    }
                }

                // 게시글 수정
                const post = await PostModel.patchPost(post_id, {
                    title,
                    content,
                    post_image: req.file ? req.file.key : undefined
                });

                if (!post) {
                    return res.status(404).json({ message: 'post_not_found' });
                }

                // 수정 완료. send로 응답 보내기.
                return res.status(204).send();
            } catch (error) {
                console.error('Error patching post:', error);
                return res.status(500).json({ message: 'internal_server_error' });
            }
        },

    //FIXME : 사진만 삭제 수정 요청 API

    // 게시글 삭제
    deletePost: async (req, res) => {
        const { post_id } = req.params;
        const { user_id } = req.session.user;
        try {
                const isAuthorized = await PostModel.checkAuthorization(post_id, user_id);
            if (!isAuthorized) {
                return res.status(403).json({ message: '게시글 작성자만 삭제할 수 있습니다.' });
            }

            // 게시글 사진 삭제
            const post_image = await PostModel.getPostImage(post_id);
            
            if(post_image){
                await deletePostImage(post_image);
            }

            // 게시글 삭제
            const result = await PostModel.deletePost(post_id);
            if (!result) {
                return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
            }

            return res.status(200).json({ message: 'delete_success' });
        } catch (error) {
            console.error('Error deleting post:', error);
            return res.status(500).json({ message: 'internal_server_error' });
        }
    },

    // 좋아요 업데이트
    patchLike: async (req, res) => {
        const { post_id } = req.params;
        const { likes } = req.body;
        const { user_id } = req.session.user;

        try {
            //Note : (!likes)는 좋아요 취소할때 오류 발생
            if(likes === undefined || likes === null){
                return res.status(400).json({message: "likes field is required"});
            }
            const post = await LikeModel.patchLike(user_id, post_id, likes);

            if (!post) {
                return res.status(404).send();
            }

            return res.status(200).json({message: "likes_success"});

        } catch (error) {
            console.error('Error updating likes:', error);
            return res.status(500).json({ message: 'internal_server_error' });
        }
    }
};

export default dashboardController;