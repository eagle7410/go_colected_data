/**
 * Created by igor on 12.07.16.
 */
$(function (){
	$('#save').forceClick(function () {

		var $form = $('#CreateEdit');

		if ($form[0].checkValidity()) {
			$.put({
				data : $form.serialize(),
				success : function () {
					$.message.ok('It saved', function() {
						location.href="/index";
					});
				}
			});
		} else {
			if (typeof $form[0].reportValidity === 'function') {
				$form[0].reportValidity()
			} else {
				$.message.cancel('Data not correct');
			}

		}

	});
});
