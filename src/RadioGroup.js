import * as THREE from 'three';

const RADIOGROUP_SELECT = 0;

class RadioGroup extends THREE.Group {
	#selectedRadioButton = null;

	get selectedRadioButton() {
		return this.#selectedRadioButton;
	}
	set selectedRadioButton( object ) {
		this.#selectedRadioButton = object;
		this.children[RADIOGROUP_SELECT].position.x = object.position.x;
		this.children[RADIOGROUP_SELECT].position.y = object.position.y;
	}
	constructor( parameters ) {
		super();
		parameters = parameters || {};
		const geometry = parameters.geometry !== undefined ? parameters.geometry : new THREE.CircleGeometry(12.5,16);
		const material = parameters.material !== undefined ? parameters.material : new THREE.MeshBasicMaterial({ color: 0xffffff });
		const base =  new THREE.Mesh(geometry, material);
		base.position.z = 1;
		this.add(base);
	}
	add( object ) {
		if (this.children.length === 1) { // add first RadioButton
			this.selectedRadioButton = object;
		}
		return super.add(object);
	}
	changeColor( color ) {
		this.children[RADIOGROUP_SELECT].material.color.setHex(color);
	}
	onmouseup ( intersect ) { }
	onmousedown ( intersect ) { }
	onmouseover ( intersect ) { }
	onmouseout ( object ) { }
}

export { RadioGroup, RADIOGROUP_SELECT };