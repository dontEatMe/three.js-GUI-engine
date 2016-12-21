var GUI = { VERSION: '0.1' };
GUI.raycaster = new THREE.Raycaster();
GUI.stopEvent = function (event) 
{
	(event.stopPropagation) ? event.stopPropagation() : event.cancelBubble = true;
    (event.preventDefault) ? event.preventDefault() : event.returnValue = false;
}
GUI.KeyDown = function ( event )
{
	for (var i=0; i<GUI.scene.children.length; i++)
	{
		if (GUI.scene.children[i] instanceof GUI.EditBox)
		{
			if (GUI.scene.children[i].active)
			{
				if (event.keyCode==8)
				{
					this.stopEvent(event);
					GUI.scene.children[i].text=GUI.scene.children[i].text.slice(0,-1);
					GUI.scene.children[i].reDraw();
				}
			}
		}
	}
}

GUI.KeyPress = function ( event )
{
	for (var i=0; i<GUI.scene.children.length; i++)
	{
		if (GUI.scene.children[i] instanceof GUI.EditBox)
		{
			if	(GUI.scene.children[i].active)
			{
				if (event.keyCode!=13)
				{
					if (GUI.scene.children[i].text.length+1<=GUI.scene.children[i].limit)
					{
						var newletter = String.fromCharCode(event.keyCode||event.charCode);
						GUI.scene.children[i].text=GUI.scene.children[i].text+newletter;
						GUI.scene.children[i].reDraw();
					}
				}
			}
		}
	}
}

GUI.MouseMove = function ( mousepos, orthocamera, scene ) // parameter - THREE.Vector2() width coords from -1 to 1.
{
	GUI.raycaster.setFromCamera( mousepos, orthocamera );
	var intersects = GUI.raycaster.intersectObjects( scene.children, true );
	for (var l=0; l<GUI.scene.children.length; l++) // пока так
	{
		for (var j=0; j<GUI.scene.children[l].children.length; j++)
		{
			GUI.scene.children[l].onmouseout(GUI.scene.children[l].children[j]);
		}
	};
	var bufcursor = 'default';
	// проблема в том, что текст, находящийся над элементом попадает под пересечение, а значит необходимо искать следующее пересечение.
	if (intersects.length>0)
	{
		intersects[0].object.parent.onmouseover(intersects[0].object);
		if ((!(intersects[0].object.parent instanceof GUI.Panel))&&(!(intersects[0].object.parent instanceof GUI.Label))&&
		(!(intersects[0].object.parent instanceof GUI.Icon))&&(!(intersects[0].object.parent instanceof GUI.RadioGroup))&&
		(!((intersects[0].object.parent instanceof GUI.DialogBox)&&((intersects[0].object==intersects[0].object.parent.children[0])||(intersects[0].object==intersects[0].object.parent.children[1])))))
		{
			bufcursor = 'pointer';
		}
		if (intersects[0].object.parent instanceof GUI.RadioGroup)
		{
			if (intersects[0].object.parent.parent!=null)
			{
				if (intersects[0].object.parent.objectPosition.z>intersects[0].object.parent.parent.objectPosition.z)
				{
					for (var i=1; i<intersects.length; i++)
					{
						if (intersects[i].object.parent.group==intersects[0].object.parent)
						{
							intersects[i].object.parent.onmouseover(intersects[0].object);
							bufcursor = 'pointer';
						}
					}
				}
			}
		}
	}
	container.style.cursor = bufcursor;
};

GUI.MouseUp = function ( mousepos, orthocamera, scene ) // parameter - THREE.Vector2() width coords from -1 to 1.
{
	GUI.raycaster.setFromCamera( mousepos, orthocamera, scene );
	var intersects = GUI.raycaster.intersectObjects( scene.children, true );
	if (intersects.length>0)
	{
		intersects[0].object.parent.onmouseup(intersects[0].object);
		return true;
	}
	else return false;
};

GUI.MouseDown = function ( mousepos, orthocamera, scene ) // parameter - THREE.Vector2() width coords from -1 to 1.
{
	GUI.raycaster.setFromCamera( mousepos, orthocamera );
	var intersects = GUI.raycaster.intersectObjects( scene.children, true );
	for (var l=0; l<GUI.scene.children.length; l++) // пока так
	{
		for (var j=0; j<GUI.scene.children[l].children.length; j++)
		{
			if (GUI.scene.children[l] instanceof GUI.EditBox)
			{
				if (!GUI.scene.children[l].activeAlways)
				{
					GUI.scene.children[l].active = false;
					GUI.scene.children[l].reDraw();
				}
			}
		}
	};
	if (intersects.length>0)
	{
		intersects[0].object.parent.onmousedown(intersects[0].object);
		return true;
	}
	else return false;
};

GUI.MouseWheel = function ( delta )
{
	for (var l=0; l<GUI.scene.children.length; l++)
	{
		if (GUI.scene.children[l] instanceof GUI.ScrollBar)
		{
			if ((delta>0)&&(GUI.scene.children[l].above>0)) // up
			{
				GUI.scene.children[l].onscrollup();
				GUI.scene.children[l].below++;
				GUI.scene.children[l].above--;
			}
			if ((delta<0)&&(GUI.scene.children[l].below>0)) // down
			{
				GUI.scene.children[l].onscrolldown();
				GUI.scene.children[l].above++;
				GUI.scene.children[l].below--;
			}
			// call setter
			GUI.scene.children[l].objectPosition.y = GUI.scene.children[l].objectPosition.y;
		}
	}
}

