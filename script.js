var camera, scene, renderer, geometry, material, mesh;
var interfaceScene,interfaceCamera;
var t0 = new Date().getTime();
var container;
var texloader = new THREE.TextureLoader();
var bomb = texloader.load('bomb.png'); // нужно выполнять синхронно

// костыль для Firefox
function getOffset(evt)
{
	if(evt.offsetX!=undefined)
	return {x:evt.offsetX,y:evt.offsetY};
	 
	var el = evt.target;
	var offset = new THREE.Vector2();
	 
	while(el.offsetParent)
	{
	offset.x+=el.offsetLeft;
	offset.y+=el.offsetTop;
	el = el.offsetParent;
	}
	 
	offset.x = evt.pageX - offset.x;
	offset.y = evt.pageY - offset.y;
	 
	return offset;
}

function animate()
{
	var t1 = new Date().getTime();
	var ms = t1 - t0;
	t0 = t1;
	requestAnimationFrame( animate );
	mesh.rotation.x += 0.1*(ms/1000);
	mesh.rotation.y += 0.2*(ms/1000);
	renderer.clear(true,true,true);
	renderer.render(scene, camera);
	renderer.render(interfaceScene, interfaceCamera);
}

function onMouseMove(event)
{
	var offset = getOffset(event);
	var mousepos = new THREE.Vector2((offset.x / container.width ) * 2 - 1, -(offset.y / container.height ) * 2 + 1);
	GUI.MouseMove(mousepos, interfaceCamera, interfaceScene);
}

function onMouseUp(event)
{
	var offset = getOffset(event);
	var mousepos = new THREE.Vector2((offset.x / container.width ) * 2 - 1, -(offset.y / container.height ) * 2 + 1);
	GUI.MouseUp(mousepos, interfaceCamera, interfaceScene);
}

function onMouseDown(event)
{
	var offset = getOffset(event);
	var mousepos = new THREE.Vector2((offset.x / container.width ) * 2 - 1, -(offset.y / container.height ) * 2 + 1);
	GUI.MouseDown(mousepos, interfaceCamera, interfaceScene);
}

function onMouseWheel(event)
{
	var delta = event.deltaY || event.detail || event.wheelDelta;
	delta = delta/Math.abs(delta);
	GUI.MouseWheel(delta);
}

function onKeyDown(event)
{
	GUI.KeyDown(event);
}

function KeyPress(event)
{
	GUI.KeyPress(event);
}

