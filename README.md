# three.js-GUI-engine
v0.3.10  
GUI engine for three.js. It allows to create interfaces by WebGL via three.js.  

[example](https://gui.lvlb.ru) (see example folder)  

Allows to create the following elements:  

GUI.Button - button  
GUI.Panel - panel  
GUI.Label - text  
GUI.RadioGroup - group of radiobuttons element  
GUI.RadioButton - radiobutton  
GUI.CheckBox - checkbox  
GUI.EditBox - editbox  
GUI.ScrollBar - scrollbar  
GUI.Icon - image  

All elements have redefinable methods onmousedown(object), onmouseup(object), onmouseover(object), onmouseout(object), where object is subelement for which the event has been occurred.  
Element form specifies by geometry property.  

example install:  
npm install  

example build:  
npm run dev  
npm run prod