// TODO:
// вызов onmouseover/onmouseout события только при наведении/отведении посредством булевой переменной
// сделать событие onmouseclick, т.е последовательно mousedown и mouseup
// все позиции выставляются через сеттер, посредством new THREE.Vector2(x,y);
// текст везде должен идти отдельно прозрачным спрайтом с текстом.
// материал и геометрия передаются параметрами, есть дефолтные материалы и геометрии
// у радиогруппы должна задаваться не позиция, а выбранная кнопка
// размер текста должен задаваться в пикселах, а потом уже должна формироваться строка для css
// при клике на надпись чекбоксы и радиобаттоны должны менять состояние, для этого при проходе по элементам в зависимости от их типа также проходим по подэлементам.
// размер спрайта с текстом должен пересчитываться при каждом вызове reDraw(), а еще лучше посредством сеттера на text и font.
// заменить индексы элементов осмысленными названиями - ассоциативный массив - объект с полями
// вычисление GUI.объекта по объекту - проблема, которая решается либо циклом со сравнением, либо введением в объекты нового поля guiElement.
// ряд элементов являются составными, это значит, что для них можно использовать комбинацию из базовых элементов.
// так, radiobutton является группой элементов: label, button, selector(необходимо описать|используется ссылка на этот элемент, удаляется при удалении последней кнопки)
// scrollbar является группой элементов: button
// dialogbox является группой элементов: button, label, plane
// GUI.ComboControl - элемент группировки, на него имеются ссылки и его элементов - Element.combo, если элемент не комбинированный, то это поле null.
// тут еще на полмесяца работы
// у любого объекта есть слои. Есть какое-то кол-во слоев по дефолту, можно добавлять свои слои.
// скроллбар полоса зависит от mousedown(зажимается, ассоциируется с mousemove), mouseup(отжимается), mousemove(y(x)=mouse x(y)(с лимитами на стрелках))

GUI.Button = function ( parameters )
{
	THREE.Object3D.call( this );
	parameters = parameters || {};
	this.objectPosition = new THREE.Vector3();
	this.text = parameters.text !== undefined ? parameters.text : "button";
	this.csstextcolor = parameters.textcolor !== undefined ? parameters.textcolor : "#ffffff";
	this.cssfont = parameters.font !== undefined ? parameters.font : '16px sans-serif';
	var geometry = parameters.geometry !== undefined ? parameters.geometry : new THREE.PlaneBufferGeometry(100,25);
	var material = parameters.material !== undefined ? parameters.material : new THREE.MeshBasicMaterial({ color: 0x666666 });
	var base =  new THREE.Mesh(geometry, material);
	var x = document.createElement( 'canvas' );
	x.width = 1;
	x.height = 1;
	var texture = new THREE.CanvasTexture( x );
	texture.minFilter = THREE.LinearFilter;
	var xm = new THREE.MeshBasicMaterial( { map: texture, transparent: true } );
	var sprite = new THREE.Mesh(new THREE.PlaneBufferGeometry(x.width,x.height),xm);
	sprite.position.z = 1;
	sprite.position.x = 100;
	this.add(base);
	this.add(sprite);
	var this1 = this;
	Object.defineProperties	(
		this.objectPosition,
		{
			x:
			{
				set : function(x)
				{
					for (var i=0; i<this1.children.length; i++)
					{
						this1.children[i].position.x = x;
					}
				},
				get : function()
				{
					return this1.children[0].position.x;
				}
			},
			y:
			{
				set : function(y)
				{
					for (var i=0; i<this1.children.length; i++)
					{
						this1.children[i].position.y = y;
					}
				},
				get : function()
				{
					return this1.children[0].position.y;
				}
			},
			z:
			{
				set : function(z)
				{
					for (var i=0; i<this1.children.length; i++)
					{
						this1.children[i].position.z = z;
					}
				},
				get : function()
				{
					return this1.children[0].position.z;
				}
			}
		}
	);
	this.reDraw();
};
GUI.Button.prototype = 
{
	constructor : GUI.Button,
	__proto__ : THREE.Object3D.prototype,
	changeColor : function (color)
	{
		this.children[0].material.color.setHex(color);
	},
	reDraw : function()
	{
		if (this.text.length>0)
		{
			var str = document.createTextNode(this.text);
			var obj = document.createElement( 'A' );
			obj.appendChild( str );
			document.body.appendChild( obj );
			obj.style.font=this.cssfont;
			this.children[1].material.map.image.width = obj.offsetWidth;
			this.children[1].material.map.image.height = obj.offsetHeight;
			this.children[1].geometry = new THREE.PlaneBufferGeometry(obj.offsetWidth,obj.offsetHeight);
			var xc = this.children[1].material.map.image.getContext( "2d" );
			xc.clearRect(0, 0, this.children[1].material.map.image.width, this.children[1].material.map.image.height);
			xc.textBaseline = 'middle';
			xc.font = this.cssfont;
			xc.fillStyle = this.csstextcolor;
			xc.fillText(this.text, 0, this.children[1].material.map.image.height/2);
			document.body.removeChild(obj);
		}
		else // в хроме с нулевой длиной выбивает warning
		{
			var xc = this.children[1].material.map.image.getContext( "2d" );
			xc.clearRect(0, 0, this.children[1].material.map.image.width, this.children[1].material.map.image.height);
		}
		this.children[1].material.map.needsUpdate = true;
	},
	onmouseup   : function(object) {  },
	onmousedown : function(object) {  },
	onmouseover : function(object) { this.changeColor(0x888888); },
	onmouseout  : function(object) { this.changeColor(0x666666); }
}

GUI.Panel = function ( parameters )
{
	THREE.Object3D.call( this );
	parameters = parameters || {};
	this.objectPosition = new THREE.Vector3();
	var geometry = parameters.geometry !== undefined ? parameters.geometry : new THREE.PlaneBufferGeometry(100,25);
	var material = parameters.material !== undefined ? parameters.material : new THREE.MeshBasicMaterial({ color: 0x444444 });
	var base =  new THREE.Mesh(geometry, material);
	this.add(base);
	var this1 = this;
	Object.defineProperties	(
		this.objectPosition,
		{
			x:
			{
				set : function(x)
				{
					for (var i=0; i<this1.children.length; i++)
					{
						this1.children[i].position.x = x;
					}
				},
				get : function()
				{
					return this1.children[0].position.x;
				}
			},
			y:
			{
				set : function(y)
				{
					for (var i=0; i<this1.children.length; i++)
					{
						this1.children[i].position.y = y;
					}
				},
				get : function()
				{
					return this1.children[0].position.y;
				}
			},
			z:
			{
				set : function(z)
				{
					for (var i=0; i<this1.children.length; i++)
					{
						this1.children[i].position.z = z;
					}
				},
				get : function()
				{
					return this1.children[0].position.z;
				}
			}
		}
	);
};

