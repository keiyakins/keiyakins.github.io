/*jslint browser: true */
/*global DataView, FileReader */

function StreamReader(arrayBuffer) {
    "use strict";
    this.dataView = new DataView(arrayBuffer);
    this.ptr = 0;
}

StreamReader.prototype.getByte = function () {
    "use strict";
    var ret = this.dataView.getUint8(this.ptr);
    this.ptr += 1;
    return ret;
};

StreamReader.prototype.getInt16 = function () {
    "use strict";
    var ret = this.dataView.getInt16(this.ptr, true);
    this.ptr += 2;
    return ret;
};

StreamReader.prototype.getInt32 = function () {
    "use strict";
    var ret = this.dataView.getInt32(this.ptr, true);
    this.ptr += 4;
    return ret;
};

StreamReader.prototype.getRawString = function (len) {
    "use strict";
    var stringArray = [], i;
    
    for (i = 0; i < len; i += 1) {
        stringArray.push(String.fromCharCode(this.getByte()));
    }
    
    return stringArray.join("");
};

StreamReader.prototype.getString = function () {
    "use strict";
    return this.getRawString(this.getByte());
};

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

function renderTerrariaMap(mapSR) {
    "use strict";
    var tVersion, tVersionDiv, worldName, worldNameDiv, mapId, mapIdDiv, maxY, maxX, maxYDiv, maxXDiv, x, y, notBlank, type, light, misc, misc2, duplicates, blankDupes;

    tVersion = mapSR.getInt32();
    tVersionDiv = document.createElement('div');
    tVersionDiv.innerHTML = "map version: " + tVersion;
    document.getElementById("output").insertBefore(tVersionDiv, canvas);

    worldName = mapSR.getString();
    worldNameDiv = document.createElement('div');
    worldNameDiv.innerHTML = "map name: " + worldName;
    document.getElementById("output").insertBefore(worldNameDiv, canvas);

    mapId = mapSR.getInt32();
    mapIdDiv = document.createElement('div');
    mapIdDiv.innerHTML = "map id: " + mapId;
    document.getElementById("output").insertBefore(mapIdDiv, canvas);

    maxY = mapSR.getInt32();
    maxYDiv = document.createElement('div');
    maxYDiv.innerHTML = "max y: " + maxY;
    document.getElementById("output").insertBefore(maxYDiv, canvas);

    maxX = mapSR.getInt32();
    maxXDiv = document.createElement('div');
    maxXDiv.innerHTML = "max x: " + maxX;
    document.getElementById("output").insertBefore(maxXDiv, canvas);

    canvas.width = maxX;
    canvas.height = maxY;
    ctx.fillStyle = "rgb(255,255,255)";
    ctx.fillRect(0, 0, maxX, maxY);
    ctx.fillStyle = "rgb(0,0,0)";

    ctx.lineWidth = 1;
    ctx.beginPath();
    x = 0;
    while (x <= maxX) {
        y = 0;
        while (y <= maxY) {
            notBlank = mapSR.getByte();

            if (notBlank) {
                type = mapSR.getByte();
                light = mapSR.getByte();
                misc = mapSR.getByte();
                misc2 = mapSR.getByte();
                duplicates = mapSR.getInt16();
                if (light !== 255) {
                    duplicates = 0;
                }
                ctx.moveTo(x + 0.5, y + 0.5);
                ctx.lineTo(x + 0.5, y + duplicates + 0.5);
                y = y + duplicates + 1;
            } else {
                blankDupes = mapSR.getInt16();
                y = y + blankDupes + 1;
            }
        }
        x += 1;
    }
    ctx.stroke();
}

function handleFileSelect(evt) {
    "use strict";
    var files, reader;
    files = evt.target.files;
    reader = new FileReader();
    reader.onload = function (readevt) {
        renderTerrariaMap(new StreamReader(readevt.target.result));
    };
    reader.readAsArrayBuffer(files[0]);
}

document.getElementById('files').addEventListener('change', handleFileSelect, false);