import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader';
import * as GUI from 'three.js-gui-engine';
import fontJson from './fonts/helvetiker_regular.typeface.json';

// init
const fontLoader = new FontLoader();
const font = fontLoader.parse( fontJson );

const texLoader = new THREE.TextureLoader();

const container = document.getElementById( 'example' );
container.onmousemove = onMouseMove;
container.onmouseup = onMouseUp;
container.onmousedown = onMouseDown;
container.onmousewheel = onMouseWheel;
container.addEventListener( 'DOMMouseScroll', onMouseWheel, false ); // for firefox
document.onkeydown = onKeyDown;
document.onkeypress = KeyPress;

const camera = new THREE.PerspectiveCamera( 75, container.width / container.height, 1, 10000 );
camera.position.z = 1000;
const interfaceCamera = new THREE.OrthographicCamera( -container.width/2, container.width/2, container.height/2, -container.height/2, 0, 100 );
interfaceCamera.position.set( 0, 0, 10 );

const scene = new THREE.Scene();

const geometry = new THREE.BoxGeometry( 500, 500, 500 );
const material = new THREE.MeshBasicMaterial( { color: 0x000088, wireframe: true } );
const mesh = new THREE.Mesh( geometry, material );
scene.add( mesh );

const interfaceScene = new THREE.Scene();

const button1 = new GUI.Button( { threeFont: font } ); // threeFont parameter required for text add
button1.position.set( 0, 100, 0 );
interfaceScene.add(button1);

const button2 = new GUI.Button( { threeFont: font, text: 'Three.js', textColor: 0xffa500, xHeight: 14, material: new THREE.MeshBasicMaterial({color: 0x444444}), geometry: new THREE.CircleGeometry(50,32)} );
button2.onmouseover = function(object) { this.changeColor(0x666666); }
button2.onmouseout = function(object) { this.changeColor(0x444444); }
button2.onmouseup = function(object) { console.log('THREEup'); }
button2.onmousedown = function(object) { console.log('THREEdown'); this.text = 'test'; }
button2.position.set( 280, 80, 0 );
interfaceScene.add(button2);

const panel1 = new GUI.Panel( { geometry: new THREE.PlaneGeometry(container.width/4, container.height) } );
panel1.position.set( -container.width/2+container.width/4/2, 0, -1 );
interfaceScene.add(panel1);

const label1 = new GUI.Label( { text: 'Label1', textColor: 0xff0000, threeFont: font} ); // threeFont parameter required for text add
interfaceScene.add(label1);

const label2 = new GUI.Label( { text: 'Label2', textColor: 0xffa500, threeFont: font, xHeight: 10} );
const labelWidth = Math.abs(label2.children[0].geometry.boundingBox.max.x - label2.children[0].geometry.boundingBox.min.x);
const labelHeight = Math.abs(label2.children[0].geometry.boundingBox.max.y - label2.children[0].geometry.boundingBox.min.y);
label2.position.set( -container.width/2 + labelWidth/2 + 10, container.height/2 - labelHeight/2 - 10, 0 );
interfaceScene.add(label2);

texLoader.load('bomb.png', (bomb) => {
	const icon1 = new GUI.Icon( { texture: bomb } );
	icon1.position.set(-100,100,0);
	interfaceScene.add(icon1);
});

const radiogroup1 = new GUI.RadioGroup();
radiogroup1.position.set(0,-80,1);
	const radiobutton1 = new GUI.RadioButton({threeFont: font, text: 'radiobutton1'});
	radiobutton1.position.set(0,30,0);
	radiogroup1.add(radiobutton1);
	const radiobutton2 = new GUI.RadioButton({threeFont: font, text: 'radiobutton2'});
	radiobutton2.position.set(0,-30,0);
	radiogroup1.add(radiobutton2);
interfaceScene.add(radiogroup1);

const radiogroup2 = new GUI.RadioGroup({ geometry: new THREE.PlaneGeometry(110,25), material: new THREE.MeshBasicMaterial({color:0x888888})});
radiogroup2.position.set(180,-80,1);
	const radiobutton3 = new GUI.RadioButton({threeFont: font, geometry: new THREE.PlaneGeometry(50,50)});
	radiobutton3.position.set(0,30,0);
	radiogroup2.add(radiobutton3);
	const radiobutton4 = new GUI.RadioButton({threeFont: font, geometry: new THREE.PlaneGeometry(50,50)});
	radiobutton4.position.set(0,-30,0);
	radiogroup2.add(radiobutton4);
	radiogroup2.selectedRadioButton = radiobutton4;
interfaceScene.add(radiogroup2);

const checkbox1 = new GUI.CheckBox({ threeFont: font});
checkbox1.position.set(100,100,0);
interfaceScene.add(checkbox1);

