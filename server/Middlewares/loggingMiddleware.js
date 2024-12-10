const loggingMiddleware = (req, res, next) => {

    const start = Date.now();

    //NOTE res.on : EventEmitter 패턴/ res에서 특정 이벤트가 발생했을 때 실행될 콜백 함수
    //NOTE 응답이 완료되었을 때 (finish)실행될 콜백 함수
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`--API request-- [${new Date().toISOString()}] ${req.method} ${req.url} Status: ${res.statusCode} - Duration: ${duration}ms`);
    });

    next();


};

module.exports = loggingMiddleware;
