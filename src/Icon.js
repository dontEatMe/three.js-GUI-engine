import * as THREE from 'three';

const ICON_BASE = 0;

class Icon extends THREE.Object3D {
	constructor( parameters ) {
		super();
		parameters = parameters || {};
		this.cursor = parameters.cursor !== undefined ? parameters.cursor : 'default';
		const texture = parameters.texture !== undefined ? parameters.texture : new THREE.Texture( );
		texture.colorSpace = THREE.SRGBColorSpace;
		const geometry = parameters.geometry !== undefined ? parameters.geometry : new THREE.PlaneGeometry(texture.image.width,texture.image.height);
		const base =  new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ map: texture, transparent: true}));
		this.add(base);
	}
	onmouseup ( intersect ) { }
	onmousedown ( intersect ) { }
	onmouseover ( intersect ) { }
	onmouseout ( object ) { }
}

export default Icon;