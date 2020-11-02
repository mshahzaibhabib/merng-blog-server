const { AuthenticationError } = require('apollo-server');

const jwt = require('jsonwebtoken');

//  we will use the secret to verify the token
const { SECRET_KEY } = require('./../config');


module.exports = (context) => {
    // context = {...headers} and inside the headers we will have authorization header
    const authHeader = context.req.headers.authorization;

    // we need to check if someone didn't send this header
    if (authHeader) {
        // Now if we have it then we need to get the token from it and a convention when working with 
        // authorization token that we send this token with a value of "Bearer ....token...."
        const token = authHeader.split('Bearer ')[1];
        if (token) {
            // Now we need to varify the token and make sure that this we issued this token and is still
            // valid andnot expired
            try {
                const user = jwt.verify(token, SECRET_KEY);
                return user
            } catch (err) {
                // we can throw any type of error and lets be specific and use "AuthenticationError"
                throw new AuthenticationError('Invalid/Expired token');
            }
        }

        // if conditionals fails either we dont have a token or we dont have authHeader so need to tell the 
        // user why this fails
        throw new Error('Authentication token must be \'Bearer [token]');
    }
    throw new Error('Authorization header must be provided');
}