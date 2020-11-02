const postsResolvers = require('./posts');
const usersResolvers = require('./users');
const commentsResolver = require('./comments');


module.exports = {
    // here if we have name of the type so if we say Post
    // and then we do stuff here, change any of the fields each time any query/mutation/subscription that
    // return a post it will go through this "Post" modifier and apply these modifications which is pretty cool
    Post: {
        // we only need "parent" because parent holds the data that comes from the previous step
        likeCount: (parent) => parent.likes.length,
        commentCount: (parent) => parent.comments.length
    },
    Query: {
        ...postsResolvers.Query
    },
    Mutation: {
        ...usersResolvers.Mutation,
        ...postsResolvers.Mutation,
        ...commentsResolver.Mutation
    },
    Subscription: {
        ...postsResolvers.Subscription
    }
};