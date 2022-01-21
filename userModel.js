const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let userSchema = Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    privacy: { type: Boolean, required: true },
});

// Create a collection called Movie with the schema that we created above
const User = mongoose.model("User", userSchema); //* -> create a collection "user"
module.exports = User;