GUI.Panel.prototype = 
{
	constructor : GUI.Panel,
	__proto__ : THREE.Object3D.prototype,
	changeColor : function (color)
	{
		this.children[0].material.color.setHex(color);
	},
	onmouseup   : function(object) {  },
	onmousedown : function(object) {  },
	onmouseover : function(object) {  },
	onmouseout  : function(object) {  }
}

GUI.Label = function ( parameters )
{
	THREE.Object3D.call( this );
	parameters = parameters || {};
	this.objectPosition = new THREE.Vector3();
	this.text = parameters.text !== undefined ? parameters.text : "label";
	this.csstextcolor = parameters.textcolor !== undefined ? parameters.textcolor : "#000000";
	this.cssfont = parameters.font !== undefined ? parameters.font : '16px sans-serif';
	var x = document.createElement( 'canvas' );
	x.width = 1;
	x.height = 1;
	var texture = new THREE.CanvasTexture( x );
	texture.minFilter = THREE.LinearFilter;
	var xm = new THREE.MeshBasicMaterial( { map: texture, transparent: true } );
	var sprite = new THREE.Mesh(new THREE.PlaneBufferGeometry(x.width,x.height),xm);
	this.add(sprite);
	var this1 = this;
	Object.defineProperties	(
		this.objectPosition,
		{
			x:
			{
				set : function(x)
				{
					for (var i=0; i<this1.children.length; i++)
					{
						this1.children[i].position.x = x;
					}
				},
				get : function()
				{
					return this1.children[0].position.x;
				}
			},
			y:
			{
				set : function(y)
				{
					for (var i=0; i<this1.children.length; i++)
					{
						this1.children[i].position.y = y;
					}
				},
				get : function()
				{
					return this1.children[0].position.y;
				}
			},
			z:
			{
				set : function(z)
				{
					for (var i=0; i<this1.children.length; i++)
					{
						this1.children[i].position.z = z;
					}
				},
				get : function()
				{
					return this1.children[0].position.z;
				}
			}
		}
	);
	this.reDraw();
};
GUI.Label.prototype = 
{
	constructor : GUI.Label,
	__proto__ : THREE.Object3D.prototype,
	reDraw : function()
	{
		if (this.text.length>0)
		{
			var str = document.createTextNode(this.text);
			var obj = document.createElement( 'A' );
			obj.appendChild( str );
			document.body.appendChild( obj );
			obj.style.font=this.cssfont;
			this.children[0].material.map.image.width = obj.offsetWidth;
			this.children[0].material.map.image.height = obj.offsetHeight;
			this.children[0].geometry = new THREE.PlaneBufferGeometry(obj.offsetWidth,obj.offsetHeight);
			var xc = this.children[0].material.map.image.getContext( "2d" );
			xc.clearRect(0, 0, this.children[0].material.map.image.width, this.children[0].material.map.image.height);
			xc.textBaseline = 'middle';
			xc.font = this.cssfont;
			xc.fillStyle = this.csstextcolor;
			xc.fillText(this.text, this.children[0].material.map.image.width/2-obj.offsetWidth/2, this.children[0].material.map.image.height/2);
			document.body.removeChild(obj);
		}
		else // в хроме с нулевой длиной выбивает warning
		{
			var xc = this.children[0].material.map.image.getContext( "2d" );
			xc.clearRect(0, 0, this.children[0].material.map.image.width, this.children[0].material.map.image.height);
		}
		this.children[0].material.map.needsUpdate = true;
	},
	onmouseup   : function(object) {  },
	onmousedown : function(object) {  },
	onmouseover : function(object) {  },
	onmouseout  : function(object) {  }
}

GUI.Icon = function ( parameters )
{
	THREE.Object3D.call( this );
	parameters = parameters || {};
	this.objectPosition = new THREE.Vector3();
	var texture = parameters.texture !== undefined ? parameters.texture : new THREE.Texture( );
	texture.minFilter = THREE.LinearFilter;
	var geometry = parameters.geometry !== undefined ? parameters.geometry : new THREE.PlaneBufferGeometry(texture.image.width,texture.image.height);
	var base =  new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ map: texture, transparent: true}));
	this.add(base);
	var this1 = this;
	Object.defineProperties	(
		this.objectPosition,
		{
			x:
			{
				set : function(x)
				{
					for (var i=0; i<this1.children.length; i++)
					{
						this1.children[i].position.x = x;
					}
				},
				get : function()
				{
					return this1.children[0].position.x;
				}
			},
			y:
			{
				set : function(y)
				{
					for (var i=0; i<this1.children.length; i++)
					{
						this1.children[i].position.y = y;
					}
				},
				get : function()
				{
					return this1.children[0].position.y;
				}
			},
			z:
			{
				set : function(z)
				{
					for (var i=0; i<this1.children.length; i++)
					{
						this1.children[i].position.z = z;
					}
				},
				get : function()
				{
					return this1.children[0].position.z;
				}
			}
			
		}
	);
};
GUI.Icon.prototype = 
{
	constructor : GUI.Icon,
	__proto__ : THREE.Object3D.prototype,
	onmouseup   : function(object) {  },
	onmousedown : function(object) {  },
	onmouseover : function(object) {  },
	onmouseout  : function(object) {  }
}

