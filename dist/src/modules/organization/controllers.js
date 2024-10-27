import { StatusCodes } from 'http-status-codes';
import * as OrgServices from './services';
import { checkUser } from '../../utills/helpers';
import { NotValidId } from '../../utills/errors/cause';
import { BadRequestError, AuthenticationError, NotFound, Conflict, } from '../../custom-errors/main';
import { UserNotFound } from '../auth/errors/cause';
import { InvalidRole, MemberAlreadyExists, MemberCreationFailed, MemberNotFound, NotAnOwnerPermissionFailed, OrganizationCreationFailed, OrganizationDeletionFailed, OrganizationNotFound, OrganizationUpdatingFailed, } from './errors/cause';
import * as GlobalErrorMsg from '../../utills/errors/msg';
import * as ErrorMsg from './errors/msg';
import Forbidden from "../../custom-errors/forbidden";
export const getMembersOfOrganization = async (req, res, next) => {
    const { organizationId } = req.params;
    try {
        const members = await OrgServices.getMembersOfOrganization(organizationId);
        res.status(StatusCodes.OK).json({ data: members, count: members.length });
    }
    catch (err) {
        if (err instanceof NotValidId) {
            return next(new BadRequestError(GlobalErrorMsg.NotValidId));
        }
        return next(err);
    }
};
export const getOrganizations = async (req, res, next) => {
    try {
        const orgs = await OrgServices.getOrganizations();
        res.status(StatusCodes.OK).json({ data: orgs, count: orgs.length });
    }
    catch (err) {
        return next(err);
    }
};
export const getOrganization = async (req, res, next) => {
    const { organizationId } = req.params;
    try {
        const org = await OrgServices.getOrganization(organizationId);
        res.status(StatusCodes.OK).json({ data: org });
    }
    catch (err) {
        if (err instanceof NotValidId) {
            return next(new AuthenticationError(GlobalErrorMsg.NotValidId));
        }
        return next(new NotFound());
    }
};
export const createOrganization = async (req, res, next) => {
    const { name, description } = req.body;
    try {
        const user = req.user;
        checkUser(user);
        const data = await OrgServices.createOrganization({ name, description }, user);
        res.status(StatusCodes.CREATED).json({
            data,
        });
    }
    catch (err) {
        if (err instanceof UserNotFound) {
            return next(new AuthenticationError(GlobalErrorMsg.LoginFirst));
        }
        if (err instanceof MemberCreationFailed) {
            return next(new NotFound(ErrorMsg.MemberCreationFailed));
        }
        if (err instanceof OrganizationCreationFailed) {
            return next(new Conflict(ErrorMsg.OrgCreationFailed));
        }
        if (err instanceof MemberAlreadyExists) {
            return next(new Forbidden(ErrorMsg.MemberAlreadyExists));
        }
        return next(err);
    }
};
export const updateOrganization = async (req, res, next) => {
    const { organizationId } = req.params;
    const { name, description } = req.body;
    const user = req.user;
    try {
        checkUser(user);
        const updatedOrg = await OrgServices.updateOrganization(organizationId, { name, description }, user);
        res.status(StatusCodes.OK).json({
            data: updatedOrg,
        });
    }
    catch (err) {
        if (err instanceof UserNotFound) {
            return next(new AuthenticationError(GlobalErrorMsg.LoginFirst));
        }
        if (err instanceof NotValidId) {
            return next(new AuthenticationError(GlobalErrorMsg.NotValidId));
        }
        if (err instanceof MemberNotFound) {
            return next(new NotFound(ErrorMsg.UnAuthorizedOrgUpdate));
        }
        if (err instanceof OrganizationUpdatingFailed) {
            return next(new Conflict(ErrorMsg.UnAuthorizedOrgUpdate));
        }
        if (err instanceof InvalidRole) {
            return next(new Forbidden());
        }
        return next(err);
    }
};
export const deleteOrganization = async (req, res, next) => {
    const user = req.user;
    const { organizationId } = req.params;
    try {
        checkUser(user);
        const deletionMessage = await OrgServices.deleteOrganization(organizationId, user);
        res.status(StatusCodes.OK).json({ message: deletionMessage });
    }
    catch (err) {
        if (err instanceof UserNotFound) {
            return next(new AuthenticationError(GlobalErrorMsg.LoginFirst));
        }
        if (err instanceof NotValidId) {
            return next(new AuthenticationError(GlobalErrorMsg.NotValidId));
        }
        if (err instanceof OrganizationNotFound) {
            return next(new NotFound(ErrorMsg.OrgNotFound));
        }
        if (err instanceof NotAnOwnerPermissionFailed) {
            return next(new NotFound(ErrorMsg.UnAuthorizedOrgDelete));
        }
        if (err instanceof OrganizationDeletionFailed) {
            return next(new Conflict(ErrorMsg.UnAuthorizedOrgDelete));
        }
        return next(err);
    }
};
