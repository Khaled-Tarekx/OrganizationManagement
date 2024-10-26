import type { NextFunction, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import type {
	createInviteSchema,
	acceptInvitationSchema,
} from './validation';

import {
	TypedRequestQuery,
	type TypedRequestBody,
} from 'zod-express-middleware';
import { checkUser } from '../../utills/helpers';
import * as InviteServices from './services';
import {
	InvitationFailed,
	inviteNotFound,
	NotAdminOrOwner,
} from './errors/cause';
import * as ErrorMsg from './errors/msg';
import {
	MemberCreationFailed,
	MemberNotFound,
	OrganizationNotFound,
} from '../organization/errors/cause';
import { UserNotFound } from '../auth/errors/cause';
import {
	AuthenticationError,
	Forbidden,
	NotFound,
	Conflict,
	ResourceGone,
} from '../../custom-errors/main';
import { InvitationExpired } from '../../utills/errors/cause';
import * as GlobalErrorMsg from '../../utills/errors/msg';
import * as OrganizationErrors from '../organization/errors/msg';

export const createInviteLink = async (
	req: TypedRequestBody<typeof createInviteSchema>,
	res: Response,
	next: NextFunction
) => {
	const { organizationId } = req.params;
	const { user_email } = req.body;
	try {
		const user = req.user;
		checkUser(user);
		const { message, token } = await InviteServices.createInviteLink(
			{ organizationId, user_email },
			user
		);

		res.status(StatusCodes.CREATED).json({ message, token });
	} catch (err: unknown) {
		switch (true) {
			case err instanceof UserNotFound:
				return next(new AuthenticationError(GlobalErrorMsg.LoginFirst));
			case err instanceof OrganizationNotFound:
				return next(new NotFound(OrganizationErrors.OrgNotFound));
			case err instanceof NotAdminOrOwner:
				return next(new Forbidden(ErrorMsg.NotOwnerOrAdmin));
			case err instanceof MemberNotFound:
				return next(new Forbidden(OrganizationErrors.MemberNotFound));
			case err instanceof InvitationFailed:
				return next(new Conflict(ErrorMsg.InvitationFailed));
			default:
				return next(err);
		}
	}
};

export const acceptInvitation = async (
	req: TypedRequestQuery<typeof acceptInvitationSchema>,
	res: Response,
	next: NextFunction
) => {
	const { token } = req.query;
	try {
		const member = await InviteServices.acceptInvitation(token);

		res.status(StatusCodes.CREATED).json({ member });
	} catch (err: unknown) {
		switch (true) {
			case err instanceof UserNotFound:
				return next(new AuthenticationError(GlobalErrorMsg.LoginFirst));
			case err instanceof inviteNotFound:
				return next(new NotFound(ErrorMsg.InvitationNotFound));
			case err instanceof InvitationExpired:
				return next(new ResourceGone(ErrorMsg.InvitationExpired));
			case err instanceof MemberCreationFailed:
				return next(new Conflict(ErrorMsg.MempershipFailed));
			default:
				return next(err);
		}
	}
};