// Abstract radiobutton is static elements and dinamic element
// радиогруппа не может быть выделена или кликнута, тем не менее она является элементом
// радиогруппа является потомком радиокнопки
GUI.RadioGroup = function ( parameters )
{
	THREE.Object3D.call( this );
	parameters = parameters || {};
	this.objectPosition = new THREE.Vector3();
	var geometry = parameters.geometry !== undefined ? parameters.geometry : new THREE.CircleBufferGeometry(12.5,16);
	var material = parameters.material !== undefined ? parameters.material : new THREE.MeshBasicMaterial({ color: 0xffffff });
	var base =  new THREE.Mesh(geometry, material);
	base.position.z = 1;
	this.add(base);
	var this1 = this;
	Object.defineProperties	(
		this.objectPosition,
		{
			x:
			{
				set : function(x)
				{
					this1.children[0].position.x = x;
				},
				get : function()
				{
					return this1.children[0].position.x;
				}
			},
			y:
			{
				set : function(y)
				{
					this1.children[0].position.y = y;
				},
				get : function()
				{
					return this1.children[0].position.y;
				}
			},
			z:
			{
				set : function(z)
				{
					this1.children[0].position.z = z;
				},
				get : function()
				{
					return this1.children[0].position.z;
				}
			}
		}
	);
};

GUI.RadioGroup.prototype = 
{
	constructor : GUI.RadioGroup,
	__proto__ : THREE.Object3D.prototype,
	onmouseup   : function(object) {  },
	onmousedown : function(object) {  },
	onmouseover : function(object) {  },
	onmouseout  : function(object) {  }
}

// при создании передается группа, к которой принадлежит кнопка
// при возникновении события onmouseup выделение через группу устанавливается на кнопку.
// группа является по сути выделителем, ее base выделяет радиокнопки.
GUI.RadioButton = function ( parameters )
{
	THREE.Object3D.call( this );
	parameters = parameters || {};
	this.objectPosition = new THREE.Vector3();
	// RadioButton должен принадлежать к какой-либо группе, т.к это взаимоисключающая кнопка
	this.group = parameters.group; // GUI.RadioGroup
	var geometry = parameters.geometry !== undefined ? parameters.geometry : new THREE.CircleBufferGeometry(25,32);
	var material = parameters.material !== undefined ? parameters.material : new THREE.MeshBasicMaterial({ color: 0x666666 });
	var base =  new THREE.Mesh(geometry, material);
	this.text = parameters.text !== undefined ? parameters.text : "radiobutton";
	this.csstextcolor = parameters.textcolor !== undefined ? parameters.textcolor : "#000000";
	this.cssfont = parameters.font !== undefined ? parameters.font : '16px monospace';
	
	var x = document.createElement( 'canvas' );
	var str = document.createTextNode(this.text);
	var obj = document.createElement( 'A' );
	obj.appendChild( str );
	document.body.appendChild( obj );
	obj.style.font=this.cssfont;
	if (this.text.length>0)
	{
		x.width = obj.offsetWidth;
		x.height = obj.offsetHeight;
	}
	else
	{
		x.width  = 1;
		x.height = 1
	}
	var texture = new THREE.CanvasTexture( x );
	texture.minFilter = THREE.LinearFilter;
	var xm = new THREE.MeshBasicMaterial( { map: texture, transparent: true } );
	var sprite = new THREE.Mesh(new THREE.PlaneBufferGeometry(obj.offsetWidth,obj.offsetHeight),xm);
	document.body.removeChild(obj);
	this.add(base);
	this.add(sprite);
	var this1 = this;
	Object.defineProperties	(
		this.objectPosition,
		{
			x:
			{
				set : function(x)
				{
					if (this1.group.parent==this1)
					{
						this1.group.objectPosition.x=x;
					}
					this1.children[0].position.x = x;
					if (this1.children[0].geometry instanceof THREE.PlaneBufferGeometry) this1.children[1].position.x = x+this1.children[1].material.map.image.width/2+this1.children[0].geometry.parameters.width/2+this1.children[0].geometry.parameters.width/5;
					else this1.children[1].position.x = x+this1.children[1].material.map.image.width/2+this1.children[0].geometry.parameters.radius*1.2;
				},
				get : function()
				{
					return this1.children[0].position.x;
				}
			},
			y:
			{
				set : function(y)
				{
					if (this1.group.parent==this1)
					{
						this1.group.objectPosition.y=y;
					}
					this1.children[0].position.y = y;
					this1.children[1].position.y = y;

				},
				get : function()
				{
					return this1.children[0].position.y;
				}
			},
			z:
			{
				set : function(z)
				{
					this1.children[0].position.z = z;
					this1.children[1].position.z = z;
				},
				get : function()
				{
					return this1.children[0].position.z;
				}
			}
		}
	);
	this.reDraw();
};
GUI.RadioButton.prototype = 
{
	constructor : GUI.RadioButton,
	__proto__ : THREE.Object3D.prototype,
	set : function ()
	{
		this.add(this.group);
		this.group.objectPosition.x = this.objectPosition.x;
		this.group.objectPosition.y = this.objectPosition.y;
	},
	changeColor : function (color)
	{
		this.children[0].material.color.setHex(color);
	},
	reDraw : function ()
	{
		if (this.text.length>0)
		{
			var xc = this.children[1].material.map.image.getContext( "2d" );
			xc.clearRect(0, 0, this.children[1].material.map.image.width, this.children[1].material.map.image.height);
			xc.textBaseline = 'middle';
			xc.font = this.cssfont;
			xc.fillStyle = this.csstextcolor;
			var str = document.createTextNode(this.text);
			var obj = document.createElement( 'A' );
			obj.appendChild( str );
			document.body.appendChild( obj );
			obj.style.font=xc.font;
			xc.fillText(this.text, this.children[1].material.map.image.width/2-obj.offsetWidth/2, this.children[1].material.map.image.height/2);
			document.body.removeChild(obj);
			this.children[1].material.map.needsUpdate = true;
		}
	},
	onmouseup   : function(object) { this.set(); },
	onmousedown : function(object) {  },
	onmouseover : function(object) { this.changeColor(0x888888); },
	onmouseout  : function(object) { this.changeColor(0x666666); }
}

