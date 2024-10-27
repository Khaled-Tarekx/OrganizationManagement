import z from 'zod';
export const createInviteSchema = z.object({
    user_email: z.string({
        required_error: 'user_email is required',
        invalid_type_error: 'user_email must be a string',
    }),
    organizationId: z.string({
        required_error: 'organizationId is required',
        invalid_type_error: 'organizationId must be a string',
    }),
});
export const acceptInvitationSchema = z.object({
    token: z.string({
        required_error: 'token is required',
        invalid_type_error: 'token must be a string',
    }),
});
