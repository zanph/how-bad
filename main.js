$(document).ready( function () {
    
    $('#random-button').click( function () {
        //pick 2 random ids from the database
        //which will be of the form: //todo
        //and compare them.
    });

    //using this to see if jquery.serialize()
    //is useful/good enough for our purposes..
    //looks like it is!
    $('form').on( 'submit', function( event ) {
        event.preventDefault();
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
