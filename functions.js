import jwt from "jsonwebtoken"


export function signUserToken(token, privKey = "secretkey"){
    return jwt.sign({userID: token }, privKey, {
        expiresIn: '72h',
        issuer: "Appclick-App",
        audience: "appclick-audience",
        subject: "user-auth"
    })
}


export function verifyUserToken(token, privKey="secretkey"){
    try {
        return jwt.verify(token, privKey, {
            issuer:"Appclick-App",
            audience:"appclick-audience",
            subject:"user-auth"
        })
    } catch(e){
        return false;
    }
}