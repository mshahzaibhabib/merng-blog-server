const { AuthenticationError, UserInputError } = require('apollo-server');

const Post = require('./../../models/Post');
const checkAuth = require('./../../util/check-auth');


module.exports = {
    Query: {
        // sayHi: () => 'Hello World!'
        async getPosts() {
            try {
                const posts = await Post.find().sort({ createdAt: -1 });
                return posts;
            } catch (err) {
                throw new Error(err);
            }
        },
        async getPost(_, { postId }) {
            try {
                const post = await Post.findById(postId);

                // we could give it like a wrong ID or an ID of a post that has been deleted, that could be null
                if (post) {
                    return post;
                } else {
                    throw new Error('Post not found')
                }
            } catch (err) {
                throw new Error(err);
            }
        }
    },
    Mutation: {
        // inside "context" we will have request body so we can access the header and determine that this user
        // is authenticated.
        // we can do all of this inside here but since we will use this middleware or helper function in multiple
        // routes so we need to put it in it's own function
        async createPost(_, { body }, context) {
            // STEP:
            // here we need, they way our protected resolvers are going to work is that our user will login and get
            // an authentication token and then they need to put it in authorization header and send that header 
            // with request and we need to get that token and then decode it and get information from it, make sure 
            // that the user is authenticated and then create a post.

            // the way we implemented check-auth is that if we don't have a header it throws an error otherwise we 
            // will get a user
            const user = checkAuth(context);
            // console.log(user);

            if (body.trim() === '') {
                throw new Error('Post body must not be empty');
            }

            const newPost = new Post({
                body,
                user: user.id,
                username: user.username,
                createdAt: new Date().toISOString()
            })

            const post = await newPost.save();

            context.pubsub.publish('NEW_POST', {
                newPost: post
            })

            return post;
        },
        async deletePost(_, { postId }, context) {
            const user = checkAuth(context);

            // even if we have a user is not enough we need to make sure this user is the creator of post they want to
            // delete
            try {
                const post = await Post.findById(postId);
                if (user.username === post.username) {
                    await post.delete();
                    return 'Post deleted successfully';
                } else {
                    throw new AuthenticationError('Action not allowed ');
                }
            } catch (err) {
                throw new Error(err);
            }
        },
        async likePost(_, { postId }, context) {
            const { username } = checkAuth(context);

            const post = await Post.findById(postId);

            if (post) {
                if (post.likes.find(like => like.username === username)) {
                    // Post already liked, unlike it
                    post.likes = post.likes.filter(like => like.username !== username);
                } else {
                    // Not liked, like post
                    post.likes.push({
                        username,
                        createdAt: new Date().toISOString()
                    })
                }

                await post.save();
                return post;
            } else throw new UserInputError('Post not found');
        }
    },
    Subscription: {
        newPost: {
            subscribe: (_, __, { pubsub }) => pubsub.asyncIterator('NEW_POST')
            // here we want to as well publish because this is the subscription we want a publication from where we 
            // create a post
        }
    }
}
