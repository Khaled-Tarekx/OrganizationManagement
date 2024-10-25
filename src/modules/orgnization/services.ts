import { Organization, Member } from './models';

import {
	findResourceById,
	validateObjectIds,
	checkResource,
} from '../../utills/helpers';
import type { orgDTO, updateOrgDTO } from './types';
import {
	MemberCreationFailed,
	MemberNotFound,
	NotAnOwnerPermissionFailed,
	OrganizationCreationFailed,
	OrganizationDeletionFailed,
	OrganizationNotFound,
	OrganizationUpdatingFailed,
} from './errors/cause';
import { AccessLevel } from './types';

export const getOrgs = async () => {
	return Organization.find({}).populate({
		path: 'organization_members',
		select: '-org',
		populate: {
			path: 'user',
			select: '-password -role',
		},
	});
};

export const getMembersOfOrg = async (orgId: string) => {
	validateObjectIds([orgId]);

	const org = await findResourceById(
		Organization,
		orgId,
		OrganizationNotFound
	);
	await org.populate({
		path: 'organization_members',
		select: '-org',
		populate: {
			path: 'user',
			select: '-password -role',
		},
	});
	return org.organization_members;
};

export const getOrg = async (orgId: string) => {
	validateObjectIds([orgId]);
	const org = await findResourceById(
		Organization,
		orgId,
		OrganizationNotFound
	);
	await org.populate({
		path: 'organization_members',
		select: '-org',
		populate: {
			path: 'user',
			select: '-password -role',
		},
	});
	return org;
};

export const createOrg = async (OrgData: orgDTO, user: Express.User) => {
	const { name, description } = OrgData;

	const orgOwner = new Member({
		access_level: AccessLevel.owner,
		user: user._id,
	});
	const org = await Organization.create({
		name,
		organization_members: [orgOwner._id],
		description,
	});
	orgOwner.organization = org._id;
	await orgOwner.save();
	checkResource(orgOwner, MemberCreationFailed);

	checkResource(org, OrganizationCreationFailed);
	return org;
};

export const updateOrg = async (
	orgId: string,
	orgData: updateOrgDTO,
	user: Express.User
) => {
	const { name, description } = orgData;
	validateObjectIds([orgId]);
	const orgOwner = await Member.findOne({
		user: user._id,
		org: orgId,
		access_level: AccessLevel.owner,
	}).populate({ path: 'user', select: '-password -role' });

	checkResource(orgOwner, MemberNotFound);

	const updatedOrg = await Organization.findByIdAndUpdate(
		orgId,
		{ name, description },
		{ new: true }
	);

	checkResource(updatedOrg, OrganizationUpdatingFailed);
	return updatedOrg;
};

export const deleteOrg = async (orgId: string, user: Express.User) => {
	validateObjectIds([orgId]);
	const org = await findResourceById(
		Organization,
		orgId,
		OrganizationNotFound
	);

	const orgOwner = await Member.findOne({
		user: user._id,
		org: orgId,
		access_level: AccessLevel.owner,
	}).populate({ path: 'user', select: '-password -role' });
	checkResource(orgOwner, NotAnOwnerPermissionFailed);
	await Member.deleteMany({ org: org._id });
	const deletedOrg = await org.deleteOne();
	if (deletedOrg.deletedCount === 0) {
		throw new OrganizationDeletionFailed();
	}

	return 'org deleted successfully';
};
