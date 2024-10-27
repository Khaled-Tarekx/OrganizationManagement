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
		
		const { message, token } = await InviteServices.invite(
			{ organizationId, user_email },
			user
		);

		res.status(StatusCodes.OK).json({ message, token });
	} catch (err: unknown) {
		if (err instanceof UserNotFound) {
			return next(new AuthenticationError(GlobalErrorMsg.LoginFirst));
		}
		if (err instanceof OrganizationNotFound) {
			return next(new NotFound(OrganizationErrors.OrgNotFound));
		}
		if (err instanceof NotAdminOrOwner) {
			return next(new Forbidden(ErrorMsg.NotOwnerOrAdmin));
		}
		if (err instanceof MemberNotFound) {
			return next(new Forbidden(OrganizationErrors.MemberNotFound));
		}
		if (err instanceof InvitationFailed) {
			return next(new Conflict(ErrorMsg.InvitationFailed));
		}
		return next(err);
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
		if (err instanceof UserNotFound) {
			return next(new AuthenticationError(GlobalErrorMsg.LoginFirst));
		}
		if (err instanceof inviteNotFound) {
			return next(new NotFound(ErrorMsg.InvitationNotFound));
		}
		if (err instanceof InvitationExpired) {
			return next(new ResourceGone(ErrorMsg.InvitationExpired));
		}
		if (err instanceof MemberCreationFailed) {
			return next(new Conflict(ErrorMsg.MempershipFailed));
		}
		return next(err);
	}
};
