var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { getModelForClass, modelOptions, prop } from '@typegoose/typegoose';
import { Role } from './types.js';
let UserSchema = class UserSchema {
    name;
    isLoggedIn;
    role;
    email;
    password;
};
__decorate([
    prop({ type: () => String, required: true }),
    __metadata("design:type", String)
], UserSchema.prototype, "name", void 0);
__decorate([
    prop({ type: () => Boolean }),
    __metadata("design:type", Boolean)
], UserSchema.prototype, "isLoggedIn", void 0);
__decorate([
    prop({
        type: () => String,
        enum: Role,
        default: Role.user,
    }),
    __metadata("design:type", String)
], UserSchema.prototype, "role", void 0);
__decorate([
    prop({ type: () => String, required: true, unique: true, index: true }),
    __metadata("design:type", String)
], UserSchema.prototype, "email", void 0);
__decorate([
    prop({
        type: () => String,
        minlength: [6, 'Must be at least 6 characters'],
        maxlength: [100, 'Must be at most 100 characters'],
    }),
    __metadata("design:type", String)
], UserSchema.prototype, "password", void 0);
UserSchema = __decorate([
    modelOptions({ schemaOptions: { timestamps: true, id: true } })
], UserSchema);
export { UserSchema };
const User = getModelForClass(UserSchema);
export { User };
