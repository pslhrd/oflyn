import hotMaterial from '../../utils/hotMaterial';

import fs from './PlaneMaterial.frag';
import vs from './PlaneMaterial.vert';

export default hotMaterial(vs, fs, (update) => {
	if (import.meta.hot) import.meta.hot.accept(update);
});
