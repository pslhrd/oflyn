import hotMaterial from '../../utils/hotMaterial';

import fs from './BancMaterial.frag';
import vs from './BancMaterial.vert';

export default hotMaterial(vs, fs, (update) => {
	if (import.meta.hot) import.meta.hot.accept(update);
});
