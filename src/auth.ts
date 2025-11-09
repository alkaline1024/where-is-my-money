import Cognito from '@auth/core/providers/cognito';
import { env } from '$env/dynamic/private';
import { SvelteKitAuth } from '@auth/sveltekit';

export const { handle, signIn, signOut } = SvelteKitAuth({
	providers: [
		Cognito({
			clientId: env.COGNITO_CLIENT_ID,
			clientSecret: env.COGNITO_CLIENT_SECRET,
			issuer: env.COGNITO_ISSUER,
			authorization: {
				params: {
					scope: 'openid email phone'
				}
			}
		})
	],
	callbacks: {
		async session({ session, token }) {
			// เพิ่ม user ID จาก Cognito ให้กับ session
			if (token?.sub) {
				session.user.id = token.sub;
			}
			return session;
		},
		async jwt({ token, user, account }) {
			// เก็บข้อมูลผู้ใช้ใน JWT token
			if (user) {
				token.id = user.id;
			}
			if (account) {
				token.accessToken = account.access_token;
			}
			return token;
		}
	},
	session: {
		strategy: 'jwt' // ใช้ JWT แทน database sessions
	},
	secret: env.AUTH_SECRET,
	trustHost: true,
	pages: {
		error: '/auth/error'
	}
});
