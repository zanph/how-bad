$(document).ready( function () {
    
    $('#random-button').click( function () {
        //pick 2 random ids from the database
        //which will be of the form: //todo
        //and compare them.
    });

    //using this to see if jquery.serialize()
    //is useful/good enough for our purposes..
    //looks like it is!
    $('form').on( 'submit', function (event) {
        event.preventDefault();
        
        //make sure the form is not empty.
        //if it is, utilize bootstrap form error states.
        $(':text').each( function () {
            if($(this).val() === "") {
                formIsEmpty = true;
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

        
        // $.ajax({
        //     url: 'some-url',
        //     type: 'get',
        //     dataType: 'json',
        //     data: $(this).serialize(),
        //     success: function(data) {
        //         //modify the DOM
        //     }
        // });
    });

});
