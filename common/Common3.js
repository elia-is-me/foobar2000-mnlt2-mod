﻿// vim: set ft=javascript fileencoding=utf-8 bomb et:
/*
Discriptsion: ...
Update: 2016-02-12
*/

var VERSION = "0.1.0"

// ======================================================================
// Prototype
// ======================================================================

String.prototype.trim = function(s) {
	return this.replace(/^[\s　]*|[\s　]*$/g, "");
};

String.prototype.validate = function() {
	return this.replace(/[\/\\|:\*"<>\?]/g, "_");
};

String.prototype.ucfirst = function() {
	return this.charAt(0).toUpperCase() + this.substr(1);
};

if (!Array.prototype.unique) {
	Array.prototype.unique = function() {
		var arr = this;
		if (arr.length <= 0) return [];
		for (var i = 0; i < arr.length; i++) {
			for (var j = i + 1; j < arr.length; j++) {
				if (arr[i] === arr[j]) {
					arr.splice(j, 1);
					j -= 1;
				}
			}
		}
		return arr;
	};
}


// Refer: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
if (!Array.prototype.filter) {
    Array.prototype.filter = function(fun) {
        'use strict';
        if (this === void 0 || this === null) {
            throw new TypeError();
        }
        var t = Object(this);
        var len = t.length >>> 0;
        if (typeof fun !== 'function') {
            throw new TypeError();
        }
        var res = [];
        var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
        for (var i = 0; i < len; i++) {
            if (i in t) {
                var val = t[i];
                if (fun.call(thisArg, val, i, t)) {
                    res.push(val)
                }
            }
        }
        return res;
    }
}

// Production steps of ECMA-262, Edition 5, 15.4.4.19
// Reference: http://es5.github.io/#x15.4.4.19
if (!Array.prototype.map) {
    Array.prototype.map = function(callback, thisArg) {
        var T, A, k;
        if (this == null) {
            throw new TypeError(' this is null or not defined');
        }
        var O = Object(this);
        var len = O.length >>> 0;
        if (typeof callback !== 'function') {
            throw new TypeError(callback + ' is not a function');
        }
        if (arguments.length > 1) {
            T = thisArg;
        }
        A = new Array(len);
        k = 0;
        while (k < len) {
            var kValue, mappedValue;
            if (k in O) {
                kValue = O[k];
                mappedValue = callback.call(T, kValue, k, O);
                A[k] = mappedValue;
            }
            k++;
        }
        return A
    }
}

// Production steps of ECMA-262, Edition 5, 15.4.4.18
// Reference: http://es5.github.io/#x15.4.4.18
if (!Array.prototype.forEach) {
    Array.prototype.forEach = function(callback, thisArg) {
        var T, k;
        if (this == null) {
            throw new TypeError(' this is null or not defined');
        }
        var O = Object(this);
        var len = O.length >>> 0;
        if (typeof callback !== "function") {
            throw new TypeError(callback + ' is not a function');
        }
        if (arguments.length > 1) {
            T = thisArg;
        }
        k = 0;
        while (k < len) {
            var kValue;
            if (k in O) {
                kValue = O[k];
                callback.call(T, kValue, k, O)
            }
            k++;
        }
    }
}

// Refer: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray
if (!Array.isArray) {
	Array.isArray = function(arg) {
		return Object.prototype.toString.call(arg) === '[object Array]';
	};
}

// ======================================================================
// Constructors
// ======================================================================

/**
 * Button: create buttons on wsh panel.
 * img_arr: [img_normal, img_hover, img_down], array elements are gdi_images.
 * func: on_click event function
 * tooltip_text:
 */

Button = function (img_arr, func, tooltip_text) {
	this.state = 0;
	this.is_down = false;
	this.is_hover = false;
	this.img;
	this.w = 0;
	this.h = 0;
	this.x = 0;
	this.y = 0;
	this.func = func;
	this.tooltip = window.CreateTooltip();

	this.set_tooltip = function (tooltip_text) {
		this.tooltip_text = tooltip_text;
		if (this.tooltip_text && tooltip_text.length > 0) {
			this.tooltip.Text = this.tooltip_text;
			this.tooltip.Deactivate();
		} else {
			this.tooltip = null;
		}
	}

	this.update_img = function(img_arr_) {
		this.img = img_arr_;
		this.w = this.img[0].Width;
		this.h = this.img[0].Height;
	}

	this.update_img(img_arr);
	this.set_tooltip(tooltip_text);
}


Button.prototype.repaint = function() {
	window.RepaintRect(this.x, this.y, this.w+1, this.h+1);
}

Button.prototype.set_xy = function(x, y) {
	this.x = x;
	this.y = y;
}

Button.prototype.on_click = function(x, y, extra) {
	if (!this.is_down) { return; }
	try {
		this.func && this.func(x, y, extra)
	} catch (e) {};
	this.is_down  = false;
}

Button.prototype.draw = function (gr) {
	var img_ = this.img[this.state];
	img_ && gr.DrawImage(img_, this.x, this.y + (this.state == 2 ? 1 : 0), this.w, this.h, 0, 0, this.w, this.h, 0, 255);
}

Button.prototype.reset = function() {
	if (this.state != 0) {
		this.state = 0;
		this.tooltip  && this.tooltip.Deactivate();
		this.repaint();
	}
}

Button.prototype.check_state = function(event, x, y) {
	this.is_hover = (x > this.x && x < this.x + this.w && y > this.y && y < this.y + this.h);
	var old_state = this.state;
	switch (event) {
		case "down":
			if (this.state == 1) {
				this.is_down = this.is_hover;
			}
			this.state = this.is_hover ? 2 : 0;
			break;
		case "up":
			this.state = this.is_hover ? 1 : 0;
			if (!this.is_hover) {
				this.is_down = false;
			}
			break;
		case "move":
			if (this.state != 2) {
				this.state = this.is_hover ? 1 : 0;
			}
			if (this.tooltip) {
				if (this.is_hover) {
					this.tooltip.Activate();
				} else {
					this.tooltip.Deactivate();
				}
			}
			break;
	}
	if (this.state != old_state) {
		this.repaint();
	}
	return this.state;
}


// ======================================================================
// Functions
// ======================================================================

function console(s) {
	fb.trace(s);
};

function alert(msg) {
	fb.ShowPopupMessage(msg, "WSH Panel Mod", 0);
};

function caller() {
	var caller = /^function\s+([^(]+)/.exec(arguments.callee.caller.caller);
	if (caller) return caller[1];
	else return 0;
};

// Note: Not recommented to use this in `on_paint' callback, .
function GetTextWidth(str, font, type) {
	var temp_gr = gdi.CreateImage(1, 1);
	var g = temp_gr.GetGraphics();
	var ret;
	switch (type) {
		case 1:
			ret = Math.ceil(g.MeasureString(str, font, 0, 0, 0, 0).Width);
			break;
		case 0:
		default:
			ret = Math.ceil(g.CalcTextWidth(str, font));
			break;
	};
	temp_gr.ReleaseGraphics(g);
	temp_gr.Dispose();
	return ret;
}

function GetFBWnd() {
	return utils.CreateWND(window.ID).GetAncestor(2);
}

function InputBox(caption, promp, defval, num_only) {
	return GetFBWnd().InputBox(caption, promp, defval, num_only);
}

function MsgBox(caption, promp, type) {
	return GetFBWnd().MsgBox(caption, promp, type);
}

function FileDialog(mode, title, filetype, deftext) {
	return GetFBWnd().FileDialog(mode, title, filetype, deftext);
}

function $(field, metadb) {
	return metadb ? fb.TitleFormat(field).EvalWithMetadb(metadb) : fb.TitleFormat(field).Eval();
}

function StringFormat() {
	var h_align = 0,
		v_align = 0,
		trimming = 0,
		flags = 0;
	switch (arguments.length) {
		case 4:
			flags = arguments[3];
		case 3:
			trimming = arguments[2];
		case 2:
			v_align = arguments[1];
		case 1:
			h_align = arguments[0];
			break;
		default:
			return 0;
	};
	return ((h_align << 28) | (v_align << 24) | (trimming << 20) | flags);
}

function RGBA(r, g, b, a) {
	return ((a << 24) | (r << 16) | (g << 8) | (b));
}

function RGB(r, g, b) {
	return (0xff000000 | (r << 16) | (g << 8) | (b));
}

function toRGB(d) {
	var d = d - 0xff000000;
	var r = d >> 16;
	var g = d >> 8 & 0xFF;
	var b = d & 0xFF;
	return [r, g, b];
};


function negativeColor(colour) {
	var R = getRed(colour);
	var G = getGreen(colour);	
	var B = getBlue(colour);
	return RGB(Math.abs(R-255), Math.abs(G-255), Math.abs(B-255));
};

function blendColors(c1, c2, factor) {
	var c1 = toRGB(c1);
	var c2 = toRGB(c2);
	var r = Math.round(c1[0] + factor * (c2[0] - c1[0]));
	var g = Math.round(c1[1] + factor * (c2[1] - c1[1]));
	var b = Math.round(c1[2] + factor * (c2[2] - c1[2]));
	return (0xff000000 | (r << 16) | (g << 8) | (b));
};

function combineColors(bg, color) {
	var b = toRGB(bg);
	var c = [getRed(color), getGreen(color), getBlue(color), getAlpha(color) / 255];
	return RGB(
			(1 - c[3]) * b[0] + c[3] * c[0],
			(1 - c[3]) * b[1] + c[3] * c[1],
			(1 - c[3]) * b[2] + c[3] * c[2]
		  );
}

function getAlpha(color) {
	return ((color >> 24) & 0xff);
}

function getRed(color) {
	return ((color >> 16) & 0xff);
}

function getGreen(color) {
	return ((color >> 8) & 0xff);
}

function getBlue(color) {
	return (color & 0xff);
}

function setAlpha(color, a) {
	return ((color & 0x00ffffff) | (a << 24));
}

function sqrt(a) {
	return Math.sqrt(a);
}

function pow(a, b) {
	var c = b ? b : 2;
	return Math.pow(a, c);
}

// if Luminance(c) > 0.6, c is light; else c is dark.
function Luminance(color) {
	color = toRGB(color);
	return (0.2126 * color[0] + 0.7152 * color[1] + 0.0722 * color[2]) / 255.0;
};

function GetKeyboardMask() {
    var c = utils.IsKeyPressed(VK_CONTROL) ? true : false;
    var a = utils.IsKeyPressed(VK_ALT) ? true : false;
    var s = utils.IsKeyPressed(VK_SHIFT) ? true : false;
    var ret = KMask.none;
    if (c && !a && !s) ret = KMask.ctrl;
    if (!c && !a && s) ret = KMask.shift;
    if (c && !a && s) ret = KMask.ctrlshift;
    if (c && a && !s) ret = KMask.ctrlalt;
    if (c && a && s) ret = KMask.ctrlaltshift;
    if (!c && a && !s) ret = KMask.alt;
    return ret;
};

function get_system_dpi_percent() {
    var objShell = new ActiveXObject("WScript.Shell");
    var temp;
    try {
        temp = objShell.RegRead("HKEY_CURRENT_USER\\Control Panel\\Desktop\\WindowMetrics\\AppliedDPI");
        console("DPI: " + temp);
    } catch (e) {
        temp = 96;
    }
    return Math.round(temp / 96 * 100);
}

function zoom(value, factor) {
    return Math.round(value * factor / 100);
}

// ======================================================================
// Global Variables
// ======================================================================

var DT_LEFT = 0x00000000;
var DT_CENTER = 0x00000001;
var DT_RIGHT = 0x00000002;
var DT_VCENTER = 0x00000004;
var DT_WORDBREAK = 0x00000010;
var DT_CALCRECT = 0x00000400;
var DT_NOPREFIX = 0x00000800;
var DT_END_ELLIPSIS = 0x00008000;
var DT_SINGLELINE = 0x00000020;

var MF_GRAYED = 0x00000001;
var MF_STRING = 0x00000000;
var MF_POPUP = 0x00000010;
var MF_DISABLED = 0x00000002;

var IDC_ARROW = 32512;
var IDC_HAND = 32649;
var IDC_HELP = 32651;
var IDC_NO = 32648
var IDC_ARROW = 32512;
var IDC_IBEAM = 32513;

var DLGC_WANTALLKEYS = 0x0004; /* Control wants all keys           */

var VK_BACK = 0x08;
var VK_CONTROL = 0x11;
var VK_SHIFT = 0x10;
var VK_MENU = 0x12; // Alt key
var VK_ALT = 0x12;
var VK_PAUSE = 0x13;
var VK_ESCAPE = 0x1B;
var VK_SPACE = 0x20;
var VK_DELETE = 0x2E;
var VK_PRIOR = 0x21; // PAGE UP key
var VK_NEXT = 0x22; // PAGE DOWN key
var VK_PGUP = 0x21;
var VK_PGDN = 0x22;
var VK_END = 0x23;
var VK_HOME = 0x24;
var VK_LEFT = 0x25;
var VK_UP = 0x26;
var VK_RIGHT = 0x27;
var VK_DOWN = 0x28;
var VK_INSERT = 0x2D;
var VK_SPACEBAR = 0x20;
var VK_RETURN = 0x0D; //Enter
var VK_LSHIFT = 0xA0; // Left SHIFT key
var VK_RSHIFT = 0xA1; // Right SHIFT key
var VK_LCONTROL = 0xA2; // Left CONTROL key
var VK_RCONTROL = 0xA3; // Right CONTROL key
var VK_LMENU = 0xA4; // Left MENU key
var VK_RMENU = 0xA5; // Right MENU key
 
var VK_KEY_0 = 0x30 //	0
var VK_KEY_1 = 0x31 //	1
var VK_KEY_2 = 0x32 //	2
var VK_KEY_3 = 0x33 //	3
var VK_KEY_4 = 0x34 //	4
var VK_KEY_5 = 0x35 //	5
var VK_KEY_6 = 0x36 //	6
var VK_KEY_7 = 0x37 //	7
var VK_KEY_8 = 0x38 //	8
var VK_KEY_9 = 0x39 //	9
var VK_KEY_A = 0x41 //	A
var VK_KEY_B = 0x42 //	B
var VK_KEY_C = 0x43 //	C
var VK_KEY_D = 0x44 //	D
var VK_KEY_E = 0x45 //	E
var VK_KEY_F = 0x46 //	F
var VK_KEY_G = 0x47 //	G
var VK_KEY_H = 0x48 //	H
var VK_KEY_I = 0x49 //	I
var VK_KEY_J = 0x4A //	J
var VK_KEY_K = 0x4B //	K
var VK_KEY_L = 0x4C //	L
var VK_KEY_M = 0x4D //	M
var VK_KEY_N = 0x4E //	N
var VK_KEY_O = 0x4F //	O
var VK_KEY_P = 0x50 //	P
var VK_KEY_Q = 0x51 //	Q
var VK_KEY_R = 0x52 //	R
var VK_KEY_S = 0x53 //	S
var VK_KEY_T = 0x54 //	T
var VK_KEY_U = 0x55 //	U
var VK_KEY_V = 0x56 //	V
var VK_KEY_W = 0x57 //	W
var VK_KEY_X = 0x58 //	X
var VK_KEY_Y = 0x59 //	Y
var VK_KEY_Z = 0x5A //	Z
 
var VK_F1	= 0x70 //	F1
var VK_F10	= 0x79 //	F10
var VK_F11	= 0x7A //	F11
var VK_F12	= 0x7B //	F12
var VK_F13	= 0x7C //	F13
var VK_F14	= 0x7D //	F14
var VK_F15	= 0x7E //	F15
var VK_F16	= 0x7F //	F16
var VK_F17	= 0x80 //	F17
var VK_F18	= 0x81 //	F18
var VK_F19	= 0x82 //	F19
var VK_F2	= 0x71 //	F2
var VK_F20	= 0x83 //	F20
var VK_F21	= 0x84 //	F21
var VK_F22	= 0x85 //	F22
var VK_F23	= 0x86 //	F23
var VK_F24	= 0x87 // F24
var VK_F3	= 0x72 //	F3
var VK_F4	= 0x73 //	F4
var VK_F5	= 0x74 // F5
var VK_F6	= 0x75 // F6
var VK_F7	= 0x76 // F7
var VK_F8	= 0x77 // F8
var VK_F9	= 0x78 // F9


var FontStyle={Regular:0,Bold:1,Italic:2,BoldItalic:3,Underline:4,Strikeout:8};
var StringTrimming={None:0,Character:1,Word:2,EllipsisCharacter:3,EllipsisWord:4,EllipsisPath:5};
var StringFormatFlags={DirectionRightToLeft:1,DirectionVertical:2,NoFitBlackBox:4,DisplayFormatControl:32,NoFontFallback:1024,MeasureTrailingSpaces:2048,NoWrap:4096,LineLimit:8192,NoClip:16384};
var TextRenderingHint={SystemDefault:0,SingleBitPerPixelGridFit:1,SingleBitPerPixel:2,AntiAliasGridFit:3,AntiAlias:4,ClearTypeGridFit:5};
var SmoothingMode={Invalid:-1,Default:0,HighSpeed:1,HighQuality:2,None:3,AntiAlias:4};
var InterpolationMode={Invalid:-1,Default:0,LowQuality:1,HighQuality:2,Bilinear:3,Bicubic:4,NearestNeighbor:5,HighQualityBilinear:6,HighQualityBicubic:7};
var PlaybackOrder={Default:0,Repeat:1,Repeat1:2,Random:3,ShuffleT:4,ShuffleA:5,ShuffleF:6};
var AlbumArtId={front:0,back:1,disc:2,icon:3,artist:4};
var ColorTypeDUI={text:0,background:1,highlight:2,selection:3};
var ColorTypeCUI={text:0,selection_text:1,inactive_selection_text:2,background:3,selection_background:4,inactive_selection_background:5,active_item_frame:6};
var FontTypeCUI={items:0,labels:1};
var FontTypeDUI={defaults:0,tabs:1,lists:2,playlists:3,statusbar:4,console:5};
var ButtonStates = {normal: 0, hover: 1, down: 2};
var KMask = {
    none: 0,
    ctrl: 1,
    shift: 2,
    ctrlshift: 3,
    ctrlalt: 4,
    ctrlaltshift: 5,
    alt: 6
};

