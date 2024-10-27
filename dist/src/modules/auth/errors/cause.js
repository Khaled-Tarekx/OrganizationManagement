class PasswordComparisionError extends Error {
}
class PasswordHashingError extends Error {
}
class LoginError extends Error {
    constructor() {
        super('either password or email is incorrect');
        this.name = 'LoginError';
    }
}
class RegistrationError extends Error {
    constructor() {
        super('all fields must be entered');
        this.name = 'RegistrationError';
    }
}
class UserNotFound extends Error {
    constructor() {
        super('couldnt find user with the given input');
        this.name = 'UserNotFound';
    }
}
class RefreshTokenError extends Error {
    constructor() {
        super('refresh token expired, maybe try logging in again ?');
        this.name = 'RefreshTokenError';
    }
}
class TokenGenerationFailed extends Error {
    constructor() {
        super('failed to generate the token');
        this.name = 'TokenGenerationFailed';
    }
}
class TokenVerificationFailed extends Error {
    constructor() {
        super('failed to verify the token');
        this.name = 'TokenVerificationFailed';
    }
}
class UnAuthorized extends Error {
    constructor() {
        super('UnAuthorized');
        this.name = 'UnAuthorized';
    }
}
export { LoginError, UserNotFound, RegistrationError, TokenGenerationFailed, PasswordComparisionError, PasswordHashingError, RefreshTokenError, TokenVerificationFailed, UnAuthorized, };
