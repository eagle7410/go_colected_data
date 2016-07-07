
(function ($) {
	/**
	 * Вешаем обработчик на отправку формы через ajax
	 * @param  {Object} options
	 * @example
	 * $('#form-ajax').ajaxFormSender ({
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
		var $total = $this.parent('table').find('tfoot');
		var usePagination = false;
		var usePages = false;
		options = $.extend({
			target: $this.data('target') || '',
			itemTpl: 'item',
			data: {},
			method: 'GET',
			timeout: 15000,
			success   : (function () {}),
			error   : (ResFailed),
			after: (function () {})
		}, options);

		if (!options.url && options.target) {
			options.url =  (window.baseUrl ? window.baseUrl + '/' : '') + options.target;
		}

		if (options.pagination) {

			if (options.pagination.selector) {

				var $pagination = $(options.pagination.selector);

				if ($pagination.length) {

					usePagination = true;
					var skip = $pagination.attr('skip') ? $pagination.attr('skip') : options.pagination.skip ? options.pagination.skip : 0;
					var limit;
					$pagination.attr('loading', 'true').html('<i class="fa fa-refresh fa-spin"></i>');

					if (options.pagination.pages) {
						$pagination.attr('pages', 'true');
						var btnSee = options.pagination.btnCount ? options.pagination.btnCount : 3 ;
						limit = options.pagination.pages;
						usePages = true;
					} else {
						options.data.skip = skip;
						limit = options.pagination.limit ? options.pagination.limit : 25;
					}

					options.data.limit = limit;
				} else {
					console.log('[listLoad][pagination]Not found element by selector');
				}

			} else {
				console.log('[listLoad][pagination]Not found selector');
			}
		}

		if (options.total) {
			$total.html('');
		}

		$.ajax({
			url     : options.url,
			type    : options.method,
			data    : options.data,
			timeout : options.timeout,
			success : function (result) {
				if (usePagination) $pagination.text('');

				if (Array.isArray(result.data) && result.data.length) {
					if (usePagination) {
						var count = result.countPagination;

						if (usePages) {
							if (count > limit) {
								var countPages = ~~(count / limit);
								var activePage = options.data.skip ? options.data.skip / limit + 1 : 1;
								var ul = '<ul class="pagination">';
								countPages += count % limit > 0 ? 1 : 0;
								var i;
								var liAdd = function (n) {
									var cl = n === activePage ? 'active' : '';
									ul += '<li class="' + cl + '"><a href="" page="' + n + '" class="page" >' + n + '</a></li>';
								};

								if (countPages > btnSee) {
									var start = activePage - 1;
									start = start ? start : 1;

									var end = start + btnSee;
									var top = countPages - 1;
									var more = false;

									if (end > top) {
										end = top;
										more = true;
									}

									if (start > 1 ) {
										liAdd(1);
									}

									if (start > 2 ) {
										liAdd('...');
									}

									for (i = start > top - btnSee + 2 ? top - btnSee + 2 : start ; i < end; ++i) {
										liAdd(i);
									}

									if (end < countPages) {

										if (top <= end) {
											if (more) {
												liAdd(top);
											} else {
												liAdd('...');
											}

										} else if (top > end) {
											liAdd('...');
										}

										liAdd(countPages);
									} else if (end === countPages) {
										liAdd(end);
									}

								} else {
									for (i = 1; i <= countPages; ++i) {
										liAdd(i);
									}
								}

								ul += '</ul>';
								$pagination.html(ul);
								$('.page').forceClick(function () {
									var page = parseInt($(this).attr('page'));

									if (!isNaN(page)) {
										--page;
										options.data.skip = page > 0 ? page * limit : 0;
										$this.listLoad(options);
									}

								});

							}
							$this.tpl(options.itemTpl, result.data);
						} else {
							$this.tplAppend(options.itemTpl, result.data);
							var curSkip = parseInt(skip) + parseInt(limit);
							skip = curSkip >= count ? count : curSkip;
							var getCount = (count - skip) > limit ? limit : (count - skip);

							if (getCount) {
								$pagination.attr({
									count   : count,
									skip    : skip,
									loading : false
								}).text('Еще ' + getCount + ' (' + skip + '/' + count + ')').forceClick(function () {
									$this.listLoad(options);
								});
							} else {
								$pagination.hide();
							}
						}
					} else {
						$this.tpl(options.itemTpl, result.data);
					}

				} else {
					if (options.noitemsTpl) {
						$this.tpl(options.noitemsTpl);
					} else {
						$this.tpl(options.itemTpl, []);
					}
				}

				if (options.total && options.total.tpl) {
					var max = function (d, t) {
						d = d || 0;
						t = t || 0;
						return (d > t) ? d : t;
					};

					var sum = function (d, t) {
						return Number((t || 0).toFixed(2)) + Number((d || 0).toFixed(2));
					};

					var total = {};
					result.data.forEach(function (it) {
						options.total.fields.forEach(function (field) {
							var props = field.name.split('.');
							var d = it;
							props.forEach(function (p) {
								d = d[p];
							});
							var method = (field.method && field.method === 'max') ? field.method :	'sum';
							total[field.name.replace('.', '_')] =
								eval(method + '(' + d + ', ' + total[field.name.replace('.', '_')] + ')');
						});
					});

					$total.tpl(options.total.tpl, total);
				}

				if (typeof options.success === 'function') {
					options.success(result);
				}

				options.after(result);
			},
			error: function (result) {
				if (usePagination) $pagination.text('');

				if (options.total) {
					$total.html('');
				}

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

})(jQuery);
