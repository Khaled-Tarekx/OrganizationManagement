var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { getModelForClass, modelOptions, prop, } from '@typegoose/typegoose';
import { AccessLevel } from './types';
import { Types } from 'mongoose';
let MemberSchema = class MemberSchema {
    organization;
    user;
    access_level;
};
__decorate([
    prop({ ref: () => OrganizationSchema, required: true }),
    __metadata("design:type", Object)
], MemberSchema.prototype, "organization", void 0);
__decorate([
    prop({ ref: () => 'UserSchema', required: true }),
    __metadata("design:type", Object)
], MemberSchema.prototype, "user", void 0);
__decorate([
    prop({
        type: () => String,
        enum: AccessLevel,
        default: AccessLevel.member,
    }),
    __metadata("design:type", String)
], MemberSchema.prototype, "access_level", void 0);
MemberSchema = __decorate([
    modelOptions({ schemaOptions: { timestamps: true } })
], MemberSchema);
export { MemberSchema };
let OrganizationSchema = class OrganizationSchema {
    name;
    description;
    organization_members;
};
__decorate([
    prop({ type: () => String, required: true }),
    __metadata("design:type", String)
], OrganizationSchema.prototype, "name", void 0);
__decorate([
    prop({ type: () => String }),
    __metadata("design:type", String)
], OrganizationSchema.prototype, "description", void 0);
__decorate([
    prop({
        ref: () => 'MemberSchema',
        required: true,
        type: () => [Types.ObjectId],
    }),
    __metadata("design:type", Types.Array)
], OrganizationSchema.prototype, "organization_members", void 0);
OrganizationSchema = __decorate([
    modelOptions({ schemaOptions: { timestamps: true } })
], OrganizationSchema);
export { OrganizationSchema };
const Member = getModelForClass(MemberSchema);
const Organization = getModelForClass(OrganizationSchema);
export { Member, Organization };
