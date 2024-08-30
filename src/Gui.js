import * as THREE from 'three';
import Button from './Button.js';
import CheckBox from './CheckBox.js';
import EditBox from './EditBox.js';
import Panel from './Panel.js';
import Icon from './Icon.js';
import RadioGroup from './RadioGroup.js';
import RadioButton from './RadioButton.js';
import Label from './Label.js';
import ScrollBar from './ScrollBar.js';

const VERSION = '0.4.13';

const raycaster = new THREE.Raycaster();

function stopEvent (event) {
	(event.stopPropagation) ? event.stopPropagation() : event.cancelBubble = true;
	(event.preventDefault) ? event.preventDefault() : event.returnValue = false;
}

function checkParentsVisibility ( object ) {
	let isVisible = object.visible;
	if (isVisible === true) {
		if (object.parent !== null) {
			isVisible = checkParentsVisibility(object.parent);
		}
	}
	return isVisible;
}

function doForChildren ( children, callback ) {
	children.forEach((guiChild) => {
		if (guiChild.isGroup === true) {
			doForChildren(guiChild.children, callback);
		} else {
			callback(guiChild);
		}
	});
}

function KeyDown ( event, scene ) {
	doForChildren(scene.children, (guiChild)=>{
		if (guiChild instanceof EditBox) {
			if (guiChild.active) {
				if (event.keyCode == 8) {
					stopEvent(event);
					guiChild.text=guiChild.text.slice(0,-1);
				}
			}
		}
	});
}

function KeyPress ( event, scene ) {
	doForChildren(scene.children, (guiChild)=>{
		if (guiChild instanceof EditBox) {
			if (guiChild.active) {
				if (event.keyCode != 13) {
					if (guiChild.text.length+1<=guiChild.limit) {
						const newletter = String.fromCharCode(event.keyCode||event.charCode);
						guiChild.text=guiChild.text+newletter;
					}
				}
			}
		}
	});
}

function MouseMove ( canvas, mousepos, orthocamera, scene ) { // parameter - THREE.Vector2() width coords from -1 to 1.
	raycaster.setFromCamera( mousepos, orthocamera );
	const intersects = raycaster.intersectObjects( scene.children, true );

	// TODO mouseout only for overed elements (not for all)
	doForChildren(scene.children, (guiChild)=>{
		guiChild.children.forEach( (child) => {
			guiChild.onmouseout(child);
		});
	});
	
	let bufcursor = 'default';
	
	intersects.some((intersect) => {
		if (checkParentsVisibility(intersect.object) === true) {
			if (intersect.object.parent.isGroup !== true) {
				intersect.object.parent.onmouseover(intersect.object);
				bufcursor = intersect.object.parent.cursor;
				return true;
			} else {
				return false;
			}
		} else {
			return false;
		}
	});
	canvas.style.cursor = bufcursor;
}

function MouseUp ( mousepos, orthocamera, scene ) { // parameter - THREE.Vector2() width coords from -1 to 1.
	raycaster.setFromCamera( mousepos, orthocamera, scene );
	const intersects = raycaster.intersectObjects( scene.children, true );
	intersects.some((intersect) => {
		if (checkParentsVisibility(intersect.object) === true) {
			intersect.object.parent.onmouseup(intersect.object);
			return true;
		} else {
			return false;
		}
	});
}

function MouseDown ( mousepos, orthocamera, scene ) { // parameter - THREE.Vector2() width coords from -1 to 1.
	raycaster.setFromCamera( mousepos, orthocamera );
	const intersects = raycaster.intersectObjects( scene.children, true );
	doForChildren(scene.children, (guiChild)=>{
		if (guiChild instanceof EditBox) {
			guiChild.active = false;
		}
	});
	intersects.some((intersect) => {
		if (checkParentsVisibility(intersect.object) === true) {
			intersect.object.parent.onmousedown(intersect.object);
			return true;
		} else {
			return false;
		}
	});
}

function MouseWheel ( delta, scene ) {
	doForChildren(scene.children, (guiChild)=>{
		if (guiChild instanceof ScrollBar) {
			if ((delta>0)&&(guiChild.above>0)) { // up
				guiChild.onscrollup();
				guiChild.below++;
				guiChild.above--;
			}
			if ((delta<0)&&(guiChild.below>0)) { // down
				guiChild.onscrolldown();
				guiChild.above++;
				guiChild.below--;
			}
		}
	});
}

export { VERSION, Button, CheckBox, EditBox, Panel, Icon, RadioGroup, RadioButton, Label, ScrollBar, KeyDown, KeyPress, MouseMove, MouseUp, MouseDown, MouseWheel };