module.exports.validateRegisterInput = (username, email, password, confirmPassword) => {
    const errors = {};
    if (username.trim() === '') {
        errors.username = 'Username must not be empty';
    }
    if (email.trim() === '') {
        errors.email = 'Email must not be empty';
    } else {
        // match this string to a regular expression that this string is an email
        const regEx = /^([0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*@([0-9a-zA-Z][-\w]*[0-9a-zA-Z]\.)+[a-zA-Z]{2,9})$/;
        if (!email.match(regEx)) {
            errors.email = 'Email must be a valid email address';
        }
    }
    // not trim, whitespaces as part of password is fine
    if (password === '') {
        errors.password = 'Password must not be empty'
    } else if (password !== confirmPassword) {
        // password is same as the confirmPassword
        errors.confirmPassword = 'Password must match';
    }

    return {
        errors,
        // if this value is true that means there is no error
        valid: Object.keys(errors).length < 1
    };
};

module.exports.validateLoginInput = (username, password) => {
    const errors = {};
    if (username.trim() === '') {
        errors.username = 'Username must not be empty';
    }
    if (password.trim() === '') {
        errors.password = 'Password must not be empty';
    }

    return {
        errors,
        // if this value is true that means there is no error
        valid: Object.keys(errors).length < 1
    };
}