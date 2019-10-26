var X = XLSX;
var XW = {
    /* worker message */
    msg: 'xlsx',
    /* worker scripts */
    rABS: './xlsxworker2.js',
    norABS: './xlsxworker1.js',
    noxfer: './xlsxworker.js'
};

var rABS = typeof FileReader !== "undefined" && typeof FileReader.prototype !== "undefined" && typeof FileReader.prototype.readAsBinaryString !== "undefined";


var wtf_mode = false;

function fixdata(data) {
    var o = "",
        l = 0,
        w = 10240;
    for (; l < data.byteLength / w; ++l) o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w, l * w + w)));
    o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w)));
    return o;
}

function ab2str(data) {
    var o = "",
        l = 0,
        w = 10240;
    for (; l < data.byteLength / w; ++l) o += String.fromCharCode.apply(null, new Uint16Array(data.slice(l * w, l * w + w)));
    o += String.fromCharCode.apply(null, new Uint16Array(data.slice(l * w)));
    return o;
}

function s2ab(s) {
    var b = new ArrayBuffer(s.length * 2),
        v = new Uint16Array(b);
    for (var i = 0; i != s.length; ++i) v[i] = s.charCodeAt(i);
    return [v, b];
}

function xw_noxfer(data, cb) {
    var worker = new Worker(XW.noxfer);
    worker.onmessage = function(e) {
        switch (e.data.t) {
            case 'ready':
                break;
            case 'e':
                console.error(e.data.d);
                break;
            case XW.msg:
                cb(JSON.parse(e.data.d));
                break;
        }
    };
    var arr = rABS ? data : btoa(fixdata(data));
    worker.postMessage({ d: arr, b: rABS });
}

function xw_xfer(data, cb) {
    var worker = new Worker(rABS ? XW.rABS : XW.norABS);
    worker.onmessage = function(e) {
        switch (e.data.t) {
            case 'ready':
                break;
            case 'e':
                console.error(e.data.d);
                break;
            default:
                xx = ab2str(e.data).replace(/\n/g, "\\n").replace(/\r/g, "\\r");
                console.log("done");
                cb(JSON.parse(xx));
                break;
        }
    };
    if (rABS) {
        var val = s2ab(data);
        worker.postMessage(val[1], [val[1]]);
    } else {
        worker.postMessage(data, [data]);
    }
}


function xw(data, cb) {
    transferable = true;
    if (transferable) xw_xfer(data, cb);
    else xw_noxfer(data, cb);
}

var tarea = document.getElementById('b64data');

function b64it() {
    if (typeof console !== 'undefined') console.log("onload", new Date());
    var wb = X.read(tarea.value, { type: 'base64', WTF: wtf_mode });
    process_wb(wb);
}

var global_wb;

function process_wb(wb) {
    global_wb = wb;
    var sheet = wb.Sheets[wb.SheetNames[0]];
    var temp = sheet.A2.v.split(",");
    study_time.innerText = temp[0];

    t2_1.innerText = sheet.B5.v; t3_1.innerText = sheet.C5.v; t4_1.innerText = sheet.D5.v; t5_1.innerText = sheet.E5.v; t6_1.innerText = sheet.F5.v; t7_1.innerText = sheet.G5.v;
    t2_2.innerText = sheet.B7.v; t3_2.innerText = sheet.C7.v; t4_2.innerText = sheet.D7.v; t5_2.innerText = sheet.E7.v; t6_2.innerText = sheet.F7.v; t7_2.innerText = sheet.G7.v;
    t2_3.innerText = sheet.B10.v; t3_3.innerText = sheet.C10.v; t4_3.innerText = sheet.D10.v; t5_3.innerText = sheet.E10.v; t6_3.innerText = sheet.F10.v; t7_3.innerText = sheet.G10.v;
    t2_4.innerText = sheet.B12.v; t3_4.innerText = sheet.C12.v; t4_4.innerText = sheet.D12.v; t5_4.innerText = sheet.E12.v; t6_4.innerText = sheet.F12.v; t7_4.innerText = sheet.G12.v;

    var i = 16;
    while(sheet['A'+i] !== 'undefined'){
    	var html_string = "<tr>";
    	html_string += "<td>" + sheet['A'+i].v + "</td>";
    	html_string += "<td>" + sheet['B'+i].v + "</td>";
    	html_string += "<td>" + sheet['C'+i].v + "</td>";
    	html_string += "<td>" + sheet['D'+i].v + "</td>";
    	var desired_cell;
    	var desired_value;
    	desired_cell = sheet['E'+i];
    	desired_value = (desired_cell ? desired_cell.v : undefined);
    	html_string += "<td>" + desired_value + "</td>";
    	desired_cell = sheet['F'+i];
    	desired_value = (desired_cell ? desired_cell.v : undefined);
    	html_string += "<td>" + desired_value + "</td>";
    	desired_cell = sheet['G'+i];
    	desired_value = (desired_cell ? desired_cell.v : undefined);
    	html_string += "<td>" + desired_value + "</td>";
    	html_string += "</tr>";
    	$( "#time_table_content" ).append(html_string);
    	i++;
    }
}

function setfmt() {
    if (global_wb) process_wb(global_wb);
}

function handleDrop(e) {
    e.stopPropagation();
    e.preventDefault();
    rABS = false;
    use_worker = false;
    var files = e.dataTransfer.files;
    var f = files[0]; {
        var reader = new FileReader();
        var name = f.name;
        reader.onload = function(e) {
            if (typeof console !== 'undefined') console.log("onload", new Date(), rABS, use_worker);
            var data = e.target.result;
            if (use_worker) {
                xw(data, process_wb);
            } else {
                var wb;
                if (rABS) {
                    wb = X.read(data, { type: 'binary' });
                } else {
                    var arr = fixdata(data);
                    wb = X.read(btoa(arr), { type: 'base64' });
                }
                process_wb(wb);
            }
        };
        if (rABS) reader.readAsBinaryString(f);
        else reader.readAsArrayBuffer(f);
    }
}

function handleDragover(e) {
    e.stopPropagation();
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
}

var drop = document.getElementById('file-drop');
if (drop.addEventListener) {
    drop.addEventListener('dragenter', handleDragover, false);
    drop.addEventListener('dragover', handleDragover, false);
    drop.addEventListener('drop', handleDrop, false);
}

var xlf = document.getElementById('xlf');
if (xlf.addEventListener) xlf.addEventListener('change', handleFile, false);

function handleFile(e) {
    rABS = false;
    use_worker = false;
    var files = e.target.files;
    var f = files[0]; {
        var reader = new FileReader();
        var name = f.name;
        reader.onload = function(e) {
            if (typeof console !== 'undefined') console.log("onload", new Date(), rABS, use_worker);
            var data = e.target.result;
            if (use_worker) {
                xw(data, process_wb);
            } else {
                var wb;
                if (rABS) {
                    wb = X.read(data, { type: 'binary' });
                } else {
                    var arr = fixdata(data);
                    wb = X.read(btoa(arr), { type: 'base64' });
                }
                process_wb(wb);
            }
        };
        if (rABS) reader.readAsBinaryString(f);
        else reader.readAsArrayBuffer(f);
    }
}

