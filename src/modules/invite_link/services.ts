import InviteLink from './models';
import {
	findResourceById,
	checkResource,
	isExpired,
} from '../../utills/helpers';
import { Member, Organization } from '../orgnization/models';
import type { createInviteDTO } from './types';
import { AccessLevel } from '../orgnization/types';
import {
	InvitationFailed,
	inviteNotFound,
	NotAdminOrOwner,
} from './errors/cause';
import {
	MemberCreationFailed,
	MemberNotFound,
	OrganizationNotFound,
} from '../orgnization/errors/cause';
import User from '../auth/models';

export const createInviteLink = async (
	inviteData: createInviteDTO,
	user: Express.User
) => {
	const { organizationId, user_email } = inviteData;
	const organization = await findResourceById(
		Organization,
		organizationId,
		OrganizationNotFound
	);
	const admin = await Member.findOne({
		$or: [
			{
				user: user._id,
				organization: organization._id,
				access_level: AccessLevel.owner,
			},
			{
				user: user._id,
				organization: organization._id,
				access_level: AccessLevel.admin,
			},
		],
	});
	checkResource(admin, NotAdminOrOwner);
	const invitedPerson = await User.findOne({ email: user_email });

	checkResource(invitedPerson, MemberNotFound);
	const invitation = await InviteLink.create({
		user: invitedPerson._id,
		organization: organization._id,
	});
	checkResource(invitation, InvitationFailed);
	return 'invitation has been ';
};

export const acceptInvitation = async (token: string) => {
	const invitation = await InviteLink.findOne({
		token,
	});
	checkResource(invitation, inviteNotFound);
	isExpired(invitation.expiresAt, invitation.createdAt);
	const member = await Member.create({
		user: invitation.user._id,
		organization: invitation.organization._id,
		access_level: AccessLevel.member,
	});

	checkResource(member, MemberCreationFailed);
	return member;
};
