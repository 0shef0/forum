const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const db = require("../models");
const User = db.user;

const { TokenExpiredError } = jwt

verifyToken = (req, res, next) => {
  let token = req.headers.authorization.split(' ')[1];
  if (!token) {
    return res.status(403).send({message: "No token provided!"});
  }

  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      if (err instanceof TokenExpiredError) {
        return res.status(401).send({message: "Unauthorized! Token expired"})
      } else {
        return res.status(401).send({message: "Unauthorized!"});
      }
    }
    User.findOne({where: {jwtId: decoded.jwtId}}).then(user => {
    if(user) {
        req.userId = user.id;
        next();
    } else {
        return res.status(401).send({ message: "Unauthorized!" });
    }
  })
});
};

checkAdmin = (req, res, next) => {
  if(req.isAdmin === false) {
     return res.status(500).send({message: "Require admin role"})
  } else {
    next()
  }
}

isAdmin = (req, res, next) => {
  User.findByPk(req.userId).then(user => {
    user.getRoles().then(roles => {
      for (let i = 0; i < roles.length; i++) {
        if (roles[i].name === "admin") {
          req.isAdmin = true
          next();
        } else {
          req.isAdmin = false
          next();
        }
      }
    });
  });
};

const authJwt = {
  verifyToken: verifyToken,
  isAdmin: isAdmin,
  checkAdmin: checkAdmin
};
module.exports = authJwt;
