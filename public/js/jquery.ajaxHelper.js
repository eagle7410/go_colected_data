
(function ($) {
	$.message = {
		ok : function (m) {
			swal("OK ", m, "success");
		},
		ajaxWarn : function (m) {
			swal("Error ", m, "error");
		}
	};

	/**
	 * Вешаем обработчик на отправку формы через ajax
	 * @param  {Object} options
	 * @example
	 * $('#form-ajax').ajaxFomessagermSender ({
	 * 		url:          'http://...',             // адрес отправки (по умолчанию берется из формы или из options.action)
	 * 		method:       'POST',                   // метод отправки (по умолчанию берется из формы или 'POST')
	 * 		timeout:      15000,                    // 15 sec.
	 * 		onBeforeSend: function () {....},       // выполнить что-то перед отправкой проверкой
	 * 		check:        function () {....},       // колбек проверки (return true/false - успешность проверки)
	 * 		success:      function (result) {....}, // колбек на успешное выполнение (return true - закрыть окно)
	 * 		error:        function (result) {....}  // колбек на ошибку в ответе сервера
	 * });
	 */

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

	$.fn.ajaxFormSender = function (options) {
		options = options || {};

		// Обработчик
		$('body').off('submit', this.selector);
		$('body').on('submit', this.selector, function (event) {
			event = event || window.event;
			event.preventDefault();

			var $this = $(event.target);
			var action = options.action || $this.attr('action') || '';
			var settings = $.extend({
				url         : ((window.baseUrl && action.indexOf('/') === -1) ? (window.baseUrl + '/') : '') + action,
				method      : $this.attr('method') || 'POST',
				timeout     : 15000,
				json        : false,
				onBeforeSend: (function () {}),
				check       : (function () {return true;}),
				success     : (function (result) {
					$.message.ok(result.message);
					return true;
				}),
				error       : (ResFailed),
				after       : (function () {})
			}, options);

			var obj = {};

			$this.serializeArray().forEach(function (el) {
				if (typeof obj[el.name] === 'undefined' && el.name.indexOf('[]') === -1) {
					obj[el.name] = el.value;
				} else {
					var name = el.name.replace('[]', '');

					if (typeof obj[name] === 'undefined') {
						obj[name] = [];
					} else if (!Array.isArray(obj[name])) {
						obj[name] = [obj[name]];
					}

					obj[name].push(el.value);
				}
			});

			settings.onBeforeSend(obj, $this, settings);

			var data = $.param(obj).replace(/%5B%5D=/g, '=');

			settings.ok = function () {
				$.ajax({
					url    : settings.url,
					type   : settings.method,
					data   : settings.json ? {data: JSON.stringify(obj)} : data,
					timeout: settings.timeout,
					success: function (result) {
						if (settings.success(result) && $.wbox) {
							$.wbox.close();
						}

						settings.after(result);
					},
					error: function (result) {
						settings.error(result);
						settings.after(result);
					}
				});
			};

			if (settings.check(obj, $this, settings)) {
				settings.ok();
			}

			return false;
		});
	};

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

	/**
	 * Вешаем обработчик на кнопки действий в таблице
	 * (INFO: Вместо объекта опций можно передать ф-ю, отдающую этот объект)
	 *
	 * @param  {Object/Function} options
	 * @example
	 * $('table .status, table .remove, table .trash').ajaxActionSender ({
	 * 		url:     'http://...',              // адрес отправки (options.url или window.baseUrl + '/' + options.target)
	 * 		method:  'POST',                    // метод отправки (по умолчанию 'GET')
	 * 		action:  'edit',                    // ajax-действие  (по умолчанию берется из data-action)
	 * 		timeout: 15000,                      // 15 sec.
	 * 		check:   function () {....},        // колбек проверки (return true/false - успешность проверки)
	 * 		success: function (result) {....},  // колбек на успешное выполнение (return true - закрыть окно)
	 * 		error:   function (result) {....}   // колбек на ошибку в ответе сервера
	 * });
	 */
	$.fn.ajaxActionSender = function (options) {

		// Обработчик
		$(this.selector).forceClick(function (event) {
			var opt = {};

			if (typeof options === 'function') {
				opt = options.call(this, event);
			} else {
				opt = typeof options === 'object' ? options : {};
			}

			var $this = $(event.target);
			var settings = $.extend({
				action: $this.data('action') || 'edit',
				data: {},
				dataKeys: [],
				dataId: 'id',
				id: null,
				method: 'GET',
				remove: false,
				timeout: 15000,
				url: opt.target ? ((window.baseUrl ? window.baseUrl + '/' : '') + opt.target) : '',
				check: (function () {return true;}),
				success: (function (result) {$.message.ok(result.message);}),
				error: (ResFailed),
				after: (function () {})
			}, opt);

			var sel = settings.selector ? $this.closest(settings.selector) : (
				settings.findSelector ? $this.find(settings.findSelector) : (
					settings.thisSelector ? $this : $this.closest('tr')
				)
			);
			var id = settings.id || sel.data(settings.dataId);

			settings.dataKeys.forEach(function (el) {
				if (sel.data(el)) {
					settings.data[el] = sel.data(el);
				}
			});
			var data = $.extend({action: settings.action, id: id}, settings.data);
			settings.ok = function () {
				$.ajax({
					url     : settings.url,
					type    : settings.method,
					data    : data,
					timeout : settings.timeout,
					success : function (result) {
						if (settings.success(result, $this, settings) || settings.remove) {
							$this.closest('tr').hide().remove();
						}

						settings.after(result, $this);
					},
					error: function (result) {
						settings.error(result, $this, settings);
						settings.after(result);
					}
				});
			};

			if (settings.url && settings.check(data, $this, settings)) {
				settings.ok();
			}
		});
	};

})(jQuery);
