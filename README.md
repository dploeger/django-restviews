# django-restviews

REST-based Django CrUD-Views

## Prerequisites

Restviews is based on the following libraries:

* Django
* Bootstrap 3
* jQuery
* knockoutJS

### Creating grids

#### Setting up columns

Restviews tries to get information about columns using an OPTIONS call to
your API.

However, this is only possible for logged in users and not very specific.
It's better to specify the columns in your template call to restviews_grid
with the "columns"-parameter.

The columns-parameter expects a string containing column definitions,
separated by a comma (",").

One column definition is three parameters separated by a colon (":"). These
three parameters are:

* field id from your model
* Label to display (will be translated by Restviews)
* Column type
* a "1" if this field is required

The following column types are supported. They have a fitting presentation for
the user and are validated.

* string - A one line string (a type="text" when thinking in HTML-input-fields)
* text - A multi line string
* number - A numeric value
* float - A floating value
* password - A password
* datetime - A point in time (presented with a calendar selection)
* email - An Email
* url - An URL
* color - A HTML color

