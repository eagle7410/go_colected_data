/* global doT, $ */
/* exported tplRet */
function tplGet(tplId) {
	return $('#tpl_' + tplId).html().replace(/\{\&/g, '{{').replace(/\&\}/g, '}}');
}
$.fn.tpl = function (tplId, data) {
	var tpl = doT.template(tplGet(tplId));

	if (!$.isArray(data)) {
		data = [data];
	}

	return this.each(function () {
		var html = '';

		for (var itemIdx = 0; itemIdx < data.length; itemIdx++) {
			html += tpl(data[itemIdx]);
		}

		$(this).html(html);
	});
};

$.fn.tplReplace = function (tplId, data) {
	var tpl = doT.template(tplGet(tplId));

	if (!$.isArray(data)) {
		data = [data];
	}

	return this.each(function () {
		var html = '';

		for (var itemIdx = 0; itemIdx < data.length; itemIdx++) {
			html += tpl(data[itemIdx]);
		}

		$(this).replaceWith(html);
	});
};

$.fn.tplAppend = function (tplId, data) {
	var tpl = doT.template(tplGet(tplId));

	if (!$.isArray(data)) {
		data = [data];
	}

	return this.each(function () {
		var html = '';

		for (var itemIdx = 0; itemIdx < data.length; itemIdx++) {
			html += tpl(data[itemIdx]);
		}

		$(this).append(html);
	});
};

$.fn.tplPrepend = function (tplId, data) {
	var tpl = doT.template(tplGet(tplId));

	if (!$.isArray(data)) {
		data = [data];
	}

	return this.each(function () {
		var html = '';

		for (var itemIdx = 0; itemIdx < data.length; itemIdx++) {
			html += tpl(data[itemIdx]);
		}

		$(this).prepend(html);
	});
};

$.fn.tplBefore = function (tplId, data) {
	var tpl = doT.template(tplGet(tplId));

	if (!$.isArray(data)) {
		data = [data];
	}

	return this.each(function () {
		var html = '';

		for (var itemIdx = 0; itemIdx < data.length; itemIdx++) {
			html += tpl(data[itemIdx]);
		}

		$(this).before(html);
	});
};

$.fn.tplAfter = function (tplId, data) {
	var tpl = doT.template(tplGet(tplId));

	if (!$.isArray(data)) {
		data = [data];
	}

	return this.each(function () {
		var html = '';

		for (var itemIdx = 0; itemIdx < data.length; itemIdx++) {
			html += tpl(data[itemIdx]);
		}

		$(this).after(html);
	});
};

function tplRet (tplId, data) {
	var tpl = doT.template(tplGet(tplId));

	if (!$.isArray(data)) {
		data = [data];
	}

	var html = '';

	for (var itemIdx = 0; itemIdx < data.length; itemIdx++) {
		html += tpl(data[itemIdx]);
	}

	return html;
}
