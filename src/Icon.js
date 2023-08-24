import * as THREE from 'three';

class Icon extends THREE.Object3D {
	constructor( parameters ) {
		super();
		parameters = parameters || {};
		this.cursor = parameters.cursor !== undefined ? parameters.cursor : 'default';
		let texture = parameters.texture !== undefined ? parameters.texture : new THREE.Texture( );
		texture.colorSpace = THREE.SRGBColorSpace ;
		let geometry = parameters.geometry !== undefined ? parameters.geometry : new THREE.PlaneGeometry(texture.image.width,texture.image.height);
		let base =  new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ map: texture, transparent: true}));
		this.add(base);
	}
	onmouseup ( object ) {  }
	onmousedown ( object ) {  }
	onmouseover ( object ) {  }
	onmouseout ( object ) {  }
}

export default Icon;