const { model, Schema } = require('mongoose');



const userSchema = new Schema({
    // we could specify on each entry it's type, is required or default value. but because we are using
    // GraphQL as a middleman we can use GraphQL itself to specify that. So in GraphQL Layer and not
    // in the mongoose layer
    username: String,
    password: String,
    email: String,
    createdAt: String
});

module.exports = model('User', userSchema);