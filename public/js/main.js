"use strict";
{
	$(".actions .btn-danger").forceClick(ev => {
		var $this = $(ev.target);
		var $tr = $this.closest('tr');
		var ID = $tr.data('id');

		swal({
			title: "Are you sure?",
			text: "You will not be able to recover this imaginary file!",
			type: "warning",
			showCancelButton: true,
			confirmButtonClass: "btn-danger",
			confirmButtonText: "Yes, delete it!",
			cancelButtonText: "No, cancel plx!",
			closeOnConfirm: false,
			closeOnCancel: true
		}, isConfirm => {
			if (isConfirm) {
				$.delete({
					target : 'index/' + ID,
					success: () => {
						var $other = $("#" + ID + 'Othen');

						if ($other.length) {
							$other.next().remove();
							$other.remove();
						}

						$tr.prev().remove();
						$tr.remove();

						$.message.ok("Your imaginary file has been deleted.");
					}
				})
			} else
				$.message.cancel("Your imaginary file is safe :)");
		});
	});


	$('.table tbody').listLoad();

	let ChangeShowRow = ($tr, $othen, isHide) => {

		if (isHide || false)
		{
			$tr.hide();
			$tr.prev().hide();

			if (!$othen.length)
				return;

			$othen.hide();
			$othen.next().hide();
		} else {
			$tr.show();
			$tr.prev().show();

			if (!$othen.length)
				return;

			$othen.show();
			$othen.next().show();
		}
	};

	$('#search').keyup(ev => {
		let t = $(ev.target).val().toLowerCase();

		$('.names').each((i,that) => {
			let $title = $(that);
			let $login = $title.next();
			let $tr = $title.closest('tr');
			let $othen = $('#' + $tr.data('id') + 'Othen');
			let search = [$othen.text(), $title.text(), $login.text()].join(' ');

			ChangeShowRow($tr, $othen, !((t == '') || (~search.toLowerCase().indexOf(t))));
		});
	});
}
