const nodemailer = require("nodemailer")
const { v4: uuidv4 } = require("uuid");
const config = require("../config/auth.config");
var jwt = require("jsonwebtoken");
const db = require("../models");
var bcrypt = require("bcryptjs");

const User = db.user;
const File = db.file;
const RefreshToken = db.refreshToken;

const random = require ("../metods/randStr.method")
const FileService = require("../services/file.service");
const {validationResult} = require("express-validator")

var saltRounds = 8

class AuthController {
  signup = async (req, res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
      return res.status(400).send({message: "Incorrect request", errors})
    }

    if (req.body.password === req.body.passwordConfirm) {
      const user = await User.create({
        username: req.body.username,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, saltRounds),
        jwtId: random.RandStr()
      })
      if(user) {
        console.log(user)
        user.setRoles([1])

        const file = await File.create({
          userId: user.id, name: user.username, type: 'dir', path: `\\${user.username}`
        })
        try {
          await FileService.createDir(file)
        } catch (e) {
          console.log(e.message)
          return res.status(500).send({message: "Server error"})
        }
        res.status(200).send({message: "User registered successfully!"});
      } else {
        return res.status(500).send("Something wrong")
      }
    } else {
      res.status(400).send({message: "Passwords don't match"})
    }
  };

  signin = async (req, res) => {
    const user = await User.findOne({where: {username: req.body.username}})
    if (!user) {
      return res.status(404).send({message: "User Not found."});
    }

    let passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
    if (!passwordIsValid) {
      res.status(401).send({accessToken: null, message: "Invalid Password!"});
    }

    let token = await jwt.sign({jwtId: user.jwtId}, config.secret, {expiresIn: config.jwtExpire});
    let expiredAt = new Date()
    expiredAt.setSeconds(expiredAt.getSeconds() + config.jwtRefreshExpire)
    let refreshToken = await RefreshToken.create({token: uuidv4(), userId: user.id, expiryDate: expiredAt.getTime()});

    let authorities = [];
    user.getRoles().then(roles => {
      for (let i = 0; i < roles.length; i++) {
        authorities.push("ROLE_" + roles[i].name.toUpperCase());
      }
      res.cookie('refreshToken', refreshToken.token, {maxAge: config.jwtRefreshExpire, httpOnly: true})
      return res.status(200).send({
        id: user.id,
        username: user.username,
        email: user.email,
        roles: authorities,
        accessToken: token,
        refreshToken: refreshToken.token
      });
    });
  };

  refreshToken = async (req, res) =>   {
    const {refreshToken: requestToken} = req.cookies;
    if (requestToken == null) {
      return res.status(403).json({ message: "Refresh Token is required!" });
    }
    try {
      let refreshToken = await RefreshToken.findOne({
        where: {token: requestToken.token}
      });
      if (!refreshToken) {
        res.status(403).json({ message: "Refresh token is not in database!" });
        return;
      }
      const user = await refreshToken.getUser();
      user.jwtId = random.RandStr()
      user.save()
      if (refreshToken.expiryDate.getTime() < new Date().getTime()) {
        RefreshToken.destroy({ where: { id: refreshToken.id } });
        res.clearCookie('refreshToken')
        return res.status(403).send({message: "Refresh token was expired. Please make a new signin request",});
      }
      let newAccessToken = jwt.sign({ jwtId: user.jwtId }, config.secret, {expiresIn: config.jwtExpire,});
      res.clearCookie('refreshToken')
      res.cookie('refreshToken', refreshToken, {maxAge: config.jwtRefreshExpire, httpOnly: true})
      return res.status(200).json({
        message: "token refreshed",
        accessToken: newAccessToken,
        refreshToken: refreshToken
      });
    } catch (err) {
      console.log(err)
      return res.status(500).send({ message: err });
    }
  };

  logout = (req, res) => {
    User.findOne({
      where: {
        id: req.userId
      }
    }).then(user => {
      if (!user) {
        return res.status(500).send({message: "user not found"})
      }
      user.jwtId = random.RandStr()
      RefreshToken.destroy({where: {
        userId: user.id
        }})
      res.clearCookie('refreshToken')
      res.status(200).send({message: "you've been signed out"})
    })
  };

  // passwordReset = async (req, res) => {
  //   User.findOne({
  //     where: {
  //       id: req.userId
  //     }
  //   }).then(async user => {
  //     if (!user) {
  //       return res.status(404).send({message: "user not found"})
  //     }
  //     if (req.body.email != user.email) {
  //       return res.status(400).send({message: "wrong email"})
  //     }
  //
  //     const salt = bcrypt.genSaltSync(8)
  //     const hash = bcrypt.hashSync(user.jwtId, salt);
  //
  //     let testAcc = await nodemailer.createTestAccount()
  //
  //     let transporter = nodemailer.createTransport({
  //       host: "smtp.ethereal.email",
  //       port: 587,
  //       secure: false,
  //       auth: {
  //         user: "tamara62@ethereal.email",
  //         pass: "fJUShud4jpbuMPFmve",
  //       },
  //     });
  //
  //     let info = await transporter.sendMail({
  //       from: '"shef" <shef@example.com>',
  //       to: user.email + ", " + user.email,
  //       subject: "Password reset",
  //       text: hash,
  //       html: hash
  //     })
  //     console.log(info)
  //     res.status(200).send({message: info})
  //   })
  // }
  //
  // confirmPassReset = (req, res) => {
  //   User.findOne({
  //     where: {
  //       id: req.userId
  //     }
  //   }).then(user => {
  //     if (!user) {
  //       return res.status(404).send({message: "user not found"})
  //     }
  //     var validToken = bcrypt.compareSync(
  //         req.body.confirm_token,
  //         user.jwtId
  //     );
  //
  //     if (!validToken) {
  //       return res.status(400).send({message: "wrong token"});
  //     }
  //
  //     user.password = bcrypt.hashSync(req.body.new_password, 8)
  //     user.save()
  //     res.status(200).send({message: "password changed"})
  //   })
  // }
}
module.exports = new AuthController();

