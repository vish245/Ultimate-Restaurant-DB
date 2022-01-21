// Jai Swaminarayan

// Express
const express = require('express');
const app = express();

// Models
const User = require("./userModel");
const Orders = require("./orderModel");

// Pug
const pug = require('pug');

// Express-session
const session = require('express-session');

// Mongoose and MongoDB
const mongoose = require('mongoose');
const MongoDBStore = require('connect-mongo');

// Path
const path = require("path");
const res = require('express/lib/response');

// SETTING SESSION STORE
const store = new MongoDBStore({
    mongoUrl: 'mongodb://localhost/a4',
    collection: 'sessions'
});
store.on('error', (error) => { console.log(error) });

// Middleware
app.use(express.json());
app.set("views");
app.set("view engine", "pug");
app.use(express.urlencoded({ extended: true }));

app.use(
    session({
        name: 'a4-sessions',
        secret: "some secret key",
        store: store,
        resave: true, // saves the session after ever request
        saveUninitialized: false, // stores the session if it hasn't been stored
    })
);

// Setting up the routes
app.get("/", loadHomePage);
app.get("/home", loadHomePage);
app.get("/users", userPage);
app.get("/register", registerPage);
app.post("/register", createUser)
app.get("/login", loginPage);
app.post("/login", registerLogin);
app.get("/orders", orderForm);
app.get("/logout", logoutUser);
app.get("/users/:userID", userProfile);
app.get("/users?name=", searchUser);
app.post("/users/:userID", userStatus);
app.get("/orderform.js", function(req, res) {
    res.sendFile(__dirname + "/" + "orderform.js");
});

app.get("/add.png", function(req, res) {
    res.sendFile(__dirname + "/" + "add.png");
});
app.get("/remove.png", function(req, res) {
    res.sendFile(__dirname + "/" + "remove.png");
});
app.post("/orders", receiveOrder);
app.get("/orders/:orderID", getOrder);

// Route functionality
function loadHomePage(request, response) {
    response.status(200).render("home", {
        login: request.session.loggedIn,
        userID: request.session.userID

    });
}

function userPage(request, response) {
    User.find().exec((err, results) => {
        if (err) console.log(err);
        console.log(results)
        response.render("users", {
            users: results,
            login: request.session.loggedIn,
            userID: request.session.userID
        })
    });
}

function registerPage(request, response) {

    response.status(200).render("register", {
        login: request.session.loggedIn,
        userID: request.session.userID
    });
}

function createUser(request, response) {
    // get response from user by request.body

    console.log(request.body);
    const { username, password } = request.body;
    // ADD BOOLEAN -> for handling duplication
    let isAddedBefore = false;
    User.findOne({ username: username }).exec((err, results) => {
        if (err) console.log(err);
        if (results !== null) {
            // handle displaying duplication message.
            isAddedBefore = true;
            response.status(401).render("register", {
                isAdded: isAddedBefore
            })
        } else {

            request.session.loggedIn = true;
            User.create({ username: username, password: password, privacy: false }, function(err, result) {
                if (err) return handleError(err);
                console.log("This is the new user",
                    result);
                request.session.userID = result._id;
                response.status(200).render("userProfile", {
                    login: request.session.loggedIn,
                    username: result.username,
                    isLoggedInUser: true,
                    currentUser: result._id,
                    orders: []
                });
            });
        }
    });

    User.findOne({ username: username }).exec((err, result) => {
        if (err) { console.log(err); }
        console.log(result);
    });
}

function registerLogin(request, response) {
    if (request.session.loggedIn) {
        response.status(200).send("Already logged in.");
        return;
    } else {

        const { username, password } = request.body;
        console.log(request.body);

        User.findOne({
            username: username
        }).exec((err, result) => {
            if (result !== null) {
                if (result.username === username && result.password === password) {
                    request.session.loggedIn = true;
                    request.session.username = username;
                    request.session.password = password;
                    request.session.userID = result._id;
                    request.session.privacy = result.privacy;

                    // redirect to home page 
                    response.redirect("home");
                    return;
                    // -> create orderform link, logout link, userProfile link

                } else {
                    request.session.loggedIn = false;
                    response.status(403).send("Invalid credentials");
                    // send user does not exist alert
                    return;
                }
            } else {
                request.session.loggedIn = false;
                response.status(404).send("User does not exist");
                return;
            }
        });
        response.status(200);
    }
}

