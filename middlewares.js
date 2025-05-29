const jwt = require('jsonwebtoken')

function validarCookie(req, res, next){
    
    try{
        const token = req.cookies.Token
        const verificado = jwt.verify(token, process.env.SENHAJWT)

        if(!verificado){
        res.status(401).json({msg:'Token inválido'})
        return
    }
    next()

}catch (err) {
        res.status(401).json({ msg: 'Erro ao fazer login' })
    }
}

module.exports = { validarCookie }