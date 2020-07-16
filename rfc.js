// Copyright (c) 2011 J. Greg Davidson.  All rights reserved.

/* Scratch:

var docFragment = document.createDocumentFragment();
var newPara = document.createElement("p");
var add_news = document.createTextNode("The latest news goes here.");
newPara.appendChild( add_news );
var value = elementNode.getAttribute(name);
elementNode.setAttribute(name,value) ;

var newatt=xmlDoc.createAttribute("edition");
newatt.value="first";
elem.setAttributeNode(newatt);
*/

if (!String.prototype.trim) {
   String.prototype.trim=function(){return jQuery.trim(this); };
}

function expiry_string(days_to_live) {
	var expiration=new Date();
	expiration.setDate(expiration.getDate() + days_to_live);
	return "; expires="+expiration.toUTCString();
}

 function setCookie(name,value,days_to_live) {
 	var expiry = days_to_live ? expiry_string(days_to_live) : "";
	document.cookie=name + "=" + escape(value) + expiry;
}

// quote a string so it will match as literal inside a regular-expression
function reQuote(s) { return ('' + s).replace(/[[\]{}()*+?.\\^$|]/g, '\\$&'); }

function getCookie(name) {
  var re = new RegExp('(?:^|.*;)\\s*' + reQuote(name) + '=([^;]*)');
	var result = re.exec(document.cookie);
	return result && unescape(result[1]);
}

function isAttrNode(n) { return n && n.nodeType === 2; }
function isTextNode(n) { return n && n.nodeType === 3; }
function isElementNode(n) { return n && n.nodeType === 1; }

function hasType(x, t) {
	var type = (x === null || x === undefined) ? x: ( x.constructor || typeof x	);
	return arguments.length === 1 ? type : type === t;
}

function addElemAfter(elem, after_this) {
	var sibling = after_this || this;
	var parent = sibling.parentNode;

	if (parent.lastChild == sibling) {
		parent.appendChild(elem);
	} else {
		parent.insertBefore(elem, sibling.nextSibling);
	}
	return elem;
}

function newText(text) {
	return document.createTextNode(text);
}

// add children or attributes
// add to ElementNode ??
// add to DocumentFragment ??
function addChiln() {
	for (var child_num = 0; child_num < arguments.length; child_num++) {
		var child = arguments[child_num];
		if ( isAttrNode(child) ) {
			this.setAttributeNode(child);
		} else {								// better be node or string!!!
			this.appendChild( hasType(child, String) ? newText(child) : child );
		}
	}
	return this;
}

function addAttrs() {						// add to ElementNode ??
	var n = 0;
	while (n < arguments.length) {
		var x = arguments[n++];
		if ( isAttrNode(x) ) {
			this.setAttributeNode(x);
		} else if (n < arguments.length) {
			var val = arguments[n++];
			if (val) {
				this.setAttribute(x, val);
			}
		}
	}
	return this;
}

function newElem(tag, attrs) {
	var num_args = arguments.callee.length;
	var slice = Array.prototype.slice;
	var elem = document.createElement(tag);
	if ( attrs && attrs.length && attrs.length > 0 ) {
		addAttrs.apply(elem, attrs);
	}
	if ( arguments.length > num_args ) {
		addChiln.apply(elem, slice.call(arguments, num_args));
	}
	return elem;
}

function makeComment() {
	return newElem('em', ['class', "rfc", 'title', "toggle comments for this section"], " +");
}

function newDT(text) { return newElem('dt', [], text); }

function newInput(type, name, value) {
	return  newElem('input', ["type", type, 'name', name, 'value', value]);
}

function newTextInput(name, size) {
	return newElem('input', ['type', "text", 'name', name, 'size', size]);
}

function hideNode(explicit_node) {  // add to elementNode ??
	var node = isElementNode(explicit_node) ? explicit_node : this;
	node.style.display = "none";
//	rmClass(node, 'show'); addClass(node, 'hide');
	return node;
}

function showBlock(explicit_node) {  // add to elementNode ??
	var node = isElementNode(explicit_node) ? explicit_node : this;
	node.style.display = "block";
//	rmClass(node, 'hide'); addClass(node, 'show'); // not just for block elements!
	return node;
}

function optional(explicit_node) {  // add to elementNode ??
	var node = isElementNode(explicit_node) ? explicit_node : this;
	return addChiln.call( node, newElem('em', [], '(optional)') );
}

function required(explicit_node) {  // add to elementNode ??
	var node = isElementNode(explicit_node) ? explicit_node : this;
	return addChiln.call( node, newElem('em', [], 'required!') );
}

