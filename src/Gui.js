import * as THREE from 'three';
import { Button, BUTTON_BASE, BUTTON_TEXT } from './Button.js';
import { CheckBox, CHECKBOX_BASE, CHECKBOX_SELECT, CHECKBOX_TEXT } from './CheckBox.js';
import { EditBox, EDITBOX_BASE, EDITBOX_CURSOR, EDITBOX_SELECTAREA, EDITBOX_TEXT } from './EditBox.js';
import { Panel, PANEL_BASE } from './Panel.js';
import { Icon, ICON_BASE } from './Icon.js';
import { RadioGroup, RADIOGROUP_SELECT} from './RadioGroup.js';
import { RadioButton, RADIOBUTTON_BASE, RADIOBUTTON_TEXT } from './RadioButton.js';
import { Label, LABEL_TEXT } from './Label.js';
import { ScrollBar, SCROLLBAR_SLIDER, SCROLLBAR_UP, SCROLLBAR_DOWN } from './ScrollBar.js';

const VERSION = '0.5.0';

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
				if (event.keyCode == 8) { // backspace
					stopEvent(event);
					guiChild.removeLetter(true);
				} else if (event.keyCode == 46) { // delete
					guiChild.removeLetter(false);
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
						guiChild.addLetter(newletter);
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
				intersect.object.parent.onmouseover(intersect);
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
			intersect.object.parent.onmouseup(intersect);
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
			intersect.object.parent.onmousedown(intersect);
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

export {
	VERSION,
	KeyDown, KeyPress, MouseMove, MouseUp, MouseDown, MouseWheel,
	Button, BUTTON_BASE, BUTTON_TEXT,
	CheckBox, CHECKBOX_BASE, CHECKBOX_SELECT, CHECKBOX_TEXT,
	EditBox, EDITBOX_BASE, EDITBOX_CURSOR, EDITBOX_SELECTAREA, EDITBOX_TEXT,
	Panel, PANEL_BASE,
	Icon, ICON_BASE,
	RadioGroup, RADIOGROUP_SELECT,
	RadioButton, RADIOBUTTON_BASE, RADIOBUTTON_TEXT,
	Label, LABEL_TEXT,
	ScrollBar, SCROLLBAR_SLIDER, SCROLLBAR_UP, SCROLLBAR_DOWN
};