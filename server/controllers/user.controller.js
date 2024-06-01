const db = require("../models");
var bcrypt = require("bcryptjs");

const random = require ("../metods/randStr.method")

const Users = db.user;
const Roles = db.role;
const Post = db.post
const Comment = db.comment
const Like = db.like

const Op = db.Sequelize.Op;

class UserController {

  allUsers = (req, res) => {
    Users.findAll().then(user => {
      res.status(200).send(user)
    })
  }

  userById = (req, res) => {
    Users.findOne({
      where: {
        id: req.params.user_id
      }, include: [{
        model: Post,
        as: "posts"
      }],
      attributes: ["id", "username", "email"]
    }).then(user => {
      if (!user) {
        return res.status(404).send({message: "user not found"})
      }
      res.status(200).send(user)
    })
  }


  updateUserData = (req, res) => {
    Users.findOne({
      where: {
        id: req.params.user_id
      }
    }).then(user => {
      if (!user) {
        return res.status(404).send({message: "user not found"})
      }
      if (user.id !== req.userId) {
        if (req.isAdmin === false) {
          return res.status(403).send({message: "access denied"})
        }
      }
      if (req.body.username) {
        Users.findOne({
          where: {
            username: req.body.username
          }
        }).then(userCheckName => {
          if (!userCheckName) {
            user.username = req.body.username
            user.save()
          } else if (user.id === userCheckName.id) {
            user.username = req.body.username
            user.save()
          } else {
            return res.status(400).send({message: "username is already exist"})
          }
          if (req.body.email) {
            Users.findOne({
              where: {
                email: req.body.email
              }
            }).then(userCheckEmail => {
              if (!userCheckEmail) {
                user.email = req.body.email
                user.save()
              } else if (user.id === userCheckEmail.id) {
                user.email = req.body.email
                user.save()
              } else {
                return res.status(400).send({message: "email is already exist"})
              }
            })
          }
        })
      }
      user.save()
      res.status(200).send(user)
    })
  }

  createUser = (req, res) => {
    if (req.body.password === req.body.passwordConfirm) {
      Users.create({
        username: req.body.username,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 8),
        jwtId: random.RandStr()
      })
          .then(user => {
            if (req.body.roles) {
              Roles.findAll({
                where: {
                  name: {
                    [Op.or]: req.body.roles
                  }
                }
              }).then(roles => {
                user.setRoles(roles).then(() => {
                  res.send({message: "User registered successfully!", user});
                });
              });
            } else {
              user.setRoles([1]).then(() => {
                res.send({message: "User registered successfully!", user});
              });
            }
          })
          .catch(err => {
            res.status(500).send({message: err.message});
          });
    } else {
      res.send({message: "Passwords don't match"})
    }
  }

  delete = (req, res) => {
    Users.findOne({
      where: {
        id: req.params.user_id
      }
    }).then(user => {
      if (!user) {
        return res.status(404).send({message: "user not found"})
      }
      Comment.destroy({
        where: {
          userId: req.params.user_id
        }
      })
      const posts = Post.findAll({
        where: {
          userId: req.params.user_id
        }, include: {
          model: Comment,
          as: "comments"
        }
      })
      posts.map(elem => {
        elem.comments.forEach(comment => {
          Like.destroy({
            where: {
              commentId: comment.id
            }
          })
        })
        Comment.destroy({
          where: {
            postId: elem.id
          }
        })
        Like.destroy({
          where: {
            postId: elem.id
          }
        })
      })
      Post.destroy({
        where: {
          userId: req.params.user_id
        }
      })
      Users.destroy({
        where: {
          id: req.params.user_id
        }
      })
      res.status(200).send({message: "deleted"})
    })
  }

}

module.exports = new UserController();