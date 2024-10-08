//UI Setting

(function CustomPanel(thisObj) {
    // UI
    function buildUI(thisObj) {
        
        var pal = (thisObj instanceof Panel) ? thisObj : new Window("palette", "Custom Panel", undefined, {resizeable:true});
        if (pal !== null) {
            var bgp = pal.add("group", undefined, "bgp");
                bgp.orientation = "row";
                bgp.alignChildren = ["fill", "fill"];
            var bt1 = bgp.add("button", undefined, "shapeLayer");
            var bt2 = bgp.add("button", undefined, "fileOpen");
            var bt3 = bgp.add("button", undefined, "folderOpen");
            var bt4 = bgp.add("button", undefined, "LO > camera");
            var bt5 = bgp.add("button", undefined, "guideLayeron");
            var bt6 = bgp.add("button", undefined, "guideLayeroff");
            var bt7 = bgp.add("button", undefined, "layer > 3dcamera");
            var bt8 = bgp.add("button", undefined, "exptext");
            var bt9 = bgp.add("button", undefined, "comp > layer");
            var bt10 = bgp.add("button", undefined, "name > EF");
            var bt11 = bgp.add("button", undefined, "keymarker");
            var bt12 = bgp.add("button", undefined, "colorkey");
                bt1.onClick = shapelayeradj;
                bt2.onClick = openFile;
                bt3.onClick = openfilefolder;
                bt4.onClick = LOtoCamera;
                bt5.onClick = guidelayeron;
                bt6.onClick = guidelayeroff;
                bt7.onClick = threecamerascale;
                bt8.onClick = openexptext;
                bt9.onClick = compsizetolayersize;
                bt10.onClick = layernamechangetoeffect;
                bt11.onClick = keymarker;
                bt12.onClick = colorkeyeffect;
        }
        return pal;
    }

    //function
    function shapelayeradj() {
        app.beginUndoGroup("bt1");
        var actItem = app.project.activeItem;
        if (actItem !== null && actItem instanceof CompItem) {
            if (actItem.selectedLayers.length > 0) {
                var selLayer = actItem.selectedLayers[0];
                var selindex = selLayer.index;
                var moveLayer = actItem.layer(selindex);
            } else {
                var moveLayer = actItem.layer(1);
            }
            var shapelayer = actItem.layers.addShape();
            for (i = 1; i <= actItem.numLayers; i++) {
                if (actItem.layer(i).name == "Effect Layer") {
                    shapelayer.name = "Effect layer"+ " " + i;
                } else {
                    shapelayer.name = "Effect Layer";
                }
            }
            shapelayer.property("ADBE Transform Group").property("ADBE Position").setValue([actItem.width / 2, actItem.height / 2]);
            shapelayer.property("ADBE Transform Group").property("ADBE Position").expression = "[thisComp.width / 2, thisComp.height / 2]";
            shapelayer.adjustmentLayer = true;
            var rect = shapelayer.property("ADBE Root Vectors Group").addProperty("ADBE Vector Shape - Rect");
            rect.name = "Rectangle";
            var rectSize = [actItem.width, actItem.height];
            rect.property("ADBE Vector Rect Size").setValue(rectSize);
            rect.property("ADBE Vector Rect Size").expression = "[thisComp.width, thisComp.height]";
            var fill = shapelayer.property("ADBE Root Vectors Group").addProperty("ADBE Vector Graphic - Fill");
            fill.name = "Fill";
            fill.property("ADBE Vector Fill Color").setValue([1, 1, 1, 1]);
            shapelayer.moveBefore(moveLayer);
        }
        app.endUndoGroup();
    }

    function openfilefolder() {
        app.beginUndoGroup("bt3");
        var actItem = app.project.activeItem;
        var selLayer = actItem.selectedLayers[0];
        if (actItem.selectedLayers.length > 0) {
            if (selLayer.source instanceof FootageItem) {
                var filePath = selLayer.source.file.fsName;
                var folderPath = filePath.substring(0, filePath.lastIndexOf("\\") + 1);
                if (folderPath) {
                    system.callSystem("explorer \"" + folderPath + "\"");
                }
            }
        } else {
            alert("Select a layer");
        }
        app.endUndoGroup();
    }

    function openFile() {
        app.beginUndoGroup("bt2");
        var actItem = app.project.activeItem;
        var selLayer = actItem.selectedLayers[0];
        if (actItem.selectedLayers.length > 0) {
            if (selLayer.source instanceof FootageItem) {
                var filePath = selLayer.source.file.fsName;
                if (filePath) {
                    system.callSystem("explorer \"" + filePath + "\"");
                }
            }
        } else {
            alert("Select a layer");
        }
        app.endUndoGroup();
    }

    function LOtoCamera() {
        app.beginUndoGroup("bt4");
        var actItem = app.project.activeItem;
        var selLayer = actItem.selectedLayers[0];
        if (selLayer.source instanceof FootageItem) {
            for (i = 1; i <= actItem.numLayers; i++) {
                var camera = actItem.layer(i);
                if (camera.name == "camera" && camera.source instanceof FootageItem) {
                    if (camera.source.width == selLayer.source.width || camera.source.height == selLayer.source.height) {
                        selLayer.parent = null;
                        var cameraPos = camera.property("ADBE Transform Group").property("ADBE Position").value;
                        var cameraRot = camera.property("ADBE Transform Group").property("ADBE Rotate Z").value;
                        var cameraScale = camera.property("ADBE Transform Group").property("ADBE Scale").value;
                        selLayer.property("ADBE Transform Group").property("ADBE Position").setValue(cameraPos);
                        selLayer.property("ADBE Transform Group").property("ADBE Rotate Z").setValue(cameraRot);
                        selLayer.property("ADBE Transform Group").property("ADBE Scale").setValue(cameraScale);
                        selLayer.parent = camera;
                        break;
                    } else {
                        selLayer.parent = null;
                        var cameraWidth = camera.source.width;
                        var cameraHeight = camera.source.height;
                        var selLayerWidth = selLayer.source.width;
                        var selLayerHeight = selLayer.source.height;
                        var scaleX = (cameraWidth / selLayerWidth) * 100;
                        var scaleY = (cameraHeight / selLayerHeight) * 100;
                        var cameraPos = camera.property("ADBE Transform Group").property("ADBE Position").value;
                        var cameraRot = camera.property("ADBE Transform Group").property("ADBE Rotate Z").value;
                        selLayer.property("ADBE Transform Group").property("ADBE Position").setValue(cameraPos);
                        selLayer.property("ADBE Transform Group").property("ADBE Rotate Z").setValue(cameraRot);
                        selLayer.property("ADBE Transform Group").property("ADBE Scale").setValue([scaleX, scaleY]);
                        selLayer.parent = camera;
                        break;
                    }
                }else{
                    alert("not found camera layer");
                }
            }
        } else {
            alert("is not animatic file")
        }
        app.endUndoGroup();
    }
    
    function guidelayeron() {
        app.beginUndoGroup("bt5");
        var actItem = app.project.activeItem;
        var selLayer = actItem.selectedLayers[0];
        if (actItem.selectedLayers.length > 1) {
            for (i = 0; i < actItem.selectedLayers.length; i++) {
                selLayer = actItem.selectedLayers[i];
                selLayer.guideLayer = true;
            }
        } else {
            selLayer.guideLayer = true;
        }
        app.endUndoGroup();
    }

    function guidelayeroff() {
        app.beginUndoGroup("bt6");
        var actItem = app.project.activeItem;
        var selLayer = actItem.selectedLayers[0];
        if (actItem.selectedLayers.length > 1) {
            for (i = 0; i < actItem.selectedLayers.length; i++) {
                selLayer = actItem.selectedLayers[i];
                selLayer.guideLayer = false;
            }
        } else {
            selLayer.guideLayer = false;
        }
        app.endUndoGroup();
    }

    function threecamerascale() {
        app.beginUndoGroup("bt7");
        var actItem = app.project.activeItem;
        var selLayer = actItem.selectedLayers;
        if(actItem && actItem instanceof CompItem){
            for (var i = 1; i <= actItem.numLayers; i++) {
                var layer = actItem.layer(i);
                if (layer instanceof CameraLayer) {
                    var Clayer = layer;
                    break;
                }
            }
        }
        var frameWidth = actItem.width;
        var frameHeight = actItem.height;
        for (var j = 0; j < selLayer.length; j++) {
            var selectedLayer = actItem.selectedLayers[j];
            var layerWidth = selectedLayer.width;
            var layerHeight = selectedLayer.height;
            var cameraZpos = Clayer.property("Camera Options").property("Zoom").value;
            var distanceToCamera = selectedLayer.transform.position.value[2];
            var scaleFactorX = (frameWidth / layerWidth) * (1 + (distanceToCamera / cameraZpos));
            var scaleFactorY = (frameHeight / layerHeight) * (1 + (distanceToCamera / cameraZpos));     
            selectedLayer.property("ADBE Transform Group").property("ADBE Scale").setValue([scaleFactorX*100, scaleFactorY*100, 100]);
        }
        app.beginUndoGroup();
    }

    function openexptext() {
        /*var textfilepath = "D:\\\\스크립트\\\\익스프레션_쓰는것.txt";
        var command = "notepad.exe " + textfilepath;
        system.callSystem(command);*/
        var textfilepath = "F:\\소스백업\\익스프레션_쓰는것.txt";
        var file= new File(textfilepath);
        file.execute();
    }

    function compsizetolayersize() {
        app.beginUndoGroup("bt9");
        var actItem = app.project.activeItem;
        var selLayer = actItem.selectedLayers[0];
        if (actItem.selectedLayers.length == 0) {
            for(i = 1; i <= actItem.numLayers; i++){
                var layer = actItem.layer(i);
                if (layer.name.indexOf("LO") !== -1 || layer.name.indexOf("lo") !== -1) {
                    selLayer = layer;
                    //alert(selLayer.name);
                }
            }
        }
        var rect = selLayer.source;
        actItem.width = parseInt(Math.floor(rect.width));
        actItem.height = parseInt(Math.floor(rect.height));
        for(i = 1; i <= actItem.numLayers; i++) {
            var actItemlayer = actItem.layer(i);
            var positionProperty = actItemlayer.property("ADBE Transform Group").property("ADBE Position");
            var zPositionProperty = actItemlayer.property("ADBE Transform Group").property("ADBE Position").value[2];
            if (actItemlayer instanceof CameraLayer) {
                positionProperty.setValue([0, 0, zPositionProperty]);
            }else{
                positionProperty.setValue([actItem.width / 2, actItem.height / 2, zPositionProperty]);
            }
        }
        app.endUndoGroup();
    }

    function layernamechangetoeffect() {
        app.beginUndoGroup("layernamechangetoeffect");
        var actItem = app.project.activeItem;
        var selLayer = actItem.selectedLayers;
        if (actItem.selectedLayers.length > 0) {
            for (var i = 0; i < selLayer.length; i++) {
                var propParade = selLayer[i].property("ADBE Effect Parade")
                if (propParade.numProperties > 1) {
                    var propnum = propParade.numProperties;
                    var len = selLayer.length;
                    for (var j = 1; j == len; j++) {
                        var layernum = j;
                        selLayer[i].name = String(propnum) + " " +"Effect Layer" + " " + layernum;
                    };
                }else{
                    var props = propParade.property(1);
                    selLayer[i].name = props.name;
                }
            }
        } else {
            alert("Select a layer");
        }
    }

    function keymarker() {
        var actItem = app.project.activeItem;
        var selLayer = actItem.selectedLayers[0];
        var prop = app.project.activeItem.selectedProperties[0];
        if (!prop || !prop.isTimeVarying) {
            alert("Select a keyframable property");
            return;
        }
        app.beginUndoGroup("Key Marker");
        for (i = 1; i <= prop.numKeys; i++){
            var keyTime = prop.keyTime(i);
            var keyValue = prop.keyValue(i);
            if (prop.name !== "ADBE Time Remapping") {
                var fps = actItem.frameRate;
                var frame = Math.round(keyValue * fps) + 1;
                var keyValue = frame;
            }
            var marker = new MarkerValue(keyValue);
            if (actItem && actItem instanceof CompItem) {
                var found = false;
                for (var j = 1; j <= app.project.numItems; j++) {
                    var item = app.project.item(j);
                    if (item instanceof CompItem && item !== actItem) {
                        for (var k = 1; k <= item.numLayers; k++) {
                            var layer = item.layer(k);
                            if (layer.source === actItem) {
                                /*if(item.layers[k].property("Marker").numKeys > 0) {
                                    var totalKeys = item.layers[k].property("Marker").numKeys;
                                    for (var l = totalKeys; l >= 1; l--) {
                                        item.layers[k].property("Marker").removeKey(l);
                                    }
                                }*/
                                var markerTime = keyTime + layer.startTime;
                                item.layers[k].property("Marker").setValueAtTime(markerTime , marker);
                                found = true;
                            }
                        }
                    }
                }
                if (!found) {
                    alert("No parent composition found.");
                }
            } else {
                alert("There is no active composition or the selected item is not a composition.");
            }
        }        
    }

    function colorkeyeffect() {
        var actItem = app.project.activeItem;
        var selLayer = actItem.selectedLayers[0];
        app.beginUndoGroup("Color Key Effect");
        var colorKey = selLayer.property("ADBE Effect Parade").addProperty("ADBE Color Key");
        colorKey.property("Key Color").setValue([1, 1, 1]);
        app.endUndoGroup();
    }

    function durationchage() {
        
    }

    // show UI
    var myPanel = buildUI(thisObj);
    if (myPanel !== null) {
        myPanel.onclose = function() {
            app.settings.saveSetting("rokmaker_custom_panel", "Custom_Panel", myPanel);
        }
        if (myPanel instanceof Window) {
            myPanel.show();
        } else {
            myPanel.layout.layout(true);
        }
    }
}
)(this);