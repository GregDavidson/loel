/* cci.js - Collaborative Community Infrastructure JavaScript library
	A Low-Level Browser-Independent JavaScript Library.
	None of these functions use any other library or toolkit.
	All other Wicci JavaScript libraries require this one.
	Copyright (c) 2011 J. Greg Davidson. All rights reserved
	// DRAFT: Not ready for you yet!
*/

// Miscellaneous utility functions

/* Conventions:
	(1) "ra" means an array-like object,
		e.g, array, function arguments, nodelist, etc.
	(2) I prefer to use the constructor function of an object
		to represent its type, rather than using a string name.
	(3) module objects describe functions, data, types, etc.
*/

// "use strict"; // Now causing some trouble, Thursday 17 April 2014
cci = {};												// make lint happy
// module object cci contains convenience functions, data and types
cci = {
	// * essential error reporting; see * nicer error reporting
	warnMsg: function(msg) {
		alert(msg); return this; // breakpoint this line??
	},
	failMsg: function(msg) {
		cci.warnMsg(msg); throw new Error(msg);
	},
	// * type classification
	type: function(x) {
		return (x === null || x === undefined) ? x: (
			x.constructor || typeof x		// paranoid??
		);
	},
	// cci.testReturn defined below (Forward Reference)
	test_type: function() {
		cci.testReturn('type', null, null);
		cci.testReturn('type', undefined, undefined);
		cci.testReturn('type', String, 'string');
		cci.testReturn('type', Number, 123);
		cci.testReturn('type', Array, []);
		cci.testReturn('type', Object, {});
	},
	isa: function(x, t) { return cci.type(x) === t; },
	isa1: function(x, t) { return cci.isa(x, t) ? x : null; },
	typeEq: function(x, y) {	return cci.type(x) === cci.type(y);	},
	typeEq1: function(x, y) { return cci.typeEq(x,y) ? x : null; },
	asString: function(x) {
		return x===null ? 'null' :	x===undefined ? 'undefined' :	x.toString();
	},
	// * functions for strings
	// return string padded with blanks at both ends or ""
	padded: function(string) {
		if ( !string || typeof string!=="string" || string==="" ) { return ""; }
		if ( string.charAt(0) !== " " ) { string = " " + string; }
		if ( string.charAt(string.length-1) !== " " ) { string += " "; }
		return string;
	},
	// * functions for array-like objects, e.g. arrays or arguments
	join:  function(ra, delim) {
		return Array.prototype.join.apply(	ra, [cci.isa(delim, String) ? delim : '\n'] );
	},
	unshift: function(ra, x) {
		if (ra.unshift) { ra.unshift(x); return ra; }
		for (var i = ra.length; i > 0; i-- ) { ra[i] = ra[i-1]; }
		ra[0] = x;
		return ra;
	},
	test_unshift: function() {
		cci.testReturn('unshift', [1], [], 1);
	},
	slice: function(ra, from, to) {
		var f = from===undefined ? 1 : from;
		var t = to===undefined ? ra.length : to;
		return Array.prototype.slice.call(ra, f, t);
	},
	test_slice: function() {
		cci.testReturn('slice', [2, 3], [1,2,3]);
		cci.testReturn('slice', [3], [1,2,3], 2);
		cci.testReturn('slice', [1, 2, 3], [1,2,3], 0);
	},
	flat1: function(x) {					// unnest any ra objects within x
		var callee = cci.flat1;			// for strict mode
		if ( !x || typeof x !== 'object' || x.length === undefined) { return [x]; }
		var ra = [];
		for (var i = 0; i < x.length; i++) {
			if ( !x[i] || x[i].length === undefined) {
				ra.push(x[i]);
			} else {
				var xi = callee(x[i]); // why "too much recursion" ??
				Array.prototype.push.apply(ra, xi);
			}
		}
		return ra;
	},
	flat: function() {					// unnest any ra objects within the arguments
		return cci.flat1(arguments);
	},
	test_flat: function() {
		cci.testReturn('flat', [1, 2, 3], [[1,[2],3]]);
		cci.testReturn('flat', [], [[], [[]]]);
	},
	map: function(ra, filter) {
		var array = new Array(ra.length);
		for (var i = 0; i < ra.length; i++) { array[i] = filter(ra[i]); }
		return array;
	},
	test_map: function() {
		var filter = function(x){ return x + 1; };
		cci.testReturn('map', [], [], filter);
		cci.testReturn('map', [2,3], [1,2], filter);
	},
	flatStrs: function() { return cci.map(cci.flat(arguments), cci.asString);	},
	// * object equivalence testing
	// equiv && equiv_ mutually recursive!! (Forward Reference)
	equiv_: function(x, y) {
		for (var key in x) {
			if ( ! cci.equiv( x[key], y[key] ) ) { return false; }
		}
		return true;
	},
	ra_equiv: function(x, y) {
		if (x.length !== y.length) { return false; }
		for (var i = 0; i < x.length; i++) {
			if ( ! cci.equiv( x[i], y[i] ) ) { return false; }
		}
		return true;
	},
	equiv: function(x, y) {
		if (x === y) { return true; }
		if (typeof x !== 'object' || typeof y !== 'object') { return false; }
		if (x.constructor !== y.constructor) { return false; }
		if (x.constructor === Array) { return cci.ra_equiv(x, y); }
		return cci.equiv_(x, y) && cci.equiv_(y, x);
	},
	// * nicer error reporting
	warnMsgs: function() { return cci.warnMsg( cci.join(arguments) ); },
	failMsgs: function() { cci.failMsg( cci.join(arguments) ); },
	failType: function(methodName, objName, typeName) {
		cci.failMsgs(methodName, objName + ' not ' + typeName);
	},
	// Function names
	getFuncName: function(func) {
		return ( !!func.name && func.name ) || func.prototype.fname || 'anon';
	},
	setFuncName: function(func, name) {
		var oldName = cci.getFuncName(func);
		if ( oldName ) {
			oldName === name || true || // diagnose & re-enable!!
				cci.warnMsgs('init', name, 'function name clash');
		} else {
			func.prototype.fname = name;
		}
	},
	// ** install Types and make sure top-level functions know their names
	Init: function() {
		// for all the Types described in this module object
		for (var typeName in this.Types) {
			var type = this.Types[typeName];
			if ( typeof type === 'function' ) { continue; }
			// check that we have a constructor and it knows its name
			var ctor = type.ctor;
			typeof ctor === 'function' || cci.failType(typeName, 'ctor', 'function');
			cci.setFuncName(ctor, typeName + '_ctor');
			// install the methods in the constructor's prototype
			if ( type.methods ) {
				typeof type.methods === 'object' || cci.failType(typeName, 'methods', 'object');
				for (var methodName in type.methods) {
					var method = type.methods[methodName];
					typeof method === 'function' ||
						cci.failType(typeName, methodName, 'function');
					cci.setFuncName(method, methodName);
					if (methodName !== 'toString' && ctor.prototype[methodName]) { // ??
						ctor.prototype[methodName] === method ||
							cci.failMsgs(typeName, methodName, 'prototype method name clash');
					} else {
						ctor.prototype[methodName] = method;
					}
				}
			}
			// ** install any shared data in the constructor's prototype
			if ( type.shared ) {
				typeof type.shared === 'object' || cci.failType(typeName, 'shared', 'object');
				for (var name in type.shared) {
					var data = type.shared[name];
					if (ctor.prototype[name]) {
						ctor.prototype[name] === data ||
							cci.failMsgs(typeName, name, 'prototype data name clash');
					} else {
						ctor.prototype[name] = data;
					}
				}
			}
			// ** install any exported functions to the module object's top level
			if ( type.exports ) {
				typeof type.exports === 'object' || cci.failType(typeName, 'exports', 'object');
				for (var exportName in type.exports) {
					var x = type.exports[exportName];
					typeof x === 'function' ||	cci.failType(typeName, exportName, 'function');
					if (this[exportName]) {
						this[exportName] === x ||
							cci.failMsgs(typeName, exportName, 'name clash');
					} else {
						cci.setFuncName(x, exportName);
						this[exportName] = x;
					}
				}
			}
			// ** run any 1-time initialization function
			if ( this.Types[typeName].init ) {
				this.Types[typeName].init();
			}
			// ** run any tests
			if ( type.tests ) {
				type.tests.constructor === Array || cci.failType(typeName, 'test', 'array');
				for (var i = 0; i < type.tests.length; i++) {	type.tests[i]();	}
			}
		}												// for (var typeName in this.Types)
		// ** make sure all top-level functions know their names
		for (var fname in this) {
			typeof this[fname] === 'function' && cci.setFuncName(this[fname], fname);
		}
	},
	// * Here are the structured object types
	Types: {
		// ** LabelValue objects are just a value paired with a string label
		LabelValue: {
			ctor: function(label, value) {
				this.label = label;
				this.value = value;
			},
			methods: {
				toString: function() {	return this.label + ': ' + cci.asString(value); }
			},
			exports: {
				label_value: function(label, value) {
					return new cci.Types.LabelValue.ctor(label, value);
				}
			}
		},
		// ** Calls objects contain calling context for debugging messages
		Calls: {
			ctor: function(func, args, caller) {
				var callee = cci.Calls.ctor;			// for strict mode
				!func || typeof func === 'function' || cci.failType('Calls', 'func', 'function');
				this.func = func || null;
				!args || typeof args === 'object' && args.length !== undefined ||
					cci.failType('Calls', 'args', 'ra');
				this.args = args || [];
				!caller || caller.constructor === callee ||
					cci.failType('Calls', 'caller', 'Calls');
				this.caller = caller || null;
				this.extra_args = cci.flat( cci.extra_args(arguments, callee.length) );
			},
			methods: {
				name: function() { return cci.getFuncName(this.func); },
				item: function() {
					return this.name() + '(' + cci.map(this.args, cci.asString).join(',') + ')';
				},
				chain: function() {
					return cci.list_array(this, 'caller', cci.call_item).reverse().join('.');
				},
				args: function() { return this.args; },
				msg: function(level) {
					var callee = cci.Calls.methods.msg;			// for strict mode
					var context = this.chain() + (level ? ' ' + level : '');
					var extras =
						cci.flatStrs(	cci.extra_args(arguments, callee.length) );
					return [context + (extras.length ? ': ' : '')].concat(extras).join('\n');
				},
				fail: function() {
					var callee = cci.Calls.methods.fail;			// for strict mode
					cci.failMsg(	this.msg(
						'fail', cci.extra_args(arguments, callee.length	) ) );
				},
				warn: function() {
					var callee = cci.Calls.methods.warn;			// for strict mode
					cci.warnMsg(	this.msg(
						'warning', cci.extra_args(arguments, callee.length) ) );
					return this;
				}
			},
			exports: {
				calls: function(func, args, caller) {
					var callee = cci.Calls.exports.warn;			// for strict mode
					return new cci.Types.Calls.ctor(
						func, args, caller, cci.extra_args(arguments, callee.length));
				},
				fail: function() {
					var call = arguments[0] &&
						arguments[0].constructor === cci.Types.Calls.ctor &&
						arguments.shift();
					if (call) { return call.fail.apply(call, arguments); }
					var func = arguments[0] &&
						typeof arguments[0] === 'function' &&
						arguments.shift();
					var args = func && arguments[0] &&
						typeof arguments[0] === 'object' && arguments[0].length &&
						arguments.shift();
					var caller = arguments[0] &&
						arguments[0].constructor === cci.Types.Calls.ctor &&
						arguments.shift();
					if ( func || caller ) { return cci.calls(func, args, caller).fail(arguments); }
					return cci.FailMsgs.apply(this, arguments);
				},
				call_item: function(call) { return call.item(); }
			}
		}, // Calls
		// ** NodeClass objects hold a single node class name
		NodeClass: {
			ctor: function(className) {
					this.className = cci.nodeClassName(className);
			},
			methods: {
				name: function() { return this.className; },
				path: function() { return '.' + this.className; },
				toString: function() { return this.className; }
			},
			exports: {
				nodeClass: function(name) {
					return name && name.constructor === cci.Types.NodeClass.ctor ?
						name : new cci.Types.NodeClass.ctor(name);
				},
				nodeClassName: function(name) {
					return ( name &&
						name.constructor === cci.Types.NodeClass.ctor &&
						name.name() ) ||
						( cci.okNodeClassName(name) && name ) ||
						cci.failType('nodeClassName', cci.asString(name), 'not valid');
				},
				okNodeClassName: function(name) {
					return typeof name==='string' &&
						name.match(/^[_a-zA-Z]+[_a-zA-Z0-9-]*$/);
				},
				okNodeClass: function(name) {
					return cci.okNodeClassName(name) ||
						( name && name.constructor === cci.Types.NodeClass.ctor );
				}
			}
		},
		// ** Node objects wrap a DOM node; Probably better to just add these
		// to the wi JQuery features!
		Node: {
			ctor: function(node) {
				cci.isElementNode(node) || cci.failType('Node_ctor', 'node', 'element');
				this.node = node;
			},
			methods: {
				storeClasses_: function() {
					this.classList = this.node.className = cci.trim(this.paddedClasses);
				},
				fetchClasses_: function() {
					this.paddedClasses = (' '+ this.node.className+ ' ').replace(/\s\s*/, ' ');
					this.storeClasses_();
			},
			classIndex: function(className) {
				if (this.classList !== this.node.className) { this.fetchClasses_(); }
					return this.paddedClasses.indexOf(
						cci.padded(cci.nodeClass(className)) );
			},
			// replace existing class list with new class(es)
			setClasses: function() {
				for (var i = 0; i < arguments.length; i++) {
					( arguments[i] = cci.okNodeClass(arguments[i]) ) ||
						cci.failType('setClasses', arguments[i], 'valid classname');
				}
				this.node.className = Array.prototype.join.call(arguments, ' ');
				return this;
			},
			hasClass: function(className) {
				return this.classIndex(className) >= 0;
			},
			// add 0 or more classes to a given node
			addClass: function() {
				for (var i = 0; i < arguments.length; i++) {
					var nodeClass = cci.nodeClass(arguments[i]);
					this.classIndex(nodeClass) >= 0 ||
						(this.node.className += ' ' + nodeClass.name());
				}
				return this;
			},
			// remove a class even if it might occur more than once
			delClass: function(className) {
				var start;
				while ( (start = this.classIndex(className)) >= 0 ) {
					var len = cci.padded(className).length - 1;
					this.paddedClasses = 
						this.paddedClasses.substr(0, start) +
							this.paddedClasses.substr(start + len);
					this.storeClasses_();
				}
				return this;
			}
		},													// methods
		exports: {
			node: function(node) {
				return node && node.constructor === cci.Types.Node.ctor ?
					node : new cci.Types.Node.ctor(node);
			},
			// *** the following legacy functions need to be integrated with methods
			sibRank: function(node, filter) {
				var sibs = node.parentNode.childNodes, sib, rank=0;
				for (	var i = 0;	( sib=sibs[i] ) !== node;	i++ ) { filter(sib) && ++rank; }
				return rank;
			},
			rootPath: function(node, filter, caller) {
				cci.isElementNode(node) ||
					cci.calls(cci.Type.Node.exports.rootPath, arguments, caller).fail();
				var n, len = 0;
				for (n=node; n.parentNode; n=n.parentNode) { len++; }
				var path = new Array(len), i = 0;
				for (n=node; n.parentNode; n=n.parentNode) {
					path[i++] = cci.sibRank(n, filter);
				}
				return path.reverse().slice(1);
			},
			// shallow copy an element and strip off any "id" attribute
			clone: function(node) {
				var copy = node.cloneNode(false);
				copy.removeAttribute('id');
				// copy.setAttribute('copy', (copy.getAttribute('copy') || 0) + 1); // debug!!
				return copy;
			},
			// check that given node is an element with given tag and class
			node_tag_class: function(caller, node, tag, nodeClass) {
				var callee = cci.Type.Node.exports.node_tag_class;			// for strict mode
				var cci_node = node && cci.node(node);
				if ( cci_node && (!tag || cci.hasTag(node, tag)) &&
					(!nodeClass || cci_node.hasClass(nodeClass)) ) { return node; }
				var extra_args = cci.extra_args(arguments, callee.length);
				var call = cci.calls(callee, arguments, caller);
				node || call.fail('No node', extra_args);
				!tag || cci.hasTag(node, tag) ||
					call.fail(cci.label_value('node tag', node.tagName),	' <> ',	tag);
				!nodeClass || cci_node.hasClass(nodeClass) ||
					call.fail( cci.label_value('class', nodeClass), ' not in ',	node.className	);
				return node;
			},
			isNode: function(n, t) {
				return n &&
					typeof t === 'number' ? n.nodeType === t :
					typeof t === 'string' ? n.nodeType === cci.nodeTypeCode(t) :
				!t && n.nodeType;
			},
			isAttrNode: function(n) { return n && n.nodeType === 2; },
			isTextNode: function(n) { return n && n.nodeType === 3; },
			isElementNode: function(n) { return n && n.nodeType === 1; },
			hasTag: function(n, t) { return n && t && n.tagName === t; },
			// create element of given nodeTag and optional classes
			newElement: function(nodeTag /* class... */) {
				var callee = cci.Type.Node.exports.newElement;			// for strict mode
				var newNode = document.createElement(nodeTag);
				var classes = cci.extra_args(arguments, callee.length);
				var call = cci.calls(callee, arguments);
				newNode || call.fail('!newNode');
				var cci_node = cci.node(newNode);
				classes.length && cci_node.setClasses.apply(cci_node, classes);
				return newNode;
			},
			detach: function(node) {
				node.parentNode && node.parentNode.removeChild(node);
				return node;
			},
			move_node_parent: function(node, parent) {
				parent.appendChild( node ); return node;
			},
			move_node_parent_before: function(node, parent, next) {
				parent.insertBefore(node, next);
				return node;
			},
			move_node_before: function(node, next) {
				return cci.move_node_parent_before(node, next.parentNode, next);
			},
			move_node_parent_after: function(node, parent, prev) {
				return cci.move_node_parent_before(node, parent, prev && prev.nextSibling);
			},
			move_node_after: function(node, prev) {
				return cci.move_node_parent_after(node, prev.parentNode, prev);
			},
			nodeTypeCode: function(x) {
				var codes = cci.Types.Node.ctor.prototype.nodeTypeCodes;
				return codes[x] || cci.failType('nodeType', cci.asString(x), 'nodeType');
			},
			nodeTypeName: function(x) {
				var names = cci.Types.Node.ctor.prototype.nodeTypeNames;
				return names[x] || cci.failType('nodeType', cci.asString(x), 'nodeType');
			}
		},												// exports
		init: function() {
			var proto = this.ctor.prototype;
			var codes = proto.nodeTypeCodes;
			var names = proto.nodeTypeNames;
			for (var code in names) {
				if ( codes[ names[code] ] ) {
					codes[ names[code] ] === code || 
						cci.failMsgs(typeName, names[code], 'nodeType name clash');
				} else {
					codes[ names[code] ] = code;
				}
			}
			return this;
		},
		shared: {
			// if this is turned into an array, be sure to fix
			// method nodeTypeName && class method init above!!
			nodeTypeNames: {
				1: 'ELEMENT',
				2: 'ATTRIBUTE',
				3: 'TEXT',
				4: 'CDATA_SECTION',
				5: 'ENTITY_REFERENCE',
				6: 'ENTITY',
				7: 'PROCESSING_INSTRUCTION',
				8: 'COMMENT',
				9: 'DOCUMENT',
				10: 'DOCUMENT_TYPE',
				11: 'DOCUMENT_FRAGMENT',
			12: 'NOTATION'
			},
			nodeTypeCodes: { } // the inverse of nodeTypeNames
		}
		// create tests, e.g. for correspondence between nodeTypeNames & Codes
		// actually: have that done by an init function!
		},				// Node
		// ** Queue objects are NGender legacy code
		Queue: {
				// cci.queue queues up functions (with their arguments) to be
				// called when an event is delivered, e.g., onload and
				// onresize events.
				// If the first argument is the string "document" it will
				// be replaced by the value of window.document.
				ctor: function(name) {
						this.name = name;
						this.queue = [];
				},
				methods: {
						put_first: function(f, args) {
							var callee = cci.Type.Queue.methods.put_first;	// for strict mode
							typeof f === 'function' || cci.fail(callee, arguments, 'f not function!');
							this.queue = cci.unshift( cci.slice(arguments), this.queue );
						},
						put: function(f, args) {
								typeof f === 'function' || cci.fail(callee, arguments, 'f not function!');
								this.queue.push(cci.slice(arguments));
						},
						call_them: function() {
								for (var i = 0; i < this.queue.length; i++) {
										var args = this.queue[i];
										var f = args.shift();	// take the function off
										if (args[0] === 'document') { args[0] = document; }
										f.apply(window, args);
										args = cci.unshift(f, args);		// put the function back
								}
						}
				},
				init: function() {
						var ctor = this.ctor, proto = ctor.prototype;
						proto.load = new ctor('load');
						proto.resize = new ctor('resize');
				}
		}														// Queue
	},														// Types
	/*	still needed??
	link_functions: function(src, dst) {
		for (var fname in src) {
			if ( typeof src[fname] === 'function' ) {
				if (dst[fname] !== src[name] ) {
					cci.failMsgs('link_functions', fname, 'function name clash');
				} else {
					dst[fname] = src[fname];
				}
			}
		}
	},
	*/
	/* Given some objects, a link property e.g. caller, nextSibling, etc.
		and an optional filter function, return an array of the (filtered?) objects.
	*/
	list_array: function(o, link, filter) {
		var len = 0;
		for (var p = o; p; p = p[link]) { ++len; }
		var ra = new Array(len), i = 0;
		for (p = o; p && i < len; p = p[link]) { ra[i++] = filter ? filter(p) : p; }
		return ra;
	},
	test_list_array: function() {
		var o3={x: 3}, o2={x: 2, link: o3}, o1={x: 1, link: o2};
		// what is the degenerate case?
		cci.testReturn('list_array', [1,2,3], o1, 'link', function(o) {return o.x;} );
		cci.testReturn('list_array', [o1,o2,o3], o1, 'link');
	},
	sub: function(obj) {				// subscript obj by chain of keys
		var callee = cci.sub;			// for strict mode
		var keys = cci.extra_args(arguments, callee.length);
		for (var i = 0; i < keys.length; i++) {
			if ( ! (obj = obj[keys[i]]) ) { break; }
		}
		return obj;
	},
	test_sub: function() {
		var o3={x: 'goal'}, o2={link: o3}, o1={link: o2};
		// what is the degenerate case?
		cci.testReturn('sub', 'goal', o1, 'link', 'link', 'x');
	},

	for_one: function(func, the_this, args) {
		var callee = cci.sub;			// for strict mode
		var call = cci.calls(callee, arguments);
		typeof func === 'function' || call.fail('func not a function');
		if (typeof args === 'object' && args.length !== undefined) {
			func.length === args.length || call.fail('unequal lengths');
			func.apply(the_this, args);
		} else {
			func.length === 1 || call.fail('length != 1');
			func.apply(the_this, args);
		}
	},

	// Simple utility to call a unary function multiple times
	// on each of a list of values with a given "this" value
	// (the "this" value might be something silly, like window)
	for_each: function(func, the_this) {
		for (var i = for_each.length; i < arguments.length; i++) {
			cci.for_one(func, the_this, arguments[i]);
		}
	},
	first_true: function() {
		for (var i = 0; i < arguments.length; i++) {
			if (arguments[i]) { return arguments[i]; }
		}
		return null;
	},

	all_space: /^\s*$/,
	isSpace: function(s) { return cci.all_space.test(s); },

	global_space: /\s\s*/g,
	normalizeSpace: function(t) {return t.replace(cci.global_space, ' '); },

	trim: function(str) { return str.replace(/^\s\s*/, '').replace(/\s\s*$/, ''); },
	quoteRegexSubstring: function(regex) {
		return regex.replace(/([][(){}$^.*+?|])/g, '$1');
	},
	// * Testing
	testReturn: function(funcName, expectedReturn) {
		var callee = cci.sub;			// for strict mode
		var call = cci.calls(callee, arguments);
		var func = cci[funcName];
		typeof func === 'function' || call.fail('expected function');
		var actualReturn =
			func.apply(this, cci.extra_args(arguments, callee.length));
		cci.equiv(expectedReturn, actualReturn) ||
			call.fail('expected: ', expectedReturn, 'got: ', actualReturn);
	},
	test_all: function() {
		cci.test_type();
		cci.test_unshift();
		cci.test_slice();
		cci.test_flat();
		cci.test_map();
		cci.test_list_array();
		cci.test_sub();
	}
}; // cci
// Some handy aliases:
cci.extra_args = cci.slice;

// Initialize all types and function names in cci:
cci.Init();
cci.test_all();

// add cci.node.methods dispatcher to HTMLElement.prototype
// Note: this may not work in IE and maybe some other browsers!!!
// Can we kludge it for IE by adding to Object.prototype ???

(function( $, cci ){
	$.cci = function( maybeMethodName ) {
		this.cci_call = typeof maybeMethodName !== 'string'	?
			cci.calls(cci.init, arguments, this.cci_call):
			cci.calls( cci.node.methods[maybeMethodName],	cci.slice( arguments ), this.cci_call	);
	this.cci_call.func || this.cci_call.fail('no cci method ', maybeMethodName);
	return this.cci_call.func.apply( this, this.cci_call.args);
	};
})( HTMLElement.prototype, cci );
