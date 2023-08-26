import * as THREE from 'three';
import { TextGeometry } from 'three/addons/geometries/TextGeometry';

class Label extends THREE.Object3D {
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
		this.children[0].material.color.setHex(this.#textColor);
	}
	constructor( parameters ) {
		super();
		parameters = parameters || {};
		this.cursor = parameters.cursor !== undefined ? parameters.cursor : 'default';
		this.#xHeight = parameters.xHeight !== undefined ? parameters.xHeight : 8; // x-height for font
		this.#text = parameters.text !== undefined ? parameters.text : 'label';
		this.#textColor = parameters.textColor !== undefined ? parameters.textColor : 0xffffff;
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
		this.#generateTextMesh();
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
		let textGeometryWidth = Math.abs(textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x);
		let textGeometryHeight = Math.abs(textGeometry.boundingBox.max.y - textGeometry.boundingBox.min.y);
		let textMesh = new THREE.Mesh( textGeometry, new THREE.MeshBasicMaterial({ color: this.#textColor }) );
		textMesh.position.x = -textGeometryWidth/2;
		textMesh.position.y = -this.#xHeight/2;
		this.add(textMesh);
		// for select from mouse move
		let boundingPlaneGeometry = new THREE.PlaneGeometry(textGeometryWidth, textGeometryHeight);
		let boundingPlaneMesh = new THREE.Mesh(boundingPlaneGeometry, new THREE.MeshBasicMaterial( { transparent: true, opacity: 0 } ));
		boundingPlaneMesh.position.set(textMesh.position.x+textGeometryWidth/2,textMesh.position.y+textGeometryHeight/2,textMesh.position.z,);
		this.add(boundingPlaneMesh);
	}
	#reDraw() {
		if ( this.threeFont!==undefined ) {
			this.children[1].geometry.dispose();
			this.remove(this.children[1]);
			this.children[0].geometry.dispose();
			this.remove(this.children[0]);
			this.#generateTextMesh();
		}
	}
	onmouseup ( object ) {  }
	onmousedown ( object ) {  }
	onmouseover ( object ) {  }
	onmouseout ( object ) {  }
}

export default Label;