// чекбокс независим
// у каждого чекбокса есть выделяемое и выделитель
// форма имеется только у выделяемого
GUI.CheckBox = function ( parameters )
{
	THREE.Object3D.call( this );
	parameters = parameters || {};
	this.objectPosition = new THREE.Vector3();
	var geometry = parameters.geometry !== undefined ? parameters.geometry : new THREE.PlaneBufferGeometry(50,50);
	var material = parameters.material !== undefined ? parameters.material : new THREE.MeshBasicMaterial({ color: 0x666666 });
	var base =  new THREE.Mesh(geometry, material);
	var selectgeometry = parameters.selectgeometry !== undefined ? parameters.selectgeometry : new THREE.PlaneBufferGeometry(25,25);
	var selectmaterial =  parameters.selectmaterial !== undefined ? parameters.selectmaterial : new THREE.MeshBasicMaterial({ color: 0xffffff });
	
	var select =  new THREE.Mesh(selectgeometry, selectmaterial);
	this.text = parameters.text !== undefined ? parameters.text : "checkbox";
	this.csstextcolor = parameters.textcolor !== undefined ? parameters.textcolor : "#000000";
	this.cssfont = parameters.font !== undefined ? parameters.font : '16px monospace';
	var x = document.createElement( 'canvas' );
	
	var str = document.createTextNode(this.text);
	var obj = document.createElement( 'A' );
	obj.appendChild( str );
	document.body.appendChild( obj );
	obj.style.font=this.cssfont;
	
	x.width = obj.offsetWidth;
	x.height = obj.offsetHeight;
	document.body.removeChild(obj);
	var texture = new THREE.CanvasTexture( x );
	texture.minFilter = THREE.LinearFilter;
	var xm = new THREE.MeshBasicMaterial( { map: texture, transparent: true } );
	var sprite = new THREE.Mesh(new THREE.PlaneBufferGeometry(x.width,x.height),xm);
	select.visible = parameters.checked !== undefined ? parameters.checked : false;
	select.position.z = 1;
	this.add(base);
	this.add(select);
	this.add(sprite);
	var this1 = this;
	Object.defineProperties	(
		this.objectPosition,
		{
			x:
			{
				set : function(x)
				{
					this1.children[0].position.x = x;
					this1.children[1].position.x = x;
					if (this1.children[0].geometry instanceof THREE.PlaneBufferGeometry) this1.children[2].position.x = x+this1.children[2].material.map.image.width/2+this1.children[0].geometry.parameters.width/2+this1.children[0].geometry.parameters.width/5;
					else this1.children[2].position.x = x+this1.children[2].material.map.image.width/2+this1.children[0].geometry.parameters.radius*1.2;
				},
				get : function()
				{
					return this1.children[0].position.x;
				}
			},
			y:
			{
				set : function(y)
				{
					for (var i=0; i<this1.children.length; i++)
					{
						this1.children[i].position.y = y;
					}
				},
				get : function()
				{
					return this1.children[0].position.y;
				}
			},
			z:
			{
				set : function(z)
				{
					for (var i=0; i<this1.children.length; i++)
					{
						this1.children[i].position.z = z;
					}
				},
				get : function()
				{
					return this1.children[0].position.z;
				}
			}
		}
	);
	this.reDraw();
};
GUI.CheckBox.prototype = 
{
	constructor : GUI.CheckBox,
	__proto__ : THREE.Object3D.prototype,
	set : function ()
	{
		this.children[1].visible = true;
		this.reDraw();
	},
	unset : function ()
	{
		this.children[1].visible = false;
		this.reDraw();
	},
	changeColor : function (color)
	{
		this.children[0].material.color.setHex(color);
	},
	reDraw : function ()
	{
		var xc = this.children[2].material.map.image.getContext( "2d" );
		xc.clearRect(0, 0, this.children[2].material.map.image.width, this.children[2].material.map.image.height);
		xc.textBaseline = 'middle';
		xc.font = this.cssfont;
		xc.fillStyle = this.csstextcolor;
		var str = document.createTextNode(this.text);
		var obj = document.createElement( 'A' );
		obj.appendChild( str );
		document.body.appendChild( obj );
		obj.style.font=xc.font;
		xc.fillText(this.text, this.children[2].material.map.image.width/2-obj.offsetWidth/2, this.children[2].material.map.image.height/2);
		document.body.removeChild(obj);
		this.children[2].material.map.needsUpdate = true;
	},
	onmouseup : function(object)
	{
		if (this.children[1].visible) this.unset();
		else this.set();
	},
	onmousedown : function(object) {  },
	onmouseover : function(object) { this.changeColor(0x888888); },
	onmouseout  : function(object) { this.changeColor(0x666666); }
}

