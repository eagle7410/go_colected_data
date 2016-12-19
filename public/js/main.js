$(function (){
	$(".actions .btn-danger").forceClick(function (ev){
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
			closeOnCancel: false
		}, function(isConfirm) {
			if (isConfirm) {
				$.delete({
					target : 'index/' + ID,
					success: function (r) {
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
			} else {
				$.message.cancel("Your imaginary file is safe :)");
			}
		});
	});


	$('.table tbody').listLoad();

	function ChangeShowRow($name, isHide)
	{
		isHide = isHide || false;

		var $tr = $name.closest('tr');
		var $othen = $('#' + $tr.data('id') + 'Othen');

		if (isHide)
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
	}
	$('#search').change(function() {
		var $el = $(this);
		var t = $el.val();
		var $arS = $('.names');

		$arS.each(function(){
			var $s =$(this);
			var st =$s.text();

			if (t == '') {
				ChangeShowRow($s);
				return;
			}

			if (~st.indexOf(t)){
				ChangeShowRow($s);
				return;
			}

			ChangeShowRow($s, true);
		})
	});
});
