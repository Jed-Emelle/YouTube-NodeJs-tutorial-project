
const isADminUser = (req, res, next) => {
    if(req.userInfo.role !== 'admin'){
        return res.status(403).json({
            success: false,
            message: 'Acess denied! Admin rights required'
        })
    }
    next();
}

module.exports = isADminUser;