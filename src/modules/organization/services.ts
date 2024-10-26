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

export const getOrganizations = async () => {
	return Organization.find({}).populate({
		path: 'organization_members',
		select: '-organization',
		populate: {
			path: 'user',
			select: '-password -role',
		},
	});
};

export const getMembersOfOrganization = async (organizationId: string) => {
	validateObjectIds([organizationId]);

	const organization = await findResourceById(
		Organization,
		organizationId,
		OrganizationNotFound
	);
	await organization.populate({
		path: 'organization_members',
		select: '-organization',
		populate: {
			path: 'user',
			select: '-password -role',
		},
	});
	return organization.organization_members;
};

export const getOrganization = async (organizationId: string) => {
	validateObjectIds([organizationId]);
	const organization = await findResourceById(
		Organization,
		organizationId,
		OrganizationNotFound
	);
	await organization.populate({
		path: 'organization_members',
		select: '-organization',
		populate: {
			path: 'user',
			select: '-password -role',
		},
	});
	return organization;
};

export const createOrganization = async (
	OrganizationData: orgDTO,
	user: Express.User
) => {
	const { name, description } = OrganizationData;

	const owner = new Member({
		access_level: AccessLevel.owner,
		user: user._id,
	});
	const organization = await Organization.create({
		name,
		organization_members: [owner._id],
		description,
	});
	owner.organization = organization._id;
	await owner.save();
	checkResource(owner, MemberCreationFailed);

	checkResource(organization, OrganizationCreationFailed);
	return organization;
};

export const updateOrganization = async (
	organizationId: string,
	orgData: updateOrgDTO,
	user: Express.User
) => {
	const { name, description } = orgData;
	validateObjectIds([organizationId]);
	const owner = await Member.findOne({
		user: user._id,
		organization: organizationId,
		access_level: AccessLevel.owner,
	}).populate({ path: 'user', select: '-password -role' });

	checkResource(owner, MemberNotFound);

	const updatedOrganization = await Organization.findByIdAndUpdate(
		organizationId,
		{ name, description },
		{ new: true }
	);

	checkResource(updatedOrganization, OrganizationUpdatingFailed);
	return updatedOrganization;
};

export const deleteOrganization = async (
	organizationId: string,
	user: Express.User
) => {
	validateObjectIds([organizationId]);
	const organization = await findResourceById(
		Organization,
		organizationId,
		OrganizationNotFound
	);

	const owner = await Member.findOne({
		user: user._id,
		organization: organizationId,
		access_level: AccessLevel.owner,
	}).populate({ path: 'user', select: '-password -role' });
	checkResource(owner, NotAnOwnerPermissionFailed);
	await Member.deleteMany({ org: organization._id });
	const deletedOrganization = await organization.deleteOne();
	if (deletedOrganization.deletedCount === 0) {
		throw new OrganizationDeletionFailed();
	}

	return 'Organization deleted successfully';
};
