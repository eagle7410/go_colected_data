(function ($) {
	noop = function (){};
	$.message = {
		ok : function (m, aft) {
			swal({ title: "OK", text: m, type: "success" }, aft || noop);
		},
		ajaxWarn : function (m) {
			swal("Error ", m, "error");
		},
		cancel : function(m) {
			swal("Cancelled ", m, "error");
		}
	};

	window.ResFailed = function (r) {
		var m = r && r.responseText ? r.responseText : null;
		try {
			m = JSON.parse(m);
			if (m.message) {
				m = m.message;
			}

			$.message.ajaxWarn(m || 'Ошибка');
		} catch (e) {
			$.message.ajaxWarn(r.statusText || 'Ошибка');
		}
	}

	/**
	 * "Умный" обработчик для линков
	 *
	 * @param  {Function} func
	 */
	$.fn.forceClick = function (func) {
		if (typeof func !== 'function') {
			throw new Error('Не указана функция - обработчик');
		}

		$('body').off('click', this.selector);
		$('body').on('click', this.selector, function (event) {
			event = event || window.event;
			event.preventDefault();
			func.call(this, event);
			return false;
		});
		return this;
	};

	/**
	 * "Умный" обработчик для указанных событий
	 *
	 * @param  {Function} func
	 */
	$.fn.forceEvent = function (event, func) {
		if (typeof func !== 'function') {
			throw new Error('Не указана функция - обработчик');
		}

		if (typeof event !== 'string' || !event.length) {
			throw new Error('Не указано событие или событие не строка');
		}

		$('body').off(event, this.selector).on(event, this.selector, function (e) {
			e = e || window.event;
			e.preventDefault();
			func.call(this, e);
			return false;
		});

	};

	/**
	 * Простейшая загрузка элементов таблицы или списка (with doT.js)
	 *
	 * @param  {Object} options
	 *
	 * @example
	 * $('table>body').listLoad ({
	 * 		url:     'http://...',              // адрес отправки (options.url или window.baseUrl + '/' + options.target)
	 * 		// или :
	 * 		target:  'edit',                    // ajax-контроллер (для кабмина)
	 * 		itemTpl: 'item',                    // шаблон doT.js
	 * 		noitemsTpl: 'noitems',              // шаблон doT.js
	 * 		timeout: 15000,                      // 15 sec.
	 * 		success: function (result) {....},  // колбек на успешное выполнение (return true - закрыть окно)
	 * 		error:   function (result) {....}   // колбек на ошибку в ответе сервера
	 * });
	 *
	 */
	$.fn.listLoad = function (options) {
		var $this = $(this.selector);

		options = $.extend({
			target: $this.data('target') || '',
			itemTpl: 'item',
			data: {},
			method: 'POST',
			timeout: 15000,
			success   : (function () {}),
			error   : (ResFailed),
			after: (function () {})
		}, options);

		if (!options.url && options.target) {
			options.url =  (window.baseUrl ? window.baseUrl + '/' : '') + options.target;
		}

		$.ajax({
			url     : options.url,
			type    : options.method,
			data    : options.data,
			timeout : options.timeout,
			success : function (result) {
				var a = [];

				if ($.isPlainObject(result)) {
					var keys = Object.keys(result);

					for (var i = 0, len = keys.length; i<len; ++i) {
						var dt = result[keys[i]];

						if ($.isPlainObject(dt)) {

							if (!dt.key) {
								dt.key = keys[i];
							}

						}

						a.push(dt);

					}

					result.data = a;

				}

				if (Array.isArray(result.data) && result.data.length) {

					$this.tpl(options.itemTpl, result.data);

				} else {
					if (options.noitemsTpl) {
						$this.tpl(options.noitemsTpl);
					} else {
						$this.tpl(options.itemTpl, []);
					}
				}

				if (typeof options.success === 'function') {
					options.success(result);
				}

				options.after(result);
			},
			error: function (result) {
				if (usePagination) $pagination.text('');

				if (options.noitemsTpl) {
					$this.tpl(options.noitemsTpl);
				}

				if (typeof options.error === 'function') {
					options.error(result);
				}

				options.after(result);
			}
		});
	};

	$.send = function (ops, method) {
		ops = $.extend({
			target: location.pathname,
			data: {},
			timeout: 15000,
			success   : (function () {}),
			error   : (ResFailed),
			before : (function () { return true}),
			after: (function () {})
		}, ops);

		if (!ops.url && ops.target) {
			ops.url =  (window.baseUrl ? window.baseUrl + '/' : '') + ops.target;
		}

		if (!ops.before(ops)){
			return;
		}

		$.ajax({
			url     : ops.url,
			type    : method,
			data    : ops.data,
			timeout : ops.timeout,
			success : function (r) {
				ops.success(r);
				ops.after();
			},
			error : function(r) {
				ops.error(r);
				ops.after()
			}
		});
	};

	$.delete = function (ops) {
		$.send(ops, 'DELETE');
	};

	$.put = function (ops) {
		$.send(ops, 'PUT');
	};
})(jQuery);