GUI.EditBox = function ( parameters )
{
	THREE.Object3D.call( this );
	parameters = parameters || {};
	this.objectPosition = new THREE.Vector3();
	var geometry = parameters.geometry !== undefined ? parameters.geometry : new THREE.PlaneBufferGeometry(100,25);
	var material = parameters.material !== undefined ? parameters.material : new THREE.MeshBasicMaterial({ color: 0xcccccc });
	var base =  new THREE.Mesh(geometry, material);
	this.activeAlways = false;
	this.active = false;
	this.limit = parameters.limit !== undefined ? parameters.limit : 10;
	this.tip = parameters.tip !== undefined ? parameters.tip : "";
	this.password = parameters.password !== undefined ? parameters.password : false;
	this.text = parameters.text !== undefined ? parameters.text : "editbox";
	this.csstextcolor = parameters.textcolor !== undefined ? parameters.textcolor : "#000000";
	this.cssfont = parameters.font !== undefined ? parameters.font : '16px monospace';

	var x = document.createElement( 'canvas' );
	x.width = 1;
	x.height = 1;
	var texture = new THREE.CanvasTexture( x );
	texture.minFilter = THREE.LinearFilter;
	var xm = new THREE.MeshBasicMaterial( { map: texture, transparent: true } );
	var sprite = new THREE.Mesh(new THREE.PlaneBufferGeometry(x.width,x.height),xm);
	sprite.position.z = 1;
	this.add(base);
	this.add(sprite);
	var this1 = this;
	Object.defineProperties	(
		this.objectPosition,
		{
			x:
			{
				set : function(x)
				{
					this1.children[0].position.x = x;
					// сделать наконец boundingbox
					if (this1.children[0].geometry instanceof THREE.CircleBufferGeometry) this1.children[1].position.x = x-this1.children[0].geometry.parameters.radius+this1.children[1].geometry.parameters.width/2+10;
					if (this1.children[0].geometry instanceof THREE.PlaneBufferGeometry) this1.children[1].position.x = x-this1.children[0].geometry.parameters.width/2+this1.children[1].geometry.parameters.width/2+10;
				},
				get : function()
				{
					return this1.children[0].position.x;
				}
			},
			y:
			{
				set : function(y)
				{
					for (var i=0; i<this1.children.length; i++)
					{
						this1.children[i].position.y = y;
					}
				},
				get : function()
				{
					return this1.children[0].position.y;
				}
			},
			z:
			{
				set : function(z)
				{
					for (var i=0; i<this1.children.length; i++)
					{
						this1.children[i].position.z = z;
					}
				},
				get : function()
				{
					return this1.children[0].position.z;
				}
			}
		}
	);
	this.reDraw();
};
GUI.EditBox.prototype = 
{
	constructor : GUI.EditBox,
	__proto__ : THREE.Object3D.prototype,
	changeColor : function (color)
	{
		this.children[0].material.color.setHex(color);
	},
	reDraw : function ()
	{
		if (((this.text.length>0)&&(this.active))||(((this.tip.length>0)||(this.text.length>0))&&(!this.active)))
		{
			var itemtext = "";
			if ((!this.active)&&(this.text.length==0))
			{
				itemtext = this.tip;
			}
			else
			{
				if (this.password)
				{
					itemtext='';
					for (var j=0; j<this.text.length; j++) itemtext+='*';
				}
				else itemtext = this.text;
			}				
			var str = document.createTextNode(itemtext);
			var obj = document.createElement( 'A' );
			obj.appendChild( str );
			document.body.appendChild( obj );
			obj.style.font=this.cssfont;
			this.children[1].material.map.image.width = obj.offsetWidth;
			this.children[1].material.map.image.height = obj.offsetHeight;
			this.children[1].geometry = new THREE.PlaneBufferGeometry(obj.offsetWidth,obj.offsetHeight);
			var xc = this.children[1].material.map.image.getContext( "2d" );
			xc.clearRect(0, 0, this.children[1].material.map.image.width, this.children[1].material.map.image.height);
			xc.textBaseline = 'middle';
			xc.font = this.cssfont;
			xc.fillStyle = this.csstextcolor;
			xc.fillText(itemtext, 0, this.children[1].material.map.image.height/2);
			document.body.removeChild(obj);
		}
		else // в хроме с нулевой длиной выбивает warning
		{
			var xc = this.children[1].material.map.image.getContext( "2d" );
			xc.clearRect(0, 0, this.children[1].material.map.image.width, this.children[1].material.map.image.height);
		}
		if (this.children[0].geometry instanceof THREE.CircleBufferGeometry) this.children[1].position.x = this.children[0].position.x-this.children[0].geometry.parameters.radius+this.children[1].geometry.parameters.width/2+10;
		if (this.children[0].geometry instanceof THREE.PlaneBufferGeometry) this.children[1].position.x = this.children[0].position.x-this.children[0].geometry.parameters.width/2+this.children[1].geometry.parameters.width/2+10;
		this.children[1].material.map.needsUpdate = true;
	},
	onmouseup   : function(object) {  },
	onmousedown : function(object)
	{
		this.text = "";
		this.active = true;
		this.reDraw();
	},
	onmouseover : function(object) { this.changeColor(0xaaaaaa); },
	onmouseout  : function(object) { if (!this.active) this.changeColor(0xcccccc); }
}

// GUI.ScrollBar
// У скроллбара 2 кнопки и ползунок, им обрабатывается событие onMouseWheel(при активности?)
// вводится треугольная форма кнопок
// обрабатываются нажатия на кнопки скролла, а равно на вращение колеса мыши
// вызываются коллбеки, в которых уже можно двигать прокручиваемые элементы
// при достижении предела по полосе прокрутки коллбеки не вызываются
// длина скролла задается параметром
// основной спрайт - сам ползунок, также есть 2(подложка?) побочных спрайта - кнопки
// при движении мыши в случае scrollbar'а проверяем также его кнопки
// sprite.position.set необходимо переопределить
// в сущности разницы вертикальный или горизонтальный скролл с точки зрения скролла нет
// скроллбар не наследуется от спрайта, т.к это составной элемент, его позиция транслируется в позиции элементов, его составляющих
// аналогично у чекбокса
// у скроллбара должно быть 2 доп. коллбека - scrollup и scrolldown, чтобы скроллом можно было что-то крутить
// есть внутреннее событие onmouse_n, на котором уже вызывается соответствующий пользовательский коллбек после выполнения необходимых действий
// также это событие может быть описано в соответствующем обработчике

