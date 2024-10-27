class CustomError extends Error {
    statusCode;
    code;
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
    toJSON() {
        return {
            message: this.message,
            statusCode: this.statusCode,
            name: this.name,
            code: this.code,
        };
    }
}
export default CustomError;
