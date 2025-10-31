const jwt = require ('jsonwebtoken')

function validateHeader(req,res,next)
{
    let admin = req.get('x-auth');

    if(admin)
    {
        req.auth = admin;
        next();
    }else{
        req.auth = "Nuser"
        next();
    }
}

function validateUser(req, res, next)
{
    let header = req.get('x-token');

    if(!header)
    {
        res.status(403).send({error: "User required for this action"});
        return;
    }

    req.token = header;
    next();
}

function validateAdmin(req,res,next)
{
    let pass = '23423';

    if(req.auth == pass)
    {
        req.admin = true;
    }else{
        req.admin = false;
    }
    next();
}

function requireAdmin(req,res,next)
{
    let pass = '23423';

    if(req.token == pass)
    {
        req.admin = true;
        next()
        return
    }

    res.status(401).send({error: "You are not admin"});
}

function validateToken(req, res, next){
    let token = req.get('x-token')

    if(!token){
        res.status(401).send({error: "token is missing"})
        return;
    }

    jwt.verify(token, process.env.TOKEN_KEY, (err, decoded)=>{
        if(err){
            res.status(401).send({error: err.message})
            return
        }

        req.username= decoded.username;
        req._id = decoded._id;
        next()

    })

}

function validateTokenWithCookie(req, res, next){
    let token = req.cookies.access_token

    if(!token){
        res.status(401).send({error: "token is missing"})
        return;
    }

    jwt.verify(token, process.env.TOKEN_KEY, (err, decoded)=>{
        if(err){
            res.status(401).send({error: err.message})
            return
        }

        req.username= decoded.username;
        req._id = decoded._id;
        next()

    })

}

const addSkipLimittoGet = () => {
    return (req, res, next) => {
        // Puedes hacer lo que necesites con param1 y param2 aquí antes de llamar a next()
        req.skip = parseInt(req.query.skip) || 0; 
        req.limit = parseInt(req.query.limit) || 6;
        next();
    };
};


module.exports = {validateHeader, validateAdmin, requireAdmin, validateUser, validateToken, addSkipLimittoGet, validateTokenWithCookie}