GUI.ScrollBar = function ( parameters )
{
	THREE.Object3D.call( this );
	parameters = parameters || {};
	this.objectPosition = new THREE.Vector3();
	this.above = 1; // скрыто наверху
	this.below = 1; // скрыто снизу
	var geometry = parameters.geometry !== undefined ? parameters.geometry : new THREE.PlaneBufferGeometry(25,25);
	var material = parameters.material !== undefined ? parameters.material : new THREE.MeshBasicMaterial({ color: 0x666666 });
	var base =  new THREE.Mesh(geometry, material);
	var upgeometry = parameters.upgeometry !== undefined ? parameters.upgeometry : new THREE.PlaneBufferGeometry(25,25);
	var up =  new THREE.Mesh(upgeometry, material.clone());
	var downgeometry = parameters.downgeometry !== undefined ? parameters.downgeometry : new THREE.PlaneBufferGeometry(25,25);
	var down =  new THREE.Mesh(downgeometry, material.clone());
	up.position.y-=80;
	down.position.y+=100;
	this.add(base);
	this.add(up);
	this.add(down);

	var this1 = this;
	Object.defineProperties	(
		this.objectPosition,
		{
			x:
			{
				set : function(x)
				{
					for (var i=0; i<this1.children.length; i++)
					{
						this1.children[i].position.x = x;
					}
				},
				get : function()
				{
					return this1.children[0].position.x;
				}
			},
			y:
			{
				// работает только для вертикального скролла, для горизонтального приблизительно то же самое по оси x
				set : function(y)
				{
					this1.children[1].position.y = y-90; // up
					this1.children[2].position.y = y+90; // down
					if (this1.children[1].geometry instanceof THREE.CircleBufferGeometry) var uplength = this1.children[1].geometry.parameters.radius*2;
					else var uplength =  this1.children[1].geometry.parameters.height;
					if (this1.children[2].geometry instanceof THREE.CircleBufferGeometry) var downlength = this1.children[2].geometry.parameters.radius*2;
					else var downlength =  this1.children[2].geometry.parameters.height;
					if (this1.children[0].geometry instanceof THREE.CircleBufferGeometry) var sliderlength = this1.children[0].geometry.parameters.radius*2;
					else var sliderlength =  this1.children[0].geometry.parameters.height;
					var dist = this1.children[2].position.y-this1.children[1].position.y-uplength*1.2/2-downlength*1.2/2-sliderlength;
					//console.log(dist+' sl: '+sliderlength+' up: '+uplength+' down: '+downlength);
					this1.children[0].position.y = this1.children[2].position.y-downlength*1.2/2-sliderlength/2-dist*(this1.below/(this1.above+this1.below)); // base
				},
				get : function()
				{
					var dist = this1.children[2].position.y-this1.children[1].position.y;
					var bufy = this1.children[2].position.y-dist/2;
					return bufy;
				}
			},
			z:
			{
				set : function(z)
				{
					for (var i=0; i<this1.children.length; i++)
					{
						this1.children[i].position.z = z;
					}
				},
				get : function()
				{
					return this1.children[0].position.z;
				}
			}
		}
	);
};
GUI.ScrollBar.prototype = 
{
	constructor : GUI.ScrollBar,
	__proto__ : THREE.Object3D.prototype,
	changeColor : function (color)
	{
		for (var i=0; i<this.children.length; i++)
		{
			this.children[i].material.color.setHex(color);
		};
	},
	onmouseup   : function(object) {	},
	onmousedown : function(object)
	{
		if ((object == this.children[1])&&(this.above>0))
		{
			this.onscrollup();
			this.below++;
			this.above--;
		}
		if ((object == this.children[2])&&(this.below>0))
		{
			this.onscrolldown();
			this.above++;
			this.below--;
		}
		// call setter
		this.objectPosition.y = this.objectPosition.y;
	},
	onmouseover : function(object)
	{
		object.material.color.setHex(0x888888);
	},
	onmouseout  : function(object)
	{
		object.material.color.setHex(0x666666);
	},
	onscrollup   : function() { },
	onscrolldown : function() { }
}

