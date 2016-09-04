$(document).ready( function () {
    
    $('#random-button').click( function () {
        //pick 2 random ids from the database
        //which will be of the form: //todo
        //and compare them.
    });

    //using this to see if jquery.serialize()
    //is useful/good enough for our purposes..
    $('form').on( 'submit', function( event ) {
        event.preventDefault();
        console.log( $( this ).serialize() );
    });
    
    $('#search-button').click( function () {
        // $.ajax({
        //     url: 'some-url',
        //     type: 'post',
        //     dataType: 'json',
        //     data: $('form#myForm').serialize(),
        //     success: function(data) {
        //         //modify the DOM
        //     }
        // });
    });

});
