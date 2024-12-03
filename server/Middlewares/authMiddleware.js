const authMiddleware = (req, res, next) => {

    //세션 존재 여부확인
    if (!req.session.user) {
        return res.status(401).send(`
            <script>
                alert("required_authorization");
                window.location.href = '/api/v1/auth/login';
            </script>
        `);
    }

    //req 객체에 사용자 정보 추가
    req.user = req.session.user;

    // 요청된 리소스의 사용자 ID와 현재 로그인한 사용자 ID 비교
    // const requestedUserId = req.params.userId || req.body.userId;
    
    // if (requestedUserId && req.session.user.id !== requestedUserId) {
    //     return res.status(403).send(`
    //         <script>
    //             alert("unauthorized_access");
    //             window.location.href = '/';
    //         </script>
    //     `);
    // }
    // console.log('인증 성공');
    next();
}

module.exports = authMiddleware;