GUI.DialogBox = function ( parameters )
{
	THREE.Object3D.call( this );
	parameters = parameters || {};
	this.objectPosition = new THREE.Vector3();
	this.mbtype = parameters.type !== undefined ? parameters.type : 1; // 0 = MB_OK, 1 = MB_OKCANCEL
	var geometry = parameters.geometry !== undefined ? parameters.geometry : new THREE.PlaneBufferGeometry(300,167);
	var material = parameters.material !== undefined ? parameters.material : new THREE.MeshBasicMaterial({ color: 0x333333 });
	var base =  new THREE.Mesh(geometry, material);
	base.position.z = 2;
	var okgeometry = parameters.okgeometry !== undefined ? parameters.okgeometry : new THREE.PlaneBufferGeometry(100,25);
	var ok =  new THREE.Mesh(okgeometry, new THREE.MeshBasicMaterial({ color: parameters.color !== undefined ? parameters.color : 0x666666}));
	ok.position.z = 3;
	if (this.mbtype==1) ok.position.x-=70;
	ok.position.y-=40;
	if (this.mbtype==1)
	{
		var cancelgeometry = parameters.cancelgeometry !== undefined ? parameters.cancelgeometry : new THREE.PlaneBufferGeometry(100,25);
		var cancel =  new THREE.Mesh(cancelgeometry, new THREE.MeshBasicMaterial({ color: parameters.color !== undefined ? parameters.color : 0x666666}));
		cancel.position.z = 3;
		cancel.position.x+=70;
		cancel.position.y-=40;
	}

	this.text = parameters.text !== undefined ? parameters.text : "dialogbox";
	this.csstextcolor = parameters.textcolor !== undefined ? parameters.textcolor : "#000000";
	this.cssfont = parameters.font !== undefined ? parameters.font : '18px monospace';
	var x = document.createElement( 'canvas' );
	var str = document.createTextNode(this.text);
	var obj = document.createElement( 'A' );
	obj.appendChild( str );
	document.body.appendChild( obj );
	obj.style.font=this.cssfont;
	x.width = obj.offsetWidth;
	x.height = obj.offsetHeight;
	document.body.removeChild(obj);
	var texture = new THREE.CanvasTexture( x );
	texture.minFilter = THREE.LinearFilter;
	var xm = new THREE.MeshBasicMaterial( { map: texture, transparent: true } );
	var sprite = new THREE.Mesh(new THREE.PlaneBufferGeometry(x.width,x.height),xm);
	sprite.position.z = 3;
	sprite.position.y+=30;
	
	var x = document.createElement( 'canvas' );
	var str = document.createTextNode('OK');
	var obj = document.createElement( 'A' );
	obj.appendChild( str );
	document.body.appendChild( obj );
	obj.style.font=this.cssfont;
	x.width = obj.offsetWidth;
	x.height = obj.offsetHeight;
	document.body.removeChild(obj);
	var texture = new THREE.CanvasTexture( x );
	texture.minFilter = THREE.LinearFilter;
	var xm = new THREE.MeshBasicMaterial( { map: texture, transparent: true } );
	var spriteok = new THREE.Mesh(new THREE.PlaneBufferGeometry(x.width,x.height),xm);
	spriteok.position.z = 4;
	spriteok.position.y-=40;
	if (this.mbtype==1) spriteok.position.x-=70;
	
	if (this.mbtype==1)
	{
		var x = document.createElement( 'canvas' );
		var str = document.createTextNode('CANCEL');
		var obj = document.createElement( 'A' );
		obj.appendChild( str );
		document.body.appendChild( obj );
		obj.style.font=this.cssfont;
		x.width = obj.offsetWidth;
		x.height = obj.offsetHeight;
		document.body.removeChild(obj);
		var texture = new THREE.CanvasTexture( x );
		texture.minFilter = THREE.LinearFilter;
		var xm = new THREE.MeshBasicMaterial( { map: texture, transparent: true } );
		var spritecancel = new THREE.Mesh(new THREE.PlaneBufferGeometry(x.width,x.height),xm);
		spritecancel.position.z = 4;
		spritecancel.position.y-=40;
		spritecancel.position.x+=70;
	}

	this.add(base);
	this.add(sprite);
	this.add(ok);
	this.add(spriteok);
	if (this.mbtype==1) this.add(cancel);
	if (this.mbtype==1) this.add(spritecancel);
	
	var this1 = this;
	Object.defineProperties	(
		this.objectPosition,
		{
			x:
			{
				set : function(x)
				{
					this1.children[0].position.x = x;
					this1.children[1].position.x = x;
					if (this1.mbtype==1)
					{
						this1.children[2].position.x = x-70;
						this1.children[3].position.x = x-70;
						this1.children[4].position.x = x+70;
						this1.children[5].position.x = x+70;
					}
					else
					{
						this1.children[2].position.x = x;
						this1.children[3].position.x = x;
					}
				},
				get : function()
				{
					return this1.children[0].position.x;
				}
			},
			y:
			{
				// работает только для вертикального скролла, для горизонтального приблизительно то же самое по оси x
				set : function(y)
				{
					for (var i=2; i<(this1.children.length); i++) this1.children[i].position.y = y-40;
					this1.children[0].position.y = y;
					this1.children[1].position.y = y+30;
				},
				get : function()
				{
					return this1.children[0].position.y;
				}
			},
			z:
			{
				// работает только для вертикального скролла, для горизонтального приблизительно то же самое по оси x
				set : function(z)
				{
					this1.children[0].position.z = z;
					this1.children[1].position.z = z;
					this1.children[2].position.z = z+1;
					this1.children[3].position.z = z+2;
					if (this1.type==1)
					{
						this1.children[4].position.z = z+1;
						this1.children[5].position.z = z+2;
					}
				},
				get : function()
				{
					return this1.children[0].position.z;
				}
			}
		}
	);
	this.reDraw();
};
GUI.DialogBox.prototype = 
{
	constructor : GUI.DialogBox,
	__proto__ : THREE.Object3D.prototype,
	changeColor : function (color)
	{
		for (var i=0; i<this1.children.length; i++)
		{
			this1.children[i].material.color.setHex(color);
		};
	},
	reDraw : function()
	{
		var xc = this.children[1].material.map.image.getContext( "2d" );
		xc.clearRect(0, 0, this.children[1].material.map.image.width, this.children[1].material.map.image.height);
		xc.textBaseline = 'middle';
		xc.font = this.cssfont;
		xc.fillStyle = this.csstextcolor;
		var str = document.createTextNode(this.text);
		var obj = document.createElement( 'A' );
		obj.appendChild( str );
		document.body.appendChild( obj );
		obj.style.font=xc.font;
		xc.fillText(this.text, this.children[1].material.map.image.width/2-obj.offsetWidth/2, this.children[1].material.map.image.height/2);
		document.body.removeChild(obj);
		this.children[1].material.map.needsUpdate = true;
		
		var xc = this.children[3].material.map.image.getContext( "2d" );
		xc.clearRect(0, 0, this.children[3].material.map.image.width, this.children[3].material.map.image.height);
		xc.textBaseline = 'middle';
		xc.font = this.cssfont;
		xc.fillStyle = this.csstextcolor;
		var str = document.createTextNode('OK');
		var obj = document.createElement( 'A' );
		obj.appendChild( str );
		document.body.appendChild( obj );
		obj.style.font=xc.font;
		xc.fillText('OK', this.children[3].material.map.image.width/2-obj.offsetWidth/2, this.children[3].material.map.image.height/2);
		document.body.removeChild(obj);
		this.children[3].material.map.needsUpdate = true;
		
		if (this.mbtype==1)
		{
			var xc = this.children[5].material.map.image.getContext( "2d" );
			xc.clearRect(0, 0, this.children[5].material.map.image.width, this.children[5].material.map.image.height);
			xc.textBaseline = 'middle';
			xc.font = this.cssfont;
			xc.fillStyle = this.csstextcolor;
			var str = document.createTextNode('CANCEL');
			var obj = document.createElement( 'A' );
			obj.appendChild( str );
			document.body.appendChild( obj );
			obj.style.font=xc.font;
			xc.fillText('CANCEL', this.children[5].material.map.image.width/2-obj.offsetWidth/2, this.children[5].material.map.image.height/2);
			document.body.removeChild(obj);
			this.children[5].material.map.needsUpdate = true;
		}
	},
	onmouseup   : function(object) {	},
	onmousedown : function(object) { 	},
	onmouseover : function(object)
	{
		if ((object==this.children[2])||(object==this.children[4])) object.material.color.setHex(0x888888);
		if (object==this.children[3]) this.children[2].material.color.setHex(0x888888);
		if (object==this.children[5]) this.children[4].material.color.setHex(0x888888);
	},
	onmouseout  : function(object)
	{
		if ((object==this.children[2])||(object==this.children[4])) object.material.color.setHex(0x666666);
		if (object==this.children[3]) this.children[2].material.color.setHex(0x666666);
		if (object==this.children[5]) this.children[4].material.color.setHex(0x666666);
	}
}

/*
	при mouse move необходимо вызывать GUI.MouseMove(event);
	на mouse up вызывается GUI.MouseUp(event);
	на mouse down вызывается GUI.MouseDown(event);
	document:
	на key press (keydown + key up) вызывается GUI.KeyPress(event);
	на key down вызывается GUI.KeyDown(event);
*/