const db = require("../models");
const FileService = require("../services/file.service");
const File = db.file
const Post = db.post
const Category = db.category
const Like = db.like
const Comment = db.comment
const User = db.user

const Op = db.Sequelize.Op;

class PostController {

    createPost = async (req, res) => {
        if (!req.body.title ||
            !req.body.content ||
            !req.body.categories) {
            res.status(400).send({message: "fill all fields"})
        } else {
            const post = await Post.create({
                title: req.body.title,
                content: req.body.content,
                status: req.body.status,
                userId: req.userId
            })
            if (req.body.categories) {
                const categories = await Category.findAll({
                    where: {
                        title: {
                            [Op.or]: req.body.categories
                        }
                    }
                })
                try {
                    await post.setCategories(categories)
                    let user = await User.findOne({where :{
                            id: req.userId
                        }
                    })
                    console.log(user)
                    let parent = await File.findOne({where : {
                                userId: req.userId,
                                name: user.username,
                                type: 'dir'
                            }
                        })
                    let path = parent.path  + '\\post_' + post.id
                    let file = await File.create({
                        userId: post.userId,
                        name: "post_" + `${post.id}`,
                        type: 'dir',
                        path: path,
                        postId: post.id
                    })
                    await FileService.createDir(file)
                } catch (e) {
                    console.log(e.message)
                    return res.send({message: "Server error"})
                }
                res.status(200).send({message: "post added", post})
            } else {
                res.status(400).send({message: "No selected category"})
            }
        }
    }

    createComment = async (req, res) => {
        if (!req.body.content) {
            res.status(400).send({message: "fill all fields"})
        } else {
            const post = await Post.findOne({
                where: {
                    id: req.params.post_id
                }
            })
            if (!post) {
                return res.status(404).send({message: "post not found"})
            }
            try {
                const comment = await Comment.create({
                    content: req.body.content,
                    postId: req.params.post_id,
                    userId: req.userId
                })
                res.status(200).send({message: "comment added", comment})
            } catch (e) {
                console.log(e.message)
                return res.send({message: "Server error"})
            }
        }
    }

    createLike = (req, res) => {
        Like.findOne({
            where: {
                postId: req.params.post_id,
                userId: req.userId
            }
        }).then(found => {
            if (!found) {
                Post.findOne({
                    where: {
                        id: req.params.post_id
                    }
                }).then(post => {
                    if (!post) {
                        return res.status(404).send({message: "post not found"})
                    }
                    Like.create({
                        type: req.body.type,
                        userId: req.userId,
                        postId: req.params.post_id
                    }).then(async like => {
                        let user = await User.findOne({where: {
                            id: post.userId
                            }})
                        if(!req.body.type){
                            return res.status(400).send({message: "wrong type"})
                        }
                        if (req.body.type === "like") {
                            post.likesCount += 1
                            user.raiting += 1
                        }
                        else if (req.body.type === "dislike") {
                            post.likesCount -= 1
                            user.raiting -= 1

                        }
                        post.save()
                        user.save()
                        return res.status(200).send({message: "like added", like})
                    })
                })
            } else {
                return res.status(500).send({message: "you liked this post"})
            }
        })
    }

    deleteLike = (req, res) => {
        Like.findOne({
            where: {
                postId: req.params.post_id,
                userId: req.userId
            }
        }).then(like => {
            if (!like) {
                return res.status(404).send({message: "like not found"})
            }
            var action = -1
            if (like.type === "like") {
                action = 1
            }
            Post.findOne({
                where: {
                    id: req.params.post_id
                }
            }).then(post => {
                post.likesCount -= action
                post.save()
            })
            Like.destroy({
                where: {
                    postId: req.params.post_id,
                    userId: req.userId
                }
            })
            res.status(200).send({message: "like deleted"})
        })
    }

    getLikesFromPost = (req, res) => {
        Post.findOne({
            where: {
                id: req.params.post_id
            }, include: [
                {
                    model: Like,
                    as: "likes",
                    include: [
                        {
                            model: User,
                            as: 'user',
                            attributes: ["id", "username", "email"]
                        }
                    ]
                }
            ]
        }).then(post => {
            if (!post) {
                return res.status(404).send({message: "post not found"})
            }
            res.status(200).send(post.likes)
        })
    }

    getCommentsFromPost = (req, res) => {
        Post.findOne({
            where: {
                id: req.params.post_id
            }, include: [
                {
                    model: Comment,
                    as: "comments",
                    include: [
                        {
                            model: User,
                            as: 'user',
                            attributes: ["id", "username", "email"]
                        }
                    ]
                }
            ]
        }).then(post => {
            if (!post) {
                return res.status(404).send({message: "post not found"})
            }
            res.status(200).send(post.comments)
        })
    }

    getCategoriesFromPost = (req, res) => {
        Post.findOne({
            where: {
                id: req.params.post_id
            }, include: [
                {
                    model: Category,
                    as: "categories"
                }
            ]
        }).then(post => {
            if (!post) {
                return res.status(404).send({message: "post not found"})
            }
            res.status(200).send(post.categories)
        })
    }

