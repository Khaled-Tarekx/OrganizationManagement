import type { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { createOrgSchema, updateOrgSchema } from './validation';

import type { TypedRequestBody } from 'zod-express-middleware';
import * as OrgServices from './services';
import { checkUser } from '../../utills/helpers';
import { NotValidId } from '../../utills/errors/cause';
import {
	BadRequestError,
	AuthenticationError,
	NotFound,
	Conflict,
} from '../../custom-errors/main';

import { UserNotFound } from '../auth/errors/cause';
import {
	MemberCreationFailed,
	MemberNotFound,
	NotAnOwnerPermissionFailed,
	OrganizationCreationFailed,
	OrganizationDeletionFailed,
	OrganizationNotFound,
	OrganizationUpdatingFailed,
} from './errors/cause';
import * as GlobalErrorMsg from '../../utills/errors/msg';
import * as ErrorMsg from './errors/msg';

export const getMembersOfOrg = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const { orgId } = req.params;
	try {
		const members = await OrgServices.getMembersOfOrg(orgId);
		res.status(StatusCodes.OK).json({ data: members, count: members.length });
	} catch (err: unknown) {
		switch (true) {
			case err instanceof NotValidId:
				return next(new BadRequestError(GlobalErrorMsg.NotValidId));
			default:
				return next(err);
		}
	}
};
export const getAllOrgs = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const orgs = await OrgServices.getOrgs();
		res.status(StatusCodes.OK).json({ data: orgs, count: orgs.length });
	} catch (err: unknown) {
		return next(err);
	}
};
export const getOrg = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const { orgId } = req.params;
	try {
		const org = await OrgServices.getOrg(orgId);
		res.status(StatusCodes.OK).json({ data: org });
	} catch (err: unknown) {
		switch (true) {
			case err instanceof NotValidId:
				return next(new AuthenticationError(GlobalErrorMsg.NotValidId));
			default:
				return next(err);
		}
	}
};

export const createOrg = async (
	req: TypedRequestBody<typeof createOrgSchema>,
	res: Response,
	next: NextFunction
) => {
	const { name, description } = req.body;
	try {
		const user = req.user;
		checkUser(user);

		const data = await OrgServices.createOrg({ name, description }, user);

		res.status(StatusCodes.OK).json({
			data,
		});
	} catch (err: unknown) {
		switch (true) {
			case err instanceof UserNotFound:
				return next(new AuthenticationError(GlobalErrorMsg.LoginFirst));
			case err instanceof MemberCreationFailed:
				return next(new NotFound(ErrorMsg.MemberCreationFailed));
			case err instanceof OrganizationCreationFailed:
				return next(new Conflict(ErrorMsg.OrgCreationFailed));
			default:
				return next(err);
		}
	}
};

export const updateOrg = async (
	req: TypedRequestBody<typeof updateOrgSchema>,
	res: Response,
	next: NextFunction
) => {
	const { orgId } = req.params;
	const { name, description } = req.body;
	const user = req.user;
	try {
		checkUser(user);

		const updatedOrg = await OrgServices.updateOrg(
			orgId,
			{ name, description },
			user
		);

		res.status(StatusCodes.OK).json({
			data: updatedOrg,
		});
	} catch (err: unknown) {
		switch (true) {
			case err instanceof UserNotFound:
				return next(new AuthenticationError(GlobalErrorMsg.LoginFirst));
			case err instanceof NotValidId:
				return next(new AuthenticationError(GlobalErrorMsg.NotValidId));
			case err instanceof MemberNotFound:
				return next(new NotFound(ErrorMsg.UnAuthorizedOrgUpdate));
			case err instanceof OrganizationUpdatingFailed:
				return next(new Conflict(ErrorMsg.UnAuthorizedOrgUpdate));
			default:
				next(err);
		}
	}
};

export const deleteOrg = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const user = req.user;
	const { orgId } = req.params;
	try {
		checkUser(user);
		const deletionMessage = await OrgServices.deleteOrg(orgId, user);
		res.status(StatusCodes.OK).json({ message: deletionMessage });
	} catch (err: unknown) {
		switch (true) {
			case err instanceof UserNotFound:
				return next(new AuthenticationError(GlobalErrorMsg.LoginFirst));
			case err instanceof NotValidId:
				return next(new AuthenticationError(GlobalErrorMsg.NotValidId));
			case err instanceof OrganizationNotFound:
				return next(new NotFound(ErrorMsg.OrgNotFound));
			case err instanceof NotAnOwnerPermissionFailed:
				return next(new NotFound(ErrorMsg.UnAuthorizedOrgDelete));
			case err instanceof OrganizationDeletionFailed:
				return next(new Conflict(ErrorMsg.UnAuthorizedOrgDelete));
			default:
				return next(err);
		}
	}
};
