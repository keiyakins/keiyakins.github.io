/*jslint browser: true */
/*global DataView, FileReader */

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

function renderTerrariaMap(mapAB) {
    "use strict";
    var ptr, mapDV, tVersion, versionDiv, worldNameLen, worldNameArray, i, nameDiv, mapid, idDiv, maxy, maxx, yDiv, xDiv, x, y, notBlank, type, light, misc, misc2, duplicates, blankDupes;

    ptr = 0;
    mapDV = new DataView(mapAB);

    tVersion = mapDV.getInt32(ptr, true);
    ptr += 4;
    versionDiv = document.createElement('div');
    versionDiv.innerHTML = ["map version: ", tVersion].join("");
    document.getElementById("output").insertBefore(versionDiv, canvas);

    worldNameLen = mapDV.getUint8(ptr);
    ptr += 1;
    worldNameArray = [];
    for (i = 0; i < worldNameLen; i += 1) {
        worldNameArray.push(String.fromCharCode(mapDV.getInt8(ptr)));
        ptr += 1;
    }
    nameDiv = document.createElement('div');
    nameDiv.innerHTML = ["map name: ", worldNameArray.join("")].join("");
    document.getElementById("output").insertBefore(nameDiv, canvas);

    mapid = mapDV.getInt32(ptr, true);
    ptr += 4;
    idDiv = document.createElement('div');
    idDiv.innerHTML = ["map id: ", mapid].join("");
    document.getElementById("output").insertBefore(idDiv, canvas);

    maxy = mapDV.getInt32(ptr, true);
    ptr += 4;
    yDiv = document.createElement('div');
    yDiv.innerHTML = ["max y: ", maxy].join("");
    document.getElementById("output").insertBefore(yDiv, canvas);

    maxx = mapDV.getInt32(ptr, true);
    ptr += 4;
    xDiv = document.createElement('div');
    xDiv.innerHTML = ["max x: ", maxx].join("");
    document.getElementById("output").insertBefore(xDiv, canvas);

    canvas.width = maxx;
    canvas.height = maxy;
    ctx.fillStyle = "rgb(255,255,255)";
    ctx.fillRect(0, 0, maxx, maxy);
    ctx.fillStyle = "rgb(0,0,0)";

    ctx.lineWidth = 1;
    ctx.beginPath();
    x = 0;
    while (x < maxx) {
        y = 0;
        while (y < maxy) {
            notBlank = mapDV.getUint8(ptr);
            ptr += 1;

            if (notBlank) {
                type = mapDV.getUint8(ptr);
                ptr += 1;
                light = mapDV.getUint8(ptr);
                ptr += 1;
                misc = mapDV.getUint8(ptr);
                ptr += 1;
                misc2 = mapDV.getUint8(ptr);
                ptr += 1;
                duplicates = mapDV.getInt16(ptr, true);
                ptr += 2;
                if (light !== 255) {
                    duplicates = 0;
                }
                ctx.moveTo(x + 0.5, y + 0.5);
                ctx.lineTo(x + 0.5, y + duplicates + 0.5);
                y = y + duplicates + 1;
            } else {
                blankDupes = mapDV.getInt16(ptr, true);
                ptr += 2;
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
        renderTerrariaMap(readevt.target.result);
    };
    reader.readAsArrayBuffer(files[0]);
}

document.getElementById('files').addEventListener('change', handleFileSelect, false);