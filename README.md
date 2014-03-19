# django-restviews

REST-based Django CrUD-Views

## Introduction

Django is a great framework for efficient, rapid,
maintainable and scalable web applications. With the addition of REST
frameworks like the [Django REST Framework][drf], an API-based approach to
web development is also possible.

This Django application fills one specific gap. If you have an API-based
approach to your development you don't want to build a separate web UI,
that is based on the Django view/template/model-framework and doesn't adhere
to your own API-standards.

You want a UI, that specifically uses the API for data retrieval and
manipulation. Having the API and not the web UI as a first class citizen is a
primary goal of an API-based approach.

The problem is, that you loose a whole bunch of speed if you have to leave
Django's wonderful generic class based views behind and recreate the same
functionality the AJAX/API-way.

Django-Restviews helps you by offering a complete CrUD-framework (Create,
Update, Delete) and a data grid that all use the API for data retrieval and
manipulation and in that way offers an alternative for Django's own class
based generic views.

## Features

* Multiple datagrids per page
* Complete CrUD (Create, Update, Delete) functionality for each datagrid
* Input validation
* Specific widgets per data type
* [pagination][pagination]
* [searching][searching]
* [ordering][ordering]

## Prerequisites

Restviews is based on the following libraries:

* [Django][django]
* [jQuery][jquery]
* [jQuery Hotkeys][hotkeys]
* [Knockout][knockout]
* [Moment.js][moment]

The default user interface implementation uses

* [Bootstrap 3][bootstrap3]
* [Bootstrap Datetimepicker][bootstrap-datetimepicker]

## Browser Support

The following browsers are officially supported:

* IE 9+
* Chrome 17+
* Firefox 5+
* Opera 12+
* Safari 6+

## Backend Support

Restviews was created with the [Django REST Framework][drf] in mind. However,
as the DRF only supplies Django with a valid REST framework,
Restviews should also be compatible with other frameworks supporting these
types of URL:

* GET <Endpoint>/ - Retrieve a list of items
* POST <Endpoint>/ - Create a new item. The data is supplied in JSON notation
* DELETE <Endpoint>/<Item-ID>/ - Delete the item with the id <Item-ID>. The
ID-field can be configured and defaults to "id"
* PUT <Endpoint>/<Item-ID>/ - Update the data of item <Item-ID>. The data is
supplied in JSON notation

Additional features require this:

* OPTIONS <Endpoint>/ - Automatic field lookup (not recommended anyway)
* GET <Endpoint>/?search=*s - Only retrieve items, that match "*s" (the
keyword "search" is configurable)
* GET <Endpoint>?order=(-)*s - Return items sorted by "*s",
optionally with a prefixed "-" to reverse sort order

## Using restviews

To begin using restviews, add the restviews app to your django project by
adding "restviews" to the INSTALLED_APPS-settings.

If you want to use restviews, you have to add the template tag {{
restviews_head }} into your base template's <head>-area and {{
restviews_body }} into the <body>-part (it's recommended to place it directly
 after the starting <body>-tag).

## Creating grids

Restviews offers its CrUD-functionality using a so called "datagrid". The
basic functionality is displaying a bunch of data in a tabular form. If you
allow it, the user can also delete and edit rows and add new data.

To add a grid to a part of your page, use the template tag {{ restviews_grid
}} with some of these parameters:

* Positional parameters (mandatory):
  * grid (mandatory) - the name of the grid (has to be unique within one page)
  * url (mandatory) - base URL to the API endpoint for the datagrid's model

* Keyword parameters (optional):
  * fields (recommended) [empty, try automatic load] - field setup
  * fieldsView [=fields] - specific fields for data display
  * fieldsCreate [=fields] - specific fields for data creation
  * fieldsUpdate [=fields] - specific fields for data update
  * hideFields [empty] - hide specific fields
  * hideFieldsView [=hideFields] - specific hidden fields for data display
  * hideFieldsCreate [=hideFields] - specific hidden fields for data creation
  * hideFieldsUpdate [=hideFields] - specific hidden fields for data update
  * canCreate ["true"] - enable create-feature?
  * canUpdate ["true"] - enable update-feature?
  * canDelete ["true"] - enable delete-feature?
  * canView ["true"] - enable view-feature? (should be "true" all the time)
  * actions [empty] - additional row-level-actions
  * globalActions [empty] - additional global-level-actions
  * paginationEnabled ["false"] - enable pagination feature?
  * itemsPerPage ["10"] - how many rows should be displayed per page
  * searchingEnabled ["false"] - enable search feature?
  * orderingEnabled ["false"] - enable sort feature?
  * orderingField [empty] - start sort field
  * orderingAsc ["true"] - start sort ascending?

* Very specific keyword parameters (handle with care)
  * itemId ["id"] - name of the field, that holds one item's ID
  * paginateByParam ["page_size"] - name of GET parameter to supply the page
    size
  * pageParam ["page"] - name of the GET parameter to supply the current page
  * maxPageRange ["5"] - how many pages should be directly accessible?
  * searchParam ["search"] - name of the GET parameter to supply the search
    text
  * minSearch ["3"] - how many characters have to be typed in before search
    is started?
  * orderingParam ["ordering"] - name of GET parameter to supply order field
    name

