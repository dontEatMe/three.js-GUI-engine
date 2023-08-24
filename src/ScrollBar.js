import * as THREE from 'three';

class ScrollBar extends THREE.Object3D {
	#above;
	#below;

	get above () {
		return this.#above;
	}
	set above (num) {
		this.#above = num;
		this.#calcBasePos();
	}
	get below () {
		return this.#below;
	}
	set below (num) {
		this.#below = num;
		this.#calcBasePos();
	}
	#calcBasePos(){
		let upLength = Math.abs(this.children[1].geometry.boundingBox.max.y - this.children[1].geometry.boundingBox.min.y);
		let downLength = Math.abs(this.children[2].geometry.boundingBox.max.y - this.children[2].geometry.boundingBox.min.y);
		let sliderLength = Math.abs(this.children[0].geometry.boundingBox.max.y - this.children[0].geometry.boundingBox.min.y);
		let dist = this.children[2].position.y-this.children[1].position.y-upLength*1.2/2-downLength*1.2/2-sliderLength;
		this.children[0].position.y = this.children[2].position.y-downLength*1.2/2-sliderLength/2-dist*(this.#below/(this.#above+this.#below)); // base
	}
	constructor( parameters ) {
		super();
		parameters = parameters || {};
		this.cursor = parameters.cursor !== undefined ? parameters.cursor : 'pointer';
		this.#above = 1; // hide above
		this.#below = 1; // hide below
		let geometry = parameters.geometry !== undefined ? parameters.geometry : new THREE.PlaneGeometry(25,25);
		geometry.computeBoundingBox();
		let material = parameters.material !== undefined ? parameters.material : new THREE.MeshBasicMaterial({ color: 0x666666 });
		let base =  new THREE.Mesh(geometry, material);
		this.add(base);
		let upGeometry = parameters.upGeometry !== undefined ? parameters.upGeometry : new THREE.PlaneGeometry(25,25);
		upGeometry.computeBoundingBox();
		let up =  new THREE.Mesh(upGeometry, material.clone());
		let downGeometry = parameters.downGeometry !== undefined ? parameters.downGeometry : new THREE.PlaneGeometry(25,25);
		downGeometry.computeBoundingBox();
		let down =  new THREE.Mesh(downGeometry, material.clone());
		up.position.y-=90;
		down.position.y+=90;
		this.add(up);
		this.add(down);
		this.#calcBasePos();
	}
	changeColor( color ) {
		this.children[0].material.color.setHex(color);
		this.children[1].material.color.setHex(color);
		this.children[2].material.color.setHex(color);
	}
	onmouseup ( object ) {  }
	onmousedown ( object ) {
		if ((object == this.children[1])&&(this.above>0)) {
			this.onscrollup();
			this.below++;
			this.above--;
		}
		if ((object == this.children[2])&&(this.below>0)) {
			this.onscrolldown();
			this.above++;
			this.below--;
		}
		this.#calcBasePos();
	}
	onmouseover ( object ) {
		object.material.color.setHex(0x888888);
	}
	onmouseout ( object ) {
		object.material.color.setHex(0x666666);
	}
	onscrollup () { }
	onscrolldown () { }
}

export default ScrollBar;