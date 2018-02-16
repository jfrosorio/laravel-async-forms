/*
 *	JQuery Custom Inputs Plugin
 *	Developed by 4por4
 *	Author: José Osório
 *
 * @TODO - add files support
 */
(function($)
{
	$.fn.asyncForms = function(options){
		var opts = $.extend({}, $.fn.asyncForms.defaults, options);

        // ajax request
        var submit = function(event, displayer){
            // disable form submission
            event.preventDefault();

            var html = '';

            var $form = $(event.target),
				$displayer = $(displayer);

            var form_data = new FormData(),
                form_serialize = $form.serializeArray();

            $.each(form_serialize, function(key, input){
                form_data.append(input.name, input.value);
            });

            $form.find('[type="file"]').each(function(){
                var $input = $(this),
                    files = $input.get(0).files;

                for(var f = 0; f < files.length; f++)
                {
                    form_data.append($input.attr('name'), files[f]);
                }
            });

            console.log(form_data.getAll('document'));

            $.ajax({
                url: $form.attr('action'),
                type: "post",
                data: form_data,
                dataType: 'json',
                cache: false,
                contentType: false,
                processData: false,
                success: function(data)
                {
                    if(typeof data.success_msg != 'undefined')
                    {
                        html += '<div class="alert alert-success">' + data.success_msg + '</div>';
                    }

                    $displayer.html(html);

                    // reset form inputs
                    if(opts.reset){
                        $form.get(0).reset();
                    }
                },
                error: function(data)
                {
                    if(data.status == 403)
                    {
                        html += '<div class="alert alert-danger">';
                        html += opts.messages.forbidden;
                        html += '</div>';
                    }
                    else if(typeof data.responseJSON.length)
                    {
                        html += '<div class="alert alert-danger">';
                        html += '<ul>';
                        for(key in data.responseJSON)
                        {
                            html += '<li>' + data.responseJSON[key] + '</li>';
                        }
                        html += '</ul>';
                        html += '</div>';
                    }

                    $displayer.html(html);
                }
            })
            .always(function(){
                $('html, body').animate({
                    scrollTop: $displayer.offset().top - 40
                });

                if(typeof opts.callback == "function")
                {
                    opts.callback.call(this);
                }
            });
        }

		return this.each(function(){
            var $form = $(this),
				$displayer;

			if(opts.displayer === null)
			{
				$form.prepend('<div class="result-displayer"></div>');
				$displayer = $form.find('.result-displayer');
			}
			else{
				$displayer = $(opts.displayer);
			}

			$form.on('submit', function(event){
                submit(event, $displayer);
            });
		});
	};

	$.fn.asyncForms.defaults = {
		displayer: null,
        callback: null,
		reset: true,
        messages: {
            forbidden: 'Não possui permissões para submeter este formulário.',
        },
	};
}( jQuery ));
