import hotMaterial from '../../utils/hotMaterial';

import fs from './ReflectorMaterial.frag';
import vs from './ReflectorMaterial.vert';

export default hotMaterial(vs, fs, (update) => {
	if (import.meta.hot) import.meta.hot.accept(update);
});
