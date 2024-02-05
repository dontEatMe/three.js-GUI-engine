import * as THREE from 'three';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

class CheckBox extends THREE.Object3D {
	#text;
	#textColor;
	#xHeight;

	get text () {
		return this.#text;
	}
	set text (txt) {
		this.#text = txt;
		this.#reDraw();
	}
	get textColor () {
		return this.#textColor;
	}
	set textColor (color) {
		this.#textColor = color;
		this.children[2].material.color.setHex(this.#textColor);
	}
	constructor( parameters ) {
		super();
		parameters = parameters || {};
		this.cursor = parameters.cursor !== undefined ? parameters.cursor : 'pointer';
		this.#xHeight = parameters.xHeight !== undefined ? parameters.xHeight : 8; // x-height for font
		this.#text = parameters.text !== undefined ? parameters.text : 'checkbox';
		this.#textColor = parameters.textColor !== undefined ? parameters.textColor : 0x000000;
		this.threeFont = parameters.threeFont!==undefined ? parameters.threeFont : undefined;
		// create TextGeometry with default 100 size for get bounding box
		// use 'x' as symbol for x-height distance calculation
		let textGeometry = new TextGeometry('x', {
			font: this.threeFont,
			size: 100,
			height: 0,
			curveSegments: 4,
			bevelEnabled: false,
			bevelThickness: 0,
			bevelSize: 0,
			bevelOffset: 0,
			bevelSegments: 0
		});
		textGeometry.computeBoundingBox();
		let xHeight = Math.abs(textGeometry.boundingBox.max.y - textGeometry.boundingBox.min.y);
		let textScale = this.#xHeight/xHeight;
		textGeometry.dispose();
		this.textSize = 100*textScale;
		let geometry = parameters.geometry !== undefined ? parameters.geometry : new THREE.PlaneGeometry(50,50);
		geometry.computeBoundingBox();
		let material = parameters.material !== undefined ? parameters.material : new THREE.MeshBasicMaterial({ color: 0x666666 });
		let base = new THREE.Mesh(geometry, material);
		this.add(base);
		let selectGeometry = parameters.selectGeometry !== undefined ? parameters.selectGeometry : new THREE.PlaneGeometry(25,25);
		let selectMaterial =  parameters.selectMaterial !== undefined ? parameters.selectMaterial : new THREE.MeshBasicMaterial({ color: 0xffffff });
		let select =  new THREE.Mesh(selectGeometry, selectMaterial);
		select.visible = parameters.checked !== undefined ? parameters.checked : false;
		select.position.z = 1;
		this.add(select);
		if ( this.threeFont!==undefined ) {
			this.#generateTextMesh();
		}
	}
	set() {
		this.children[1].visible = true;
	}
	unset() {
		this.children[1].visible = false;
	}
	changeColor( color ) {
		this.children[0].material.color.setHex(color);
	}
	#generateTextMesh() {
		// regenerate TextGeometry with right scale
		let textGeometry = new TextGeometry(this.#text, {
			font: this.threeFont,
			size: this.textSize,
			height: 0,
			curveSegments: 4,
			bevelEnabled: false,
			bevelThickness: 0,
			bevelSize: 0,
			bevelOffset: 0,
			bevelSegments: 0
		});
		textGeometry.computeBoundingBox();
		let textGeometryWidth = (this.#text === '') ? 0 : Math.abs(textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x);
		let textGeometryHeight = (this.#text === '') ? 0 : Math.abs(textGeometry.boundingBox.max.y - textGeometry.boundingBox.min.y);
		let textMesh = new THREE.Mesh( textGeometry, new THREE.MeshBasicMaterial({ color: this.#textColor }) );
		let checkerWidth = Math.abs(this.children[0].geometry.boundingBox.max.x - this.children[0].geometry.boundingBox.min.x);
		textMesh.position.x = checkerWidth/2 + checkerWidth/5;
		textMesh.position.y = -this.#xHeight/2;
		this.add(textMesh);
		// for select from mouse move
		let boundingPlaneGeometry = new THREE.PlaneGeometry(textGeometryWidth, textGeometryHeight);
		let boundingPlaneMesh = new THREE.Mesh(boundingPlaneGeometry, new THREE.MeshBasicMaterial( { transparent: true, opacity: 0 } ));
		boundingPlaneMesh.position.set(textMesh.position.x+textGeometryWidth/2,textMesh.position.y+textGeometryHeight/2,textMesh.position.z);
		this.add(boundingPlaneMesh);
	}
	#reDraw() {
		if ( this.threeFont!==undefined ) {
			this.children[3].geometry.dispose();
			this.remove(this.children[3]);
			this.children[2].geometry.dispose();
			this.remove(this.children[2]);
			this.#generateTextMesh();
		}
	}
	onmouseup ( object ) {
		if (this.children[1].visible) this.unset();
		else this.set();
	}
	onmousedown ( object ) {  }
	onmouseover ( object ) {
		this.changeColor( 0x888888 );
	}
	onmouseout ( object ) {
		this.changeColor(0x666666);
	}
}

export default CheckBox;