### Setting up fields

When starting to develop restviews, the idea was to get information about
datagrid fields dynamically using an OPTIONS call to the API. This, however,
turned out to be quite instable and unreliable and is not recommended anymore.

It's better to specify the columns in your template call to restviews_grid
with the "fields"-parameter.

The fields-parameter expects a string containing field definitions,
separated by a comma (",").

One field definition is parameters separated by a colon (":"). These
three parameters are:

* field name
* Label to display (will be translated by Restviews)
* Column type
* "1" - field is required [defaults to 0]
* default value

The following field types are supported. They have a fitting presentation for
the user and are validated.

* string - A one line string (a type="text" when thinking in HTML-input-fields)
* text - A multi line string
* number - A numeric value
* float - A floating value
* password - A password
* date - A date
* time - A time
* datetime - A combination of date and time
* email - An Email
* url - An URL
* color - A HTML color

### Specifying different fields for create/update

If you only supply the "fields"-parameter, the datagrid and the "create" and
"update"-views contain the same parameter.

However, you can overwrite the "fields"-parameter using "fieldsCreate" or
"fieldsUpdate" to specify different fields for either view.

### Hiding fields

You can (and most probably have to) hide fields, although they are specified
in the "fields"-parameter. If you do this, the fields are nonetheless used in
 the UI, but are implemented as hidden input fields. To do this,
 supply a "hideFields" parameter consisting of comma-separated (",
 ") field names.

The common use of this is the "id"-field. This has to be included into the
"fields"-parameter, because the "update"-view wouldn't operate if you don't.
But the id is typically not displayed for the user, so it would be inside the
 "hideFields"-parameter.

Like the "fields" parameter, the "hideFields"-parameter can also be
overwritten with the "hideFieldsCreate" and "hideFieldsUpdate" respectively.

### Adding more action

The basic functionality of restviews would enable a "delete" and
"update"-action for each row of the datagrid and a global "create"-action.

If you want to add your own actions, you can do this using the
"actions"-parameter and a call to the rv.registerAction-method using
javascript.

Your action consists of a javascript function, that is called with
certain parameters. Before a action can be triggered,
you have to call the function "rv.registerAction" with a name for the action,
 the javascript function and an array of arguments.

Inside the argument, these special strings are handled:

* \_item - a Javascript object with the object data of the selected row
* \_grid - the name of the grid of the selected row

Afterwards, you supply the "action"-parameter inside the {{ restviews_grid
}}-template tag. This parameter consists of comma-separated (",
")-values that each contain multiple parameters separated by a colon (":"):

* the name of the action (as specified in the call to rv.registerAction)
* a label for the button
* (optional) additional css classes to add to the button

If you'd like to add a global (i.e. not row-specific) action,
use the "globalActions"-parameter. Global actions don't have access to the
special "_item"-argument obviously.

### UI implementation

Restviews currently implements [Bootstrap3][bootstrap3] for the UI. If you
don't like Bootstrap or implement another user interface,
you can still use restviews.

To implement another UI, you'll have to supply some things. Please take a
look at the bootstrap3-implementation for the structure of it and more
information.

#### HTML

The HTML-part of the ui resides in restviews/templates/restviews/<name of
ui>/template.html. The bootstrap3-implementation uses that as a starting
point for the template and includes further specific files inside the same
directory.

#### Javascript

Restviews calls some javascript methods during its workflow. These calls are
inside a rv.ui-object. The specific javascript file should reside in
restviews/static/restviews/js/ui/<name of ui>.js and should implement these
functions:

* convertDateTime (methodTag, fieldType, grid, field): Convert the current
  value of a date/time/datetime-field into a [Django-accepted
  datetime-format][django-datetime]
** methodTag: Either "New" or "Update" for the Create and Update-view
   respectively
** fieldType: Either "date", "datetime" or "time"
** grid: The grid we're working on
** field: The field name
* getDeleteAction: The UI-specific data for the "delete" row-action. Should
  return an action object, with an action set to "rv.delete." + grid.
** grid: The grid we're working on
* getUpdateAction: The UI-specific data for the "update" row-action. Should
  return an action object, with an action set to "rv.update." + grid.

Please have a look at the bootstrap3 implementation for reference.

[pagination]: http://www.django-rest-framework.org/api-guide/pagination
[searching]: http://www.django-rest-framework.org/api-guide/filtering#searchfilter
[ordering]: http://www.django-rest-framework.org/api-guide/filtering#orderingfilter
[django]: http://djangoproject.com/
[jquery]: http://jquery.com/
[hotkeys]: https://code.google.com/p/js-hotkeys/
[knockout]: http://knockoutjs.com/
[moment]: http://momentjs.com/
[bootstrap3]: http://getbootstrap.com/
[bootstrap-datetimepicker]: http://eonasdan.github.io/bootstrap-datetimepicker/
[drf]: http://www.django-rest-framework.org/
[django-datetime]: https://docs.djangoproject.com/en/dev/ref/settings/#datetime-input-formats