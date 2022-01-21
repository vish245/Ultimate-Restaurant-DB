Author: Vishal Parag Parmar

Design Decisions: 
    1) Handled everything using mongoDB and Mongoose. 
    2) server.js files handles uploading data in the database and using data from the database using Mongoose
    3) userModel.js and orderModel.js are Schemas made to store information about the user and the orderModel
    4) Nodemon is installed to run the server automatically everytime the code is updated.

Instructions to Run: 
    1) Connect to mongo Daemon in a terminal by running the following code in this directory -> mongod --dbpath=database
    2) run mongo in a new shell -> mongo
    3) To connect the database to node, run the following program -> node database-initializer.js.  
    4) (IMPORTANAT) Now to connect to the server run with nodemon-> npm run dev 
    5) go to your browser and search for localhost:3000
    6) The page will have the following links -> 
                                                 -HOME
                                                 -Users
                                                 -Register
                                                 -Login
    7) Go to the LOGIN page to login a user to the server OR create a new user by going to the REGISTER page. 
    8) Go to the USERS page to get a list of all users on the database.
    9) Once logged in you will see 2 more links - ORDER FORM and USERINFO.
    10) Navigate through the order form link to create and add new orders to the database.
    11) Navigate through the USERINFO page to look at all the information about the user. 