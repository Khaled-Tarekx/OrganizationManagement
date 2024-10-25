import { getModelForClass, prop, type Ref } from '@typegoose/typegoose';
import { v4 as uuidv4 } from 'uuid';
import { UserSchema } from '../auth/models';
import { OrganizationSchema } from '../orgnization/models';

export class InvitationSchema {
	@prop({ type: String, default: uuidv4() })
	public token!: string;

	@prop({ ref: UserSchema, required: true })
	public user!: Ref<UserSchema>;

	@prop({ ref: OrganizationSchema, required: true })
	public organization!: Ref<OrganizationSchema>;
	@prop({
		type: Date,
		required: true,
		default: () => new Date(Date.now() + 3600 * 1000),
	})
	public expiresAt!: Date;

	@prop({ type: Date, required: true, default: new Date(Date.now()) })
	public createdAt!: Date;
}

const InvitationModel = getModelForClass(InvitationSchema);

export default InvitationModel;