function loginPage(request, response) {

    response.status(200).render("login", {
        login: request.session.loggedIn,
        userID: request.session.userID

    });
}

function logoutUser(request, response) {
    if (request.session.loggedIn) {
        request.session.loggedIn = false;
        console.log(`Logged Out ${request.session.username}`);
        request.session.destroy();
        response.status(200).redirect("/home");

    } else {
        response.status(200).redirect("/login");
    }
}

function orderForm(request, response) {
    if (request.session.loggedIn) {
        response.status(200).render("orderForm", {
            login: request.session.loggedIn,
            userID: request.session.userID
        });

    } else {
        response.status(401).send("Please login before using the page");
    }
}

function userProfile(request, response) {
    let currentUser = request.params.userID;
    console.log(currentUser);

    User.findById(currentUser).exec((err, result) => {
        if (err) { console.log(err); }
        console.log(result.username);

        Orders.find({ username: result.username }).exec((err, results) => {
            if (err) console.log(err);
            console.log("This is the array", results);
            let isLoggedInUser = false;
            if (
                currentUser === request.session.userID) {
                isLoggedInUser = true;

                console.log("this is the user logged in",
                    isLoggedInUser);

                response.status(200).render("userProfile", {
                    login: request.session.loggedIn,
                    username: result.username,
                    isLoggedInUser: isLoggedInUser,
                    currentUser: currentUser,
                    orders: results
                });
            } else {
                response.status(403).render("userProfile", {
                    login: request.session.loggedIn,
                    username: result.username,
                    isLoggedInUser: isLoggedInUser,
                    currentUser: currentUser,
                    orders: results
                });
            }
        })

    });
}

function userStatus(request, response) {
    let uID = request.params.userID;
    console.log(request.body);
    let status = request.body;

    if (status.status === "ON") {
        User.updateOne({
            _id: uID
        }, {
            privacy: true
        }).exec((err, result) => {
            if (err) { console.log(err); }
            console.log(result);
            response.status(200).redirect(`/users/${uID}`);
        });

        // for testing purposes
        User.findById(uID).exec((err, result) => {
            if (err) { console.log(err); }
            console.log(result);
        })
    } else {
        User.updateOne({
            _id: uID
        }, {
            privacy: false
        }).exec((err, result) => {
            if (err) { console.log(err); }
            console.log(result);
        });
    }
}

function searchUser(request, response) {
    let word = request.query.name;

    console.log(word);
    response.send("found word");
}

function receiveOrder(request, response) {
    console.log(request.body);
    let order = request.body;
    if (request.session.loggedIn) {
        Orders.create({ username: request.session.username, order: order });

        Orders.findOne({ username: request.session.username }).exec((err, result) => {
            if (err) { console.log(err); }
            console.log("This is the order", result);
        });

        response.status(200).redirect("/orders");
    } else {
        response.status(404);
    }
}

function getOrder(request, response) {
    let requiredOrder = request.params.orderID;
    console.log("This is the orderID",
        requiredOrder);
    Orders.findById(requiredOrder).exec((err, result) => {
        if (err) console.log(err);
        console.log(result);
        response.status(200).render("orderInfo", {
            order: result
        });
    })
}

// Connecting to database
mongoose.connect('mongodb://localhost/a4', { useNewUrlParser: true, useUnifiedTopology: true });

let db = mongoose.connection;
db.on('error', console.error.bind(console, 'Error connecting to database'));
db.once('open', function() {
    app.listen(3000);
    console.log("Server listening at http://localhost:3000");
})