function formInputDefault(form,  input_name, default_value) {
	if ( default_value && form.elements[input_name].value === '' ) {
			form.elements[input_name].value = default_value;
	}
}

function rfcToggle(event) {
	var area = this.parentNode.nextSibling; // had better be our div!!
	var form = area.firstChild;
	switch(area.className)	{
		case 'hide':
			formInputDefault(form, 'name', getCookie('commenter_name'));
			formInputDefault(form, 'email', getCookie('commenter_email'));
			area.className = 'show';
			break;
		case 'show':	area.className = 'hide';	break;
		default: break;							// error!
	}
}

function rfcHide(event) {
	var area = this;
	while (	area && area.className !== 'show'	) area = area.parentNode;
	area.className = 'hide';			// this should be our div !!
}

// unify the two blur functions with a closure ??

function nameBlur(event) {
	var node = this, val = node.value.trim();
	if ( val ) setCookie('commenter_name', val, 365);
}

function emailBlur(event) {
	var node = this, val = node.value.trim();
	if ( val ) setCookie('commenter_email', val, 365);
}

/*	<h1 id="foo_id"> Foo! </h1>
-->
	<h1 id="foo_id"> Foo! <em class="rfc" title="toggle comments"> +</em></h1>
	 <div class="hide">
			<form action="/cgi-bin/jgd/rfc.tcl" method="POST">
				<dl>
					<dt style="display: none"> Spam Trap: </dt>
					<dd style="display: none">
						<input type="checkbox" name="send_to_List" value="error" />
						<em>Spam Trap</em>
					</dd>
					 <dt> Your Name:<em>(optional)</em> </dt>
					 <dd> <input type="text" name="name" size=30 /> </dd>
					 <dt> Your Email Address: <em>required!</em></dt>
					 <dd> <input type="text" name="email" size=30 /> </dd>
					 <dt> Your Comment: </dt>
					 <dd>
							<textarea name="message" cols="60" rows="5"></textarea>
							<input type="reset" value="Clear Form" />
							&nbsp;&nbsp;&nbsp;
							<input type="submit" name="foo_id" value="submit" />
					 </dd>
				 </dl>
			 </form>
	 </div> <!-- hide  -->
*/
function add_rfc(explicit_node) {
	var node = isElementNode(explicit_node) ? explicit_node : this;
	var id = node.getAttribute('id');
	var rfc_control = makeComment();
	var submit = newInput('submit', '#' + id, "submit");
	var reset =	newInput('reset', "reset", "reset");
	var name_input = newTextInput("name", 30);
	var email_input =  newTextInput("email", 30);
	addElemAfter(rfc_control, node.lastChild);
	var rfc_area =	newElem(	'div', ['class', 'hide'],
		newElem(	'form', ['action', "/cgi-bin/jgd/rfc.tcl", 'method', "POST"],
			newElem( 'dl', [],
				hideNode( newDT('Spam Trap') ),
				hideNode( newElem( 'dd', [],
					newInput('checkbox', "spam_trap", "error"),
					newElem('em', [], "Spam Trap")
				) ),
				optional( newDT('Your Name: ') ),	newElem( 'dd', [], name_input ),
				required( newDT('Your Email: ') ),	newElem('dd', [], email_input ),
				newDT('Comment on this section: '),
				newElem('dd', [],
					newElem( 'textarea',  ['name', "message", 'cols', 60, 'rows', 5]	),
					newElem( 'br' ), submit, ' or ', reset
	) ) ) );
	addElemAfter(rfc_area, node);
	rfc_control.addEventListener('click', rfcToggle, false);
	reset.addEventListener('click', rfcHide, false);
	submit.addEventListener('click', rfcHide, false);
	name_input.addEventListener('blur', nameBlur, false);
	email_input.addEventListener('blur', emailBlur, false);
	return rfc_area;
}

function add_instructions(explicit_node) {
	var node = isElementNode(explicit_node) ? explicit_node : this;
	var instructions = newElem('p', ['class', "rfc"],
		"Please click on a",
		newElem('em', ['class', "rfc", 'title', "Not this one, silly!"], " +"),
		" sign to comment on a particular section of this document.",
		newElem( 'br' ),
		newElem('em', [], "Commenting seems not to work with some versions of Internet Explorer. "),
		newElem( 'br' ),
		newElem('em', [], "Please use Firefox or Chrome if you encounter this problem.  "),
	);
	addElemAfter(instructions, node);
}

// jQuery not yet pulling its weight !!
$(document).ready(function(){
   $('h1').each(add_instructions);
   $('h2,h3,h4').each(add_rfc);
 });