    getAllPosts = (req, res) => {
        if (req.body.filterBy) {
            if (req.body.filterBy.category) {
                Post.findAll(
                    {
                        include: [
                            {
                                model: Category,
                                as: 'categories',
                                where: {
                                    title: req.body.filterBy.category
                                }
                            },
                            {
                                model: User,
                                as: 'user',
                                attributes: ["id", "username", "email"]
                            }
                        ]
                    },
                    {
                        order:
                            [
                                ["likesCount", "DESK"]
                            ]
                    },
                ).then(post => {
                    if (!post) {
                        return res.status(404).send({message: "posts not found"})
                    }
                    res.status(200).send(post)
                })
            }
        } else if (req.body.sortOption) {
            if (req.body.sortOrder) {
                Post.findAll(
                    {
                        include: [
                            {
                                model: Category,
                                as: 'categories',
                            },
                            {
                                model: User,
                                as: 'user',
                                attributes: ["id", "username", "email"]
                            }
                        ]
                    },
                    {order: [[req.body.sortOption, req.body.sortOrder]]}).then(post => {
                    return res.status(200).send(post)
                })
            }
            Post.findAll(
                {
                    include: [
                        {
                            model: Category,
                            as: 'categories',
                        },
                        {
                            model: User,
                            as: 'user',
                            attributes: ["id", "username", "email"]
                        }
                    ]
                }, {order: [[req.body.sortOption, "DESC"]]}).then(post => {
                return res.status(200).send(post)
            })
        } else {
            Post.findAll(
                {
                    include: [
                        {
                            model: Category,
                            as: 'categories',
                        },
                        {
                            model: User,
                            as: 'user',
                            attributes: ["id", "username", "email"]
                        }
                    ]
                },
                {order: [["createdAt", "DESC"]]}).then(post => {
                res.status(200).send(post)
            })
        }
    }

    getPost = (req, res) => {
        Post.findOne({
            where: {
                id: req.params.post_id
            },
            include: [
                {
                    model: Category,
                    as: 'categories',
                },
                {
                    model: User,
                    as: 'user',
                    attributes: ["id", "username", "email"]
                },
                {
                    model: File,
                    as: "files",
                    where:{
                        type: {
                            [Op.ne]: "dir"
                        }
                    }
                }
            ]
        }).then(post => {
            if (!post) {
                return res.status(404).send({message: "not found"})
            }
            res.status(200).send(post)
        })
    }

    getFilesFromPost = async (req, res) => {
        try {
            let post = await Post.findOne({
                where: {
                    id: req.params.post_id
                },
                include: [
                    {
                        model: File,
                        as: "files",
                        where:{
                            type: {
                                [Op.ne]: "dir"
                            }
                        }
                    }
                ]
            })
            if(post) {
                return res.status(200).send(post.files)
            } else {
                return res.status(404).send({message: "post not found"})
            }
        } catch (e) {
            console.log(e)
            return res.status(500).send({message: "Server error"})
        }
    }

    deletePost = (req, res) => {
        Post.findOne({
            where: {
                id: req.params.post_id
            }, include: [
                {
                    model: Comment,
                    as: "comments"
                },
                {
                    model: File,
                    as: 'files'
                }
            ]
        }).then(post => {
            if (!post) {
                return res.status(404).send({message: "post not found"})
            }
            if (post.userId !== req.userId) {
                if (req.isAdmin === false) {
                    return res.status(405).send({message: "you're not admin or author of this post"})
                }
            }
            Like.destroy({
                where: {
                    postId: post.id
                }
            }).catch(err => {
                return res.status(500).send({message: err.message})
            })
            post.comments.forEach(elem => {
                Like.destroy({
                    where: {
                        commentId: elem.id
                    }
                }).catch(err => {
                    return res.status(500).send({message: err.message})
                })
            })
            Comment.destroy({
                where: {
                    postId: post.id
                }
            }).catch(err => {
                return res.status(500).send({message: err.message})
            })
            File.findAll({
                where: {
                    postId: req.params.post_id
                },
                order: [
                    ["id", "DESC"]
                ]
            }).then(files => {
                console.log(files)
                files.forEach(elem => {
                    FileService.deleteFile(elem)
                    File.destroy({
                        where:{
                            id: elem.id
                        }
                    })
                })
            }).catch(err => {
                return res.status(500).send({message: err.message})
            })
            Post.destroy({
                where: {
                    id: post.id
                }
            }).catch(err => {
                return res.status(500).send({message: err.message})
            })
            return res.status(200).send("deleted")
        })
    }

    updatePost = (req, res) => {
        Post.findOne({
            where: {
                id: req.params.post_id
            }, include: [
                {
                    model: Category,
                    as: 'categories'
                }
            ]
        }).then(post => {
            if (!post) {
                return res.status(404).send({message: "post not found"})
            }
            if (post.userId !== req.userId) {
                if (req.isAdmin === false) {
                    return res.status(405).send({message: "you're not the author of this post"})
                }
            }
            if (req.body.title) {
                post.title = req.body.title
            }
            if (req.body.content) {
                post.content = req.body.content
            }
            if (req.body.categories) {
                Category.findAll({
                    where: {
                        title: {
                            [Op.or]: post.categories.title
                        }
                    }
                }).then(found => {
                    post.removeCategories(found)
                })

                Category.findAll({
                    where: {
                        title: {
                            [Op.or]: req.body.categories
                        }
                    }
                }).then(category => {
                    post.setCategories(category)
                })
            }
            if (req.body.status) {
                post.status = req.body.status
            }
            post.save()
            return res.status(200).send({message: "post updated", post})
        })
    }
}

module.exports = new PostController();