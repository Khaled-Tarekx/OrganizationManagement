import express from 'express';
import { getOrganizations, getMembersOfOrganization, createOrganization, getOrganization, deleteOrganization, updateOrganization, } from './controllers.js';
import { acceptInvitation, createInviteLink } from '../invite/controllers.js';
import { validateResource } from '../../utills/middlewares.js';
import { acceptInvitationSchema, createInviteSchema, } from '../invite/validation.js';
const router = express.Router();
router.route('/members/:organizationId/').get(getMembersOfOrganization);
router
    .route('/:organizationId')
    .get(getOrganization)
    .put(updateOrganization)
    .delete(deleteOrganization);
router.post('/:organizationId/invite', validateResource({
    paramsSchema: createInviteSchema.omit({ user_email: true }),
    bodySchema: createInviteSchema.omit({ organizationId: true }),
}), createInviteLink);
router.post('/accept-invitation', validateResource({ querySchema: acceptInvitationSchema }), acceptInvitation);
router.route('/').get(getOrganizations).post(createOrganization);
export default router;
