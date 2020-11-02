const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { UserInputError } = require('apollo-server');

// we need to use destructuring because this is not the default export
const { validateRegisterInput, validateLoginInput } = require('./../../util/validators');
const { SECRET_KEY } = require('./../../config');
const User = require('./../../models/User');



function generateToken(user) {
    return jwt.sign({
        id: user.id,
        email: user.email,
        username: user.username,
    }, SECRET_KEY, { expiresIn: '1h' });
}

module.exports = {
    Mutation: {
        async login(_, { username, password }) {
            const { errors, valid } = validateLoginInput(username, password);

            if (!valid) {
                throw new UserInputError('Errors', { errors });
            }

            const user = await User.findOne({ username });
            if (!user) {
                // we need to throw an error but this will be a different error. This is not an error for the
                // fields themseleves but another
                errors.general = 'User not found';
                throw new UserInputError('User not found', { errors });
            }

            // mathing password
            const match = await bcrypt.compare(password, user.password);
            if (!match) {
                errors.general = 'Wrong credentials';
                throw new UserInputError('Wrong credentials', { errors });
            }

            // issue a token for the user
            const token = generateToken(user);
            return {
                ...user._doc,
                id: user._id,
                token
            }
        },

        // there are four things that we can get in our resolver argument. most of the time we will be using
        // args.
        // "parent", it gives you the result of what was the input from the last step but here it will be
        // undefined because there is no step before this but in some cases you can have multiple resolvers
        // so data goes from one to another resolver and it gets process in different ways and then retuened
        // to the user. so we can just use _, so it does not take up any space.
        // args, actually is RegisterInput
        // context,
        // info, some general information about, some metadata that we almost never need.
        // "parent, args, contect, info"
        async register(_, { registerInput: { username, email, password, confirmPassword } }) {
            // STEP:1 - VALIDATE USER DATA, so if we have for e.g. empty fields we can have server valiation on case we 
            // have some problems like pasword don't match, email already exists etc
            const { valid, errors } = validateRegisterInput(username, email, password, confirmPassword);
            if (!valid) {
                throw new UserInputError('Error', { errors });
            }

            // STEP:2 - USER DOESN'T AREALY EXISTS
            const user = await User.findOne({ username })
            if (user) {
                // we can use THROW ERROR but we can use specific Errors from Apollo
                // Apollo client will be able to recognize this error and handle differently
                throw new UserInputError('Username is taken', {
                    // passing a payload without errors and that we will use this in the client
                    // so the payload will have an errors object and inside we will have a username 'key'
                    // this errors object will be later used on our front-end to display thess errors on the form
                    errors: {
                        username: 'This username is taken'
                    }
                })
            }

            // STEP:3 - HASH THE PASSWORD BEFORE WE STORE IT IN OUR DATA BASE, CREATE AN AUTH TOKEN
            password = await bcrypt.hash(password, 12);

            // form our user object
            const newUser = new User({
                email,
                username,
                password,
                createdAt: new Date().toTimeString()
            });

            // save to DB
            const res = await newUser.save();

            // return data to the user, before that we need to create a token for our user
            const token = generateToken(res);

            return {
                ...res._doc,
                id: res._id,
                token
            }
        }
    }
};