import Toastify from 'toastify-js';

export const showToast = ({ ...props }: Toastify.Options) => {
	Toastify({
		...props
	}).showToast();
};

export const showSuccessToast = (text: string) => {
	showToast({
		text,
		duration: 3000,
		style: { background: 'green', color: 'white' },
		newWindow: true
	});
};

export const showErrorToast = (text: string) => {
	showToast({
		text,
		duration: 5000,
		style: { background: 'red', color: 'white' },
		newWindow: true
	});
};
