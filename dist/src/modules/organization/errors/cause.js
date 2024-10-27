class OrganizationNotFound extends Error {
    constructor() {
        super('org not found');
        this.name = 'OrgNotFound';
    }
}
class MemberAlreadyExists extends Error {
    constructor() {
        super('member already exists');
        this.name = 'MemberAlreadyExists';
    }
}
class OrganizationCreationFailed extends Error {
    constructor() {
        super('org creation failed');
        this.name = 'OrgCreationFailed';
    }
}
class OrganizationUpdatingFailed extends Error {
    constructor() {
        super('org updating failed');
        this.name = 'OrgUpdatingFailed';
    }
}
class OrganizationDeletionFailed extends Error {
    constructor() {
        super('org deletion failed');
        this.name = 'OrgDeletionFailed';
    }
}
class MemberNotFound extends Error {
    constructor() {
        super('you are either not a member of this org or you are not the owner');
        this.name = 'MemberNotFound';
    }
}
class NotAnOwnerPermissionFailed extends Error {
    constructor() {
        super('you are either not a member of this org or you are not the owner');
        this.name = 'MemberNotFound';
    }
}
class InvalidRole extends Error {
    constructor() {
        super('you have to enter a role between member and admin');
        this.name = 'InvalidRole';
    }
}
class MemberCreationFailed extends Error {
    constructor() {
        super('member creation failed');
        this.name = 'MemberCreationFailed';
    }
}
class MemberUpdatingFailed extends Error {
    constructor() {
        super('member updating failed');
        this.name = 'MemberUpdatingFailed';
    }
}
class MemberDeletionFailed extends Error {
    constructor() {
        super('member deletion failed');
        this.name = 'MemberDeletionFailed';
    }
}
export { OrganizationUpdatingFailed, OrganizationDeletionFailed, OrganizationCreationFailed, OrganizationNotFound, MemberCreationFailed, MemberUpdatingFailed, MemberDeletionFailed, MemberNotFound, InvalidRole, NotAnOwnerPermissionFailed, MemberAlreadyExists, };
