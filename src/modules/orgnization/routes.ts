import express from 'express';
import {
	getAllOrgs,
	getMembersOfOrg,
	createOrg,
	getOrg,
	deleteOrg,
	updateOrg,
} from './controllers';

const router = express.Router();
router.route('/members/:workspaceId/').get(getMembersOfOrg);

router.route('/').get(getAllOrgs).post(createOrg);

router.route('/:workspaceId').get(getOrg).patch(updateOrg).delete(deleteOrg);

export default router;
