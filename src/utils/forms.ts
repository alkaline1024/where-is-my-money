import { ZodError, type ZodObject } from 'zod';
import { showErrorToast } from './toasts';

export const validateForm = <T>(data: T, validators: ZodObject) => {
	const displayErrors: string[] = [];
	try {
		validators.parse(data);
	} catch (errors) {
		if (errors instanceof ZodError) {
			for (const err of errors.issues) {
				displayErrors.push(err.message);
			}
		}
	}
	if (displayErrors.length > 0) {
		showErrorToast(displayErrors.map((e) => `• ${e}`).join('\n'));
		return displayErrors;
	}
	return false;
};
