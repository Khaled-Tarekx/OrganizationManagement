class inviteNotFound extends Error {
	constructor() {
		super('invitation failed to create');
		this.name = 'inviteNotFound';
	}
}
class InvitationFailed extends Error {
	constructor() {
		super('invite link was not found, token not correct?');
		this.name = 'InvitationFailed';
	}
}
class NotAdminOrOwner extends Error {
	constructor() {
		super(
			'you cant invite members to this organization unless you are an admin or the owner'
		);
		this.name = 'NotAdminOrOwner';
	}
}

export { NotAdminOrOwner, InvitationFailed, inviteNotFound };