const checkbox2 = new GUI.CheckBox({
	material: new THREE.MeshBasicMaterial({color: 0x88aa88}),
	checked: true, geometry: new THREE.CircleGeometry(15,32),
	selectGeometry: new THREE.CircleGeometry(7.5,16),
	text: 'circle checkbox',
	textColor: 0x880000,
	threeFont: font
});
checkbox2.position.set(180,0,0);
checkbox2.onmouseover = function(object) { this.changeColor(0x668866); }
checkbox2.onmouseout = function(object) { this.changeColor(0x88aa88); }
interfaceScene.add(checkbox2);

const editbox1 = new GUI.EditBox( {threeFont: font, placeholder: 'editbox'} );
editbox1.position.set( 0, 50, 0 );
interfaceScene.add(editbox1);

const editbox2 = new GUI.EditBox({ password: true, placeholder: 'pass', text:'asf', geometry: new THREE.CircleGeometry(80,32), xHeight: 10, threeFont: font} );
editbox2.position.set( -150, -50, 0 );
interfaceScene.add(editbox2);
	
const scrollbar1 = new GUI.ScrollBar({geometry: new THREE.CircleGeometry(15,32)});
scrollbar1.position.set( -300, 0, 0 );
interfaceScene.add(scrollbar1);

const upscrl = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-20, 0, 0), new THREE.Vector3(0, -20, 0), new THREE.Vector3(20, 0, 0)]);
upscrl.center();
const downscrl = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-20, 0, 0), new THREE.Vector3(20, 0, 0), new THREE.Vector3(0, 20, 0)]);
downscrl.center();
const scrollbar2 = new GUI.ScrollBar({ upGeometry: upscrl,  downGeometry: downscrl });
scrollbar2.above=4;
scrollbar2.position.set(-250,0,0);
interfaceScene.add(scrollbar2);
scrollbar2.onscrollup   = function() { button1.position.y+=20; }
scrollbar2.onscrolldown = function() { button1.position.y-=20; }

const dialogBoxGroup = new THREE.Group();
	const panel2 = new GUI.Panel( { geometry: new THREE.PlaneGeometry(300,167) } );
	panel2.position.set( 0, 0, 2 );	
	dialogBoxGroup.add( panel2 );
	const label3 = new GUI.Label( { text: 'Dialog', textColor: 0xffffff, threeFont: font} ); // threeFont parameter required for text add
	label3.position.set( 0, 30, 3 );
	dialogBoxGroup.add( label3 );
	const button3 = new GUI.Button( { text: 'OK', threeFont: font } ); // threeFont parameter required for text add
	button3.position.set( 0, -40, 3 );
	button3.onmouseup = function(object) {
		dialogBoxGroup.visible = false;
	}
	dialogBoxGroup.add( button3 );
	dialogBoxGroup.visible = false;
interfaceScene.add( dialogBoxGroup );

const button4 = new GUI.Button( { text: 'open dialog', threeFont: font } );
button4.position.set( 100, 0, 0 );
button4.onmouseup = function(object) {
	dialogBoxGroup.visible = true;
}
interfaceScene.add(button4);

const renderer = new THREE.WebGLRenderer( { canvas: container, antialias: true } );
renderer.setClearColor( 0xccffcc, 1 );
renderer.autoClear = false;
renderer.localClippingEnabled = true;
renderer.setAnimationLoop( animation );

function animation( time ) {

	mesh.rotation.x = time / 2000;
	mesh.rotation.y = time / 1000;
	
	if (Math.round(time).toString() != label1.text) {
		label1.text = Math.round(time).toString();
	}
	
	renderer.clear( true, true, true );
	renderer.render( scene, camera );
	renderer.render( interfaceScene, interfaceCamera );
}

function onKeyDown(event) {
	GUI.KeyDown(event, interfaceScene);
}

function KeyPress(event) {
	GUI.KeyPress(event, interfaceScene);
}

function onMouseMove( event ) {
	const mousepos = new THREE.Vector2( (event.offsetX / container.width) * 2 - 1, -(event.offsetY / container.height) * 2 + 1 );
	GUI.MouseMove( container, mousepos, interfaceCamera, interfaceScene );
}

function onMouseUp(event) {
	var mousepos = new THREE.Vector2( (event.offsetX / container.width) * 2 - 1, -(event.offsetY / container.height) * 2 + 1 );
	GUI.MouseUp( mousepos, interfaceCamera, interfaceScene );
}

function onMouseDown(event) {
	var mousepos = new THREE.Vector2( (event.offsetX / container.width) * 2 - 1, -(event.offsetY / container.height) * 2 + 1 );
	GUI.MouseDown( mousepos, interfaceCamera, interfaceScene );
}

function onMouseWheel(event) {
	var delta = event.deltaY || event.detail || event.wheelDelta;
	delta = delta/Math.abs(delta);
	GUI.MouseWheel(delta, interfaceScene);
}