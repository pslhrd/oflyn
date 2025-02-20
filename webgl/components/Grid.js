import { BaseComponent } from '../core/BaseComponent';
import { GridHelper } from 'three';

export default class Grid extends BaseComponent {
	init() {
		this.base = new GridHelper(20, 20, '#3E3E3E', '#3E3E3E');
	}
}
