import { getModelForClass, modelOptions, prop } from '@typegoose/typegoose';
import { Role } from './types';

@modelOptions({ schemaOptions: { timestamps: true, id: true } })
export class UserSchema {
	@prop({ type: () => String, required: true })
	public name!: string;

	@prop({ type: () => Boolean })
	public isLoggedIn?: boolean;

	@prop({
		type: () => String,
		enum: Role,
		default: Role.user,
	})
	public role?: Role;

	@prop({ type: () => String, required: true, unique: true, index: true })
	public email!: string;

	@prop({
		type: () => String,
		minlength: [6, 'Must be at least 6 characters'],
		maxlength: [100, 'Must be at most 100 characters'],
	})
	public password?: string;
}

const UserModel = getModelForClass(UserSchema);
export default UserModel;
