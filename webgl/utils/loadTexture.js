import { TextureLoader, RepeatWrapping } from 'three';

const textureLoader = new TextureLoader();

export async function loadTexture(url, opts) {
	const tex = await new Promise((resolve, reject) => {
		textureLoader.load(url, (data) => {
			if (opts.onLoad) {
				opts.onLoad(data);
			}
			resolve(data);
		});
	});
	if (opts.flipY !== undefined) tex.flipY = opts.flipY;
	if (opts.magFilter) {
		tex.magFilter = opts.magFilter;
	}
	if (opts.minFilter) {
		tex.minFilter = opts.minFilter;
	}
	if (opts.repeat) {
		tex.wrapS = RepeatWrapping;
		tex.wrapT = RepeatWrapping;
	} else {
		if (opts.wrapS) tex.wrapS = opts.wrapS;
		if (opts.wrapT) tex.wrapT = opts.wrapT;
	}
}
