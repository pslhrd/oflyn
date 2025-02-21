import hotMaterial from '../../utils/hotMaterial';

import fs from './GroundMaterial.frag';
import vs from './GroundMaterial.vert';

export default hotMaterial(vs, fs, (update) => {
	if (import.meta.hot) import.meta.hot.accept(update);
});
