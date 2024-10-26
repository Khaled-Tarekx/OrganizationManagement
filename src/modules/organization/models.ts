import {
	getModelForClass,
	modelOptions,
	prop,
	type Ref,
} from '@typegoose/typegoose';
import { UserSchema } from '../auth/models';
import { AccessLevel } from './types';
import { Types } from 'mongoose';

@modelOptions({ schemaOptions: { timestamps: true } })
export class MemberSchema {
	@prop({ ref: () => OrganizationSchema, required: true })
	public organization!: Ref<OrganizationSchema>;

	@prop({ ref: () => 'UserSchema', required: true })
	public user!: Ref<UserSchema>;

	@prop({
		type: () => String,
		enum: AccessLevel,
		default: AccessLevel.member,
	})
	public access_level!: AccessLevel;
}

@modelOptions({ schemaOptions: { timestamps: true } })
export class OrganizationSchema {
	@prop({ type: () => String, required: true })
	public name!: string;

	@prop({ type: () => String })
	public description?: string;

	@prop({
		ref: () => 'MemberSchema',
		required: true,
		type: () => [Types.ObjectId],
	})
	public organization_members!: Types.Array<Ref<'MemberSchema'>>;
}

const Member = getModelForClass(MemberSchema);
const Organization = getModelForClass(OrganizationSchema);

export { Member, Organization };
