import hotMaterial from '../../utils/hotMaterial';

import fs from './BaseMaterial.frag';
import vs from './BaseMaterial.vert';

export default hotMaterial(vs, fs, (update) => {
	if (import.meta.hot) import.meta.hot.accept(update);
});
