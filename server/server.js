const express = require("express");
const cors = require("cors");
const fileUpload = require("express-fileupload")
const cookie = require("cookie-session")
const cookieParser = require("cookie-parser")

const app = express();

app.use(cookie({
  name: "session",
  keys:["COOKIE-SECRET"],
  httpOnly: true
}))
app.use(cookieParser())
app.use(fileUpload({}))
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const db = require("./models");
const Role = db.role;

db.sequelize.sync();

// db.sequelize.sync({force: true}).then(() => {
//   console.log('Drop and Resync Db');
//   initial();
// });


app.get("/", (req, res) => {
  res.status(200).send({ message: "Hello!" });
});
require('./routes/category.routes')(app);
require('./routes/post.routes')(app);
require('./routes/auth.routes')(app);
require('./routes/user.routes')(app);
require('./routes/comment.routes')(app);
require('./routes/file.routes')(app);


const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});


function initial() {
  Role.create({
    id: 1,
    name: "user"
  });
 
  Role.create({
    id: 2,
    name: "admin"
  });
}