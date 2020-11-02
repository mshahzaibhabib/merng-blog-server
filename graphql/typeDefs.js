const { gql } = require('apollo-server');


module.exports = gql`
    type Post {
        id: ID!
        body: String!
        createdAt: String!
        username: String!
        comments: [Comment]!
        likes: [Like]!
        # we can actually compute these and send them not through the mutation itself but we can have like
        # 'modifiers'
        likeCount: Int!
        commentCount: Int!
    }
    type Comment {
        id: ID!
        createdAt: String!
        username: String!
        body: String!
    }
    type Like {
        id: ID!
        createdAt: String!
        username: String!
    }
    type User {
        id: ID!
        email: String!
        token: String!
        username: String!
        createdAt: String!
    }
    # this is not a "type" this "input" which is a different type of type which is given as an input 
    # to a resolver for it to return something for us
    input RegisterInput {
        username: String!
        password: String!
        confirmPassword: String!
        email: String!
    }
    type Query {
        # all of our queries and type they return
        # sayHi: String!
        # getPosts will get all the posts from our DB and it's gonna go to collection Post and bring
        # all the docs from there and return ot back to our user.
        getPosts: [Post]
        getPost(postId: ID!): Post
    }
    type Mutation {
        # here we can have input from our users as arguments, take that and do stuff with our business
        # logic
        register(registerInput: RegisterInput): User!
        login(username: String!, password: String!): User!
        createPost(body: String!): Post!
        deletePost(postId: ID!): String!
        createComment(postId: String!, body: String!): Post!
        deleteComment(postId: ID!, commentId: ID!): Post!
        # this will work as a toggle so we dont need unlikePost mutation explicitly
        likePost(postId: ID!): Post!
    }
    type Subscription {
        # generally people dont use them when when getting new post or new comments etc. because if the app
        # is massive it would be too much traffic and too much bandwidth
        # people use them for polling and for chat apps
        # I want a subscription each time a new post is created to like show whoever is subscribed to this 
        # that look this is the new post that's been created
        newPost: Post!
    }
`