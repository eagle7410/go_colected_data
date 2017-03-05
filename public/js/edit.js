/**
 * Created by igor on 12.07.16.
 */
"use strict";
{
	$('#save').forceClick(() => {

		var $form = $('#CreateEdit');

		if ($form[0].checkValidity()) {
			$.post(location.href, $form.serialize()).fail(ResFailed).done(() => {
				$.message.ok('Change saved', () => {
					location.href = '/index';
				})
			})
		} else {
			if (typeof $form[0].reportValidity === 'function') {
				$form[0].reportValidity()
			} else {
				$.message.cancel('Data not correct');
			}

		}

	});
}
