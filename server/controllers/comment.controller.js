const db = require("../models");
const Like = db.like
const Comment = db.comment

class CommentController {

    getComment = (req, res) => {
        Comment.findOne({
            where: {
                id: req.params.comment_id
            }, include: [{
                model: User,
                as: 'user',
                attributes: ["id", "username", "email"]
            }]
        }).then(comment => {
            if (!comment) {
                return res.status(404).send({message: "comment not found"})
            }
            res.status(200).send(comment)
        })
    }

    getLikesFromComment = (req, res) => {
        Comment.findOne({
            where: {
                id: req.params.comment_id
            }, include: [
                {
                    model: Like,
                    as: "likes"
                }
            ]
        }).then(comment => {
            if (!comment) {
                return res.status(404).send({message: "comment not found"})
            }
            res.status(200).send(comment.likes)
        })
    }

    createLike = (req, res) => {
        Like.findOne({
            where: {
                commentId: req.params.comment_id,
                userId: req.userId
            }
        }).then(found => {
            if (!found) {
                Comment.findOne({
                    where: {
                        id: req.params.comment_id
                    }
                }).then(comment => {
                    if (!comment) {
                        return res.status(404).send({message: "comment not found"})
                    }
                    Like.create({
                        type: req.body.type,
                        userId: req.userId,
                        commentId: req.params.comment_id
                    })
                    res.status(200).send({message: "like added"})
                })
            } else {
                return res.status(500).send({message: "you liked this comment"})
            }
        })
    }

    deleteLike = (req, res) => {
        Like.findOne({
            where: {
                commentId: req.params.comment_id,
                userId: req.userId
            }
        }).then(like => {
            if (!like) {
                res.status(404).send({message: "like not found"})
            } else {
                Like.destroy({
                    where: {
                        commentId: req.params.comment_id,
                        userId: req.userId
                    }
                })
                res.status(200).send({message: "like deleted"})
            }
        })
    }

    deleteComment = (req, res) => {
        Comment.findOne({
            where: {
                id: req.params.comment_id
            }
        }).then(async comment => {
            if (!comment) {
                return res.status(404).send({message: "comment not found"})
            }
            if (req.userId !== comment.userId) {
                if (req.isAdmin === false) {
                    return res.status(405).send({message: "you're not the author of this comment"})
                }
            }
            Like.destroy({
                where: {
                    commentId: comment.id
                }
            })
            let found_comments = await Comment.findAll({
                where: {
                    commentId: req.params.comment_id
                }
            })
            let comments
            comments.push(found_comment)
            let commentId = req.params.commentId
            while (found_comments) {
                comments.forEach(elem => async() => {
                    found_comments = await Comment.findAll({
                        where: {
                            commentId: elem.id
                        }
                    })
                    comments.push(found_comments)
                })
            }
            Comment.destroy({
                where: {
                    id: req.params.comment_id
                }
            })
            res.status(200).send({message: "comment deleted"})
        })

    }

    updateComment = (req, res) => {
        Comment.findOne({
            where: {
                id: req.params.comment_id
            }
        }).then(comment => {
            if (!comment) {
                return res.status(404).send({message: "post not found"})
            }
            if (comment.userId !== req.userId) {
                if (req.isAdmin === false) {
                    return res.status(405).send({message: "you're not the author of this post"})
                }
            }
            if (req.body.title) {
                comment.title = req.body.title
            }
            if (req.body.content) {
                comment.content = req.body.content
            }
            comment.save()
            res.status(200).send(comment)
        })
    }

    replyComment = (req, res) => {
        if(!req.body.content || req.body.content === ""){
            return res.status(400).send({message: "fill all fields"})
        }
        Comment.findOne({
            where: {
                id: req.params.comment_id
            }
        }).then(comment => {
            if(!comment) {
                return res.status(404).send({message: "comment not found"})
            }
            Comment.create({
                content: req.body.content,
                commentId: req.params.comment_id,
                userId: req.userId,
                postId: comment.postId
            }).then(reply => {
                if (!reply) {
                    return res.status(500).send({message: "something wrong"})
                }
                res.status(200).send({message: "comment added", comment})
            })
        })
    }
}

module.exports = new CommentController();