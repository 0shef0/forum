const db = require("../models");
const FileService = require("../services/file.service");
const File = db.file
const Post = db.post
const Comment = db.comment
const User = db.user
const fs = require('fs')
const config = require ("../config/db.config")

class FileController {
    uploadFile(req, res) {
        if(!req.files || !req.files.file){
            return res.status(401).send({message: "files are missing"})
        }
        if(!req.params.post_id){
            return res.status(401).send({message: "wrong link"})
        }
        Post.findOne({
            where:{
                id: req.params.post_id
            }, include: [{
                model: User,
                as: "user"
            }]
        }).then(async post => {
            if(post) {
                if (post.userId !== req.userId) {
                        return res.status(405).send({message: "you're not author of this post"})
                    }
                try {
                    const file = req.files.file

                    let parent = await File.findOne({
                        where: {
                            userId: req.userId,
                            postId: req.params.post_id,
                            type: 'dir'
                        }
                    })
                    let path = `${config.filePath}${parent.path}\\${file.name}`

                    if (fs.existsSync(path)) {
                        return res.status(400).json({message: 'File already exist'})
                    }

                    file.mv(path)

                    const type = file.name.split('.').pop()
                    let filePath = file.name
                    if (parent) {
                        filePath = parent.path + "\\" + file.name
                    }
                    let dbFile = await File.create({
                        name: file.name,
                        type: type,
                        size: file.size,
                        path: filePath,
                        userId: post.user.id,
                        postId: post.id
                    });
                    parent.size += file.size
                    parent.save()
                    return res.status(200).send({message: "file uploaded", dbFile})

                } catch (e) {
                    console.log(e)
                    return res.status(500).send({message: "Upload error"})
                }
            } else {
                return res.status(500).send({message: "post not found"})
            }
        })

    }

    async downloadFile(req, res) {
        try {
            const file = await File.findOne({where: {
                    id: req.params.file_id,
                    postId : req.params.post_id
                }
            })
            const path = FileService.getPath(file)
            if (fs.existsSync(path)) {
                return res.status(200).download(path, file.name)
            }
            return res.status(400).send({message: "Download error"})
        } catch (e) {
            console.log(e)
            return res.status(500).send({message: "Download error"})
        }
    }

    async deleteFile (req, res) {
        try {
            let file = await File.findOne({
                where: {
                    id: req.params.file_id
                }
            })
            if(!file){
                return res.status(400).send("file not found")
            }
            if (file.userId !== req.userId) {
                if (req.isAdmin === false) {
                    return res.status(405).send({message: "you're not admin or author of this post"})
                }
            }
            if(file.path === `\\`+file.name){
                return res.status(405).send({message: "you can't delete this directory"})
            }
            FileService.deleteFile(file)
            File.destroy({where: {
                id: req.params.file_id
                }
            })
            return res.status(200).send({message: "file was deleted"})
        } catch (e) {
            console.log(e)
            return res.status(500).send({message: "Server error"})
        }
    }
}

module.exports = new FileController()