/**
 * Created by igor on 12.07.16.
 */
"use strict";
{
	$('#save').forceClick(() => {

		let $form = $('#CreateEdit');

		if ($form[0].checkValidity()) {
			$.put({
				data : $form.serialize(),
				success : r => {
					$.message.ok('It saved', () => {
						location.href="/index";
					});
				}
			});
		} else
			(typeof $form[0].reportValidity === 'function')
				? $form[0].reportValidity()
				: $.message.cancel('Data not correct');

	});
}
