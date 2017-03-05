"use strict";
{
	let $file = $('#file');

	$file.forceEvent('change', ev => {
		$('#label').val($file[0].files.length ? ($file[0].files[0].name || 'NO NAME' ) : '');
	});
}
