const palette = {
	white: '#FFFFFF',
	blue: '#41D7F5',
	lightGreen: '#E5FD8A',
	yellow: '#fff34d',
	green: 'green',
	purple: '#5A31F4',
	red: '#ff5252',
	black: '#0B0B0B',
	grey: '#A7A7A7',
	lightGrey: '#EFEFEF',
	lightdark: '#2A2A2A',
};

export const theme = {
	colors: {
		background: palette.white,
		foreground: palette.black,
		imagePicker: palette.lightGrey,
		sectionIcons: palette.grey,
		logo: palette.lightGreen,
		primary: palette.purple,
		success: palette.green,
		danger: palette.red,
		failure: palette.red,
	},
	spacing: {
		s: 8,
		m: 16,
		l: 24,
		xl: 40,
	},
	textVariants: {
		header: {
			fontFamily: 'Raleway',
			fontSize: 20,
			fontWeight: 'bold',
		},
		body: {
			fontFamily: 'Merriweather',
			fontSize: 16,
		},
	},
};

export const darkTheme = {
	...theme,
	colors: {
		...theme.colors,
		background: palette.black,
		foreground: palette.white,
		imagePicker: palette.lightdark,
	},
};