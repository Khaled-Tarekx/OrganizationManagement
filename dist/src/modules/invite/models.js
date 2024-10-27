var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { getModelForClass, prop } from '@typegoose/typegoose';
import { v4 as uuidv4 } from 'uuid';
import { UserSchema } from '../auth/models';
import { OrganizationSchema } from '../organization/models';
export class InvitationSchema {
    token;
    user;
    organization;
    expiresAt;
    createdAt;
}
__decorate([
    prop({ type: String, default: uuidv4() }),
    __metadata("design:type", String)
], InvitationSchema.prototype, "token", void 0);
__decorate([
    prop({ ref: UserSchema, required: true }),
    __metadata("design:type", Object)
], InvitationSchema.prototype, "user", void 0);
__decorate([
    prop({ ref: OrganizationSchema, required: true }),
    __metadata("design:type", Object)
], InvitationSchema.prototype, "organization", void 0);
__decorate([
    prop({
        type: Date,
        required: true,
        default: () => new Date(Date.now() + 3600 * 1000),
    }),
    __metadata("design:type", Date)
], InvitationSchema.prototype, "expiresAt", void 0);
__decorate([
    prop({ type: Date, required: true, default: new Date(Date.now()) }),
    __metadata("design:type", Date)
], InvitationSchema.prototype, "createdAt", void 0);
const Invitation = getModelForClass(InvitationSchema);
export { Invitation };
