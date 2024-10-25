class NotResourceOwner extends Error {
	constructor() {
		super(`you are not the owner of the resource`);
		this.name = 'NotResourceOwner';
	}
}
class NotValidId extends Error {
	constructor() {
		super('Invalid Object Id');
		this.name = 'NotValidId';
	}
}
class LinkExpired extends Error {
	constructor() {
		super('invite link already expired');
		this.name = 'LinkExpired';
	}
}

class TokenStoringFailed extends Error {
	constructor() {
		super('redis client failed to store refresh token');
		this.name = 'TokenStoringFailed';
	}
}

class ValidationError extends Error {}

export {
	NotResourceOwner,
	NotValidId,
	TokenStoringFailed,
	LinkExpired,
	ValidationError,
};
