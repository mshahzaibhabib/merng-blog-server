const { model, Schema } = require('mongoose');



const postSchema = new Schema({
    body: String,
    username: String,
    createdAt: String,
    comments: [
        {
            body: String,
            username: String,
            createdAt: String
        }
    ],
    likes: [
        {
            username: String,
            createdAt: String
        }
    ],
    // even though MongoDB is schema less, NoSQL does not have relations but ORM itself lets us have 
    // relations between our models
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users'
        // so this allows us to later use mongoose to automatically populate the user field if we want 
        // to use some mongose methods.
    }
});

module.exports = model('Post', postSchema);