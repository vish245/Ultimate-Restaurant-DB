// Jai Swaminarayan

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let orderSchema = Schema({
    username: { type: String, required: true },
    order: { type: Object, required: true }
});

// Create a collection called Movie with the schema that we created above
const Order = mongoose.model("Order", orderSchema); //* -> create a collection "user"
module.exports = Order;