import express from 'express';
import {
	getOrganizations,
	getMembersOfOrganization,
	createOrganization,
	getOrganization,
	deleteOrganization,
	updateOrganization,
} from './controllers';
import { acceptInvitation, createInviteLink } from '../invite/controllers';
import { validateResource } from '../../utills/middlewares';
import {
	acceptInvitationSchema,
	createInviteSchema,
} from '../invite/validation';

const router = express.Router();
router.route('/members/:organizationId/').get(getMembersOfOrganization);
router
	.route('/:organizationId')
	.get(getOrganization)
	.put(updateOrganization)
	.delete(deleteOrganization);

router.post(
	'/:organizationId/invite',
	validateResource({
		paramsSchema: createInviteSchema.omit({ user_email: true }),
		bodySchema: createInviteSchema.omit({ organizationId: true }),
	}),
	createInviteLink
);

router.post(
	'/accept-invitation',
	validateResource({ querySchema: acceptInvitationSchema }),
	acceptInvitation
);

router.route('/').get(getOrganizations).post(createOrganization);

export default router;