function start()
{
	container = document.getElementById('example');
	container.onmousemove = onMouseMove;
	container.onmouseup = onMouseUp;
	container.onmousedown = onMouseDown;
	container.onmousewheel = onMouseWheel;
	container.addEventListener("DOMMouseScroll", onMouseWheel, false); // костыль для firefox
	document.onkeydown = onKeyDown;
	document.onkeypress = KeyPress;
	
	camera = new THREE.PerspectiveCamera(75, container.width / container.height, 1, 10000);
	camera.position.z = 1000;
	interfaceCamera = new THREE.OrthographicCamera( -container.width/2, container.width/2, container.height/2, -container.height/2, 0, 100 );
	interfaceCamera.position.x = 0;
	interfaceCamera.position.y = 0;
	interfaceCamera.position.z = 10;

	scene = new THREE.Scene();
	interfaceScene = new THREE.Scene();

	geometry = new THREE.BoxGeometry(500, 500, 500);
	material = new THREE.MeshBasicMaterial({ color: 0x000088, wireframe: true });

	mesh = new THREE.Mesh(geometry, material);
	scene.add(mesh);

	GUI.camera = interfaceCamera;
	GUI.scene = interfaceScene;
	
	var button = new GUI.Button(); // without parameters
	button.objectPosition.set(0,100,0);
	interfaceScene.add(button);
	
	var mat = new THREE.MeshBasicMaterial({color: 0x444444});
	var button1 = new GUI.Button( { text: '0xACAB.ru', textcolor: 'orange', font: '18px sans-serif', material: mat, geometry: new THREE.CircleBufferGeometry(50,32)} );
	button1.onmouseover = function(object) { this.changeColor(0x666666); }
	button1.onmouseout = function(object) { this.changeColor(0x444444); }
	button1.onmouseup = function(object) { console.log('ACABup'); }
	button1.onmousedown = function(object) { console.log('ACABdown'); }
	button1.objectPosition.set(280,80,0);
	interfaceScene.add(button1);
	
	var panel = new GUI.Panel( { color: 0x444444, geometry: new THREE.PlaneBufferGeometry(container.width/4, container.height)} );
	panel.objectPosition.set(-container.width/2+container.width/4/2,0,-1);
	interfaceScene.add(panel);

	var label1 = new GUI.Label( { text: 'Label1', textcolor: 'red', font: '18px sans-serif'} );
	interfaceScene.add(label1);

	var label2 = new GUI.Label( { text: 'Label2', textcolor: 'orange', font: '18px sans-serif'} );
	label2.objectPosition.set(-container.width/2+label2.children[0].geometry.parameters.width/2,container.height/2-label2.children[0].geometry.parameters.height/2,0);
	interfaceScene.add(label2);

	var icon1 = new GUI.Icon( { texture: bomb } );
	icon1.objectPosition.set(-100,100,0);
	interfaceScene.add(icon1);
	
	var radiogroup1 = new GUI.RadioGroup();
	radiogroup1.objectPosition.set(0,-50,1);
	//interfaceScene.add(radiogroup1);
	var radiobutton1 = new GUI.RadioButton({group: radiogroup1, text: ''});
	radiobutton1.objectPosition.set(0,-50,0);
	interfaceScene.add(radiobutton1);
	var radiobutton2 = new GUI.RadioButton({group: radiogroup1, text: 'radiobutton2'});
	radiobutton2.objectPosition.set(0,-110,0);
	interfaceScene.add(radiobutton2);
	
	var radiogroup2 = new GUI.RadioGroup({ geometry: new THREE.PlaneBufferGeometry(125,25), material: new THREE.MeshBasicMaterial({color:0x888888})} );
	radiogroup2.objectPosition.set(180,-110,1);
	
	var radiobutton3 = new GUI.RadioButton({geometry:new THREE.PlaneBufferGeometry(50,50), group: radiogroup2});
	radiobutton3.objectPosition.set(180,-50,0);
	interfaceScene.add(radiobutton3);
	var radiobutton4 = new GUI.RadioButton({geometry:new THREE.PlaneBufferGeometry(50,50), group: radiogroup2});
	radiobutton4.objectPosition.set(180,-110,0);
	interfaceScene.add(radiobutton4);
	radiobutton4.add(radiogroup2);
	
	var checkbox1 = new GUI.CheckBox();
	checkbox1.objectPosition.set(100,100,0);
	interfaceScene.add(checkbox1);
	
	var mat = new THREE.MeshBasicMaterial({color: 0x88AA88});
	var checkbox2 = new GUI.CheckBox({ material: mat ,checked: true, geometry: new THREE.CircleBufferGeometry(15,32),  selectgeometry: new THREE.CircleBufferGeometry(7.5,16), text: "чекбокс", textcolor: "#880000"});
	checkbox2.objectPosition.set(180,0,0);
	checkbox2.onmouseover = function(object) { this.changeColor(0x668866); }
	checkbox2.onmouseout = function(object) { this.changeColor(0x88AA88); }
	interfaceScene.add(checkbox2);
	
	var editbox1 = new GUI.EditBox();
	editbox1.objectPosition.set(0,50,0);
	interfaceScene.add(editbox1);
	
	var editbox2 = new GUI.EditBox({ password: true, tip: "pass", text:'asf', geometry: new THREE.CircleBufferGeometry(80,32), font:'24px sans-serif'} );
	editbox2.objectPosition.set(-150,-50,0);
	interfaceScene.add(editbox2);
	
	var scrollbar1 = new GUI.ScrollBar({ checked: true, geometry: new THREE.CircleBufferGeometry(15,32), text: "чекбокс", textcolor: "#880000"});
	scrollbar1.objectPosition.set(-300,0,0);
	interfaceScene.add(scrollbar1);

	// рассчитать boundingbox для геометрии
	var upnormal = new THREE.Vector3( 0, 0, 1 );
	var upscrl = new THREE.Geometry();
	upscrl.vertices.push(new THREE.Vector3(-20, 0, 0));
	upscrl.vertices.push(new THREE.Vector3(0, -20, 0));
	upscrl.vertices.push(new THREE.Vector3(20, 0, 0));
	upscrl.parameters=[];
	upscrl.parameters.height = 10;
	
	var upface=new THREE.Face3(0,1,2);
	upface.normal.copy( upnormal );
	upface.vertexNormals.push( upnormal.clone(), upnormal.clone(), upnormal.clone(), upnormal.clone() );
	upscrl.faces.push(upface);
	
	var downnormal = new THREE.Vector3( 0, 0, 1 );
	var downscrl = new THREE.Geometry();
	downscrl.vertices.push(new THREE.Vector3(-20, 0, 0));
	downscrl.vertices.push(new THREE.Vector3(20, 0, 0));
	downscrl.vertices.push(new THREE.Vector3(0, 20, 0));

	downscrl.parameters=[];
	downscrl.parameters.height = 10;
	
	var downface=new THREE.Face3(0,1,2);
	downface.normal.copy( downnormal );
	downface.vertexNormals.push( downnormal.clone(), downnormal.clone(), downnormal.clone(), downnormal.clone() );
	downscrl.faces.push(downface);
	
	var scrollbar2 = new GUI.ScrollBar({ upgeometry: upscrl,  downgeometry: downscrl });
	scrollbar2.above=4;
	scrollbar2.objectPosition.set(-250,0,0);
	interfaceScene.add(scrollbar2);
	scrollbar2.onscrollup   = function() { button.position.y+=20; }
	scrollbar2.onscrolldown = function() { button.position.y-=20; }
	
	var button3 = new GUI.Button({text: "open dialog"}); // without parameters
	button3.objectPosition.set(100,0,0);
	button3.onmouseup = function(object)
	{
		var dialogbox1 = new GUI.DialogBox({ text: "Диалог", textcolor: "#ffffff", type:0});
		dialogbox1.onmouseup = function(object)
		{
			if ((object==this.children[2])||(object==this.children[3]))
			{
				console.log('ok');
				interfaceScene.remove(this);
			}
			if ((object==this.children[4])||(object==this.children[5])) interfaceScene.remove(this);
		}
		dialogbox1.objectPosition.set(0,0,2);
		interfaceScene.add(dialogbox1);
		
	}
	interfaceScene.add(button3);
	
	//while (GUI.scene.children.length>0) GUI.scene.remove(GUI.scene.children[0]);
	
	renderer = new THREE.WebGLRenderer({ canvas: container, antialias: true});
	renderer.setClearColor(0xffffff,1);
	renderer.autoClear=false;
	renderer.sortObjects = false
	renderer.forceClear=false;
	animate();
}