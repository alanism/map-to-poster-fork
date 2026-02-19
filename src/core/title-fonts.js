const FONT_BUCKET_BASE = 'https://storage.googleapis.com/ucc-map-maker-fonts-374759652109/fonts';

export const titleFonts = {
	archer: {
		name: 'Archer',
		family: 'UCCTitleArcher',
		fallback: 'serif',
		downloadUrl: `${FONT_BUCKET_BASE}/archer.otf`
	},
	gotham: {
		name: 'Gotham',
		family: 'UCCTitleGotham',
		fallback: 'sans-serif',
		downloadUrl: `${FONT_BUCKET_BASE}/gotham.otf`
	},
	knockout: {
		name: 'Knockout',
		family: 'UCCTitleKnockout',
		fallback: 'sans-serif',
		downloadUrl: `${FONT_BUCKET_BASE}/knockout.otf`
	},
	neutra_text: {
		name: 'NeutraText',
		family: 'UCCTitleNeutraText',
		fallback: 'sans-serif',
		downloadUrl: `${FONT_BUCKET_BASE}/neutratext.otf`
	},
	tungsten: {
		name: 'Tungsten',
		family: 'UCCTitleTungsten',
		fallback: 'sans-serif',
		downloadUrl: `${FONT_BUCKET_BASE}/tungsten.otf`
	},
	surveyor: {
		name: 'Surveyor',
		family: 'UCCTitleSurveyor',
		fallback: 'serif',
		downloadUrl: `${FONT_BUCKET_BASE}/surveyor.otf`
	}
};
