const db = require("../models");
const Role = db.role
const User = db.user

const Op = db.Sequelize.Op;

class RoleController {

    createRole = async (req, res) => {
        if (!req.body.name) {
            return res.status(400).send({message: "fill all fields"})
        }
        try {
            let role = await Role.findOne({
                where: {name: req.body.name}
            })
            if (role) {
                return res.status(400).send({message: "role already exists"})
            }
            await Role.create({
                name: req.body.name,
            })
            return res.status(200).send({message: "Role created", role})
        } catch (e) {
            console.log(e)
            return res.status(500).send({message: "Server error"})
        }
    }

    getRoles = async (req, res) => {
        try {
            let roles = await Role.findALL()
            return res.status(200).send(roles)
        } catch (e) {
            console.log(e)
            return res.status(500).send({message: "Server error"})
        }
    }

    addRoleToUser = async (req, res) => {
        if(!req.body.roles){
            return res.status(400).send({message: "fill all fields"})
        }
        try {
            const roles = await Role.findAll({
                where: {
                    name: {
                        [Op.or]: req.body.roles
                    }
                }
            })
            let user = await User.findOne({
                where: {id: req.params.user_id}
            })
            user.setRoles(roles)
            return res.status(200).send({message: "Roles were added to user"})
        } catch (e) {
            console.log(e)
            return res.status(500).send({message: "Server error"})
        }
    }
}

module.exports = new RoleController();