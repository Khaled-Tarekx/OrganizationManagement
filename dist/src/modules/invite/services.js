import { Invitation } from './models.js';
import { findResourceById, checkResource, isExpired, } from '../../utills/helpers.js';
import { Member, Organization } from '../organization/models.js';
import { AccessLevel } from '../organization/types.js';
import { InvitationFailed, inviteNotFound, NotAdminOrOwner, } from './errors/cause.js';
import { MemberCreationFailed, MemberNotFound, OrganizationNotFound, MemberAlreadyExists, } from '../organization/errors/cause.js';
import { User } from '../auth/models.js';
export const invite = async (inviteData, user) => {
    const { organizationId, user_email } = inviteData;
    const organization = await findResourceById(Organization, organizationId, OrganizationNotFound);
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
    const existingMember = await Member.findOne({
        _id: invitedPerson._id,
    });
    if (existingMember) {
        throw new MemberAlreadyExists();
    }
    const invitation = await Invitation.create({
        user: invitedPerson._id,
        organization: organization._id,
    });
    checkResource(invitation, InvitationFailed);
    const message = `invitation has been sent successfully`;
    return { message, token: invitation.token };
};
export const acceptInvitation = async (token) => {
    const invitation = await Invitation.findOne({
        token,
    });
    checkResource(invitation, inviteNotFound);
    isExpired(invitation.expiresAt, invitation.createdAt);
    const member = await Member.create({
        user: invitation.user._id,
        organization: invitation.organization._id,
        access_level: AccessLevel.member,
    });
    const organization = await findResourceById(Organization, invitation.organization._id, OrganizationNotFound);
    organization.organization_members.push(member);
    await organization.save();
    checkResource(member, MemberCreationFailed);
    return member;
};
