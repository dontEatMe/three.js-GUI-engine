import * as THREE from 'three';

const PANEL_BASE = 0;

class Panel extends THREE.Object3D {
	constructor( parameters ) {
		super();
		parameters = parameters || {};
		this.cursor = parameters.cursor !== undefined ? parameters.cursor : 'default';
		let geometry = parameters.geometry !== undefined ? parameters.geometry : new THREE.PlaneGeometry(100,25);
		let material = parameters.material !== undefined ? parameters.material : new THREE.MeshBasicMaterial({ color: 0x444444 });
		let base =  new THREE.Mesh(geometry, material);
		this.add(base);
	}
	changeColor( color ) {
		this.children[PANEL_BASE].material.color.setHex(color);
	}
	onmouseup ( object ) {  }
	onmousedown ( object ) {  }
	onmouseover ( object ) {  }
	onmouseout ( object ) {  }
}

export default Panel;