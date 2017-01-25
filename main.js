$(document).ready( function () {
    
    $('#random-button').click( function () {
        //make the same ajax request as the form submit, but
        //use some name that indicates we want a random result.   
        
        // $.ajax({
        //     url: 'some-url',
        //     type: 'get',
        //     dataType: 'json',
        //     data: /*TODO*/,
        //     success: function(data) {
        //         //modify the DOM
        //     }
        // });
    });

    //using this to see if jquery.serialize()
    //is useful/good enough for our purposes..
    //looks like it is!
    $('form').on( 'submit', function (event) {
        event.preventDefault();
        
        //make sure the form is not empty.
        //if it is, utilize bootstrap form error states.
        $(':text').each( function () {
            if($(this).val() === '') {
                //if we don't already have an error message, set the
                //error state and add the help text
                if(!$(this).parent().hasClass('has-error')) {
                    
                    $(this).parent().addClass('has-error');
                    $(this).parent().before(
                        '<p class="text-danger">\
                        Whoops! Enter a location.</p>'
                    );
                }
            }
            else {
               $(this).parent().removeClass('has-error');
               $(this).parent().prev('p.text-danger').remove();
            }
        });

        console.log('captured form submit!');
        console.log( $(this).serialize() );

        $.ajax({
            url: 'some-url',
            type: 'get',
            dataType: 'json',
            data: $(this).serialize(),
            success: function(data) {
                //modify the DOM
                const response = JSON.parse(data);
                console.log('got response!');
                console.log(response);
            }
        });

    });

});
