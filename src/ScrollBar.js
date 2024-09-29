import * as THREE from 'three';

const SCROLLBAR_SLIDER = 0;
const SCROLLBAR_UP     = 1;
const SCROLLBAR_DOWN   = 2;

class ScrollBar extends THREE.Object3D {
	#above = 1; // hide above
	#below = 1; // hide below

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
	#calcBasePos() {
		let upLength = Math.abs(this.children[SCROLLBAR_UP].geometry.boundingBox.max.y - this.children[SCROLLBAR_UP].geometry.boundingBox.min.y);
		let downLength = Math.abs(this.children[SCROLLBAR_DOWN].geometry.boundingBox.max.y - this.children[SCROLLBAR_DOWN].geometry.boundingBox.min.y);
		let sliderLength = Math.abs(this.children[SCROLLBAR_SLIDER].geometry.boundingBox.max.y - this.children[SCROLLBAR_SLIDER].geometry.boundingBox.min.y);
		let dist = this.children[SCROLLBAR_DOWN].position.y-this.children[SCROLLBAR_UP].position.y-upLength*1.2/2-downLength*1.2/2-sliderLength;
		this.children[SCROLLBAR_SLIDER].position.y = this.children[SCROLLBAR_DOWN].position.y-downLength*1.2/2-sliderLength/2-dist*(this.#below/(this.#above+this.#below)); // base
	}
	constructor( parameters ) {
		super();
		parameters = parameters || {};
		this.cursor = parameters.cursor !== undefined ? parameters.cursor : 'pointer';
		const geometry = parameters.geometry !== undefined ? parameters.geometry : new THREE.PlaneGeometry(25,25);
		geometry.computeBoundingBox();
		const material = parameters.material !== undefined ? parameters.material : new THREE.MeshBasicMaterial({ color: 0x666666 });
		const base =  new THREE.Mesh(geometry, material);
		this.add(base);
		const upGeometry = parameters.upGeometry !== undefined ? parameters.upGeometry : new THREE.PlaneGeometry(25,25);
		upGeometry.computeBoundingBox();
		const up =  new THREE.Mesh(upGeometry, material.clone());
		const downGeometry = parameters.downGeometry !== undefined ? parameters.downGeometry : new THREE.PlaneGeometry(25,25);
		downGeometry.computeBoundingBox();
		const down =  new THREE.Mesh(downGeometry, material.clone());
		up.position.y-=90;
		down.position.y+=90;
		this.add(up);
		this.add(down);
		this.#calcBasePos();
	}
	changeColor( color ) {
		this.children[SCROLLBAR_SLIDER].material.color.setHex(color);
		this.children[SCROLLBAR_UP].material.color.setHex(color);
		this.children[SCROLLBAR_DOWN].material.color.setHex(color);
	}
	onmouseup ( intersect ) { }
	onmousedown ( intersect ) {
		if ((intersect.object == this.children[SCROLLBAR_UP])&&(this.above>0)) {
			this.onscrollup();
			this.below++;
			this.above--;
		}
		if ((intersect.object == this.children[SCROLLBAR_DOWN])&&(this.below>0)) {
			this.onscrolldown();
			this.above++;
			this.below--;
		}
		this.#calcBasePos();
	}
	onmouseover ( intersect ) {
		intersect.object.material.color.setHex(0x888888);
	}
	onmouseout ( object ) {
		object.material.color.setHex(0x666666);
	}
	onscrollup () { }
	onscrolldown () { }
}

export default ScrollBar;