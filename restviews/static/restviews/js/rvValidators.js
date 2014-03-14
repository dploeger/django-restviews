// RestView validators

/**
 * Validate a string based on a regular expression
 *
 * @param el The element being checked
 * @param value The value to check
 * @param check The regular expression
 * @returns {boolean} Wether the regular expression matches
 */

rv.validate = function (el, value, check) {

    return value.match(new RegExp(check, "gi"));

};

/**
 * Validate a date-string
 *
 * @param el The element being checked
 * @param value The date/time string to check
 * @param check (not used)
 * @returns {boolean} Wether the string can be converted to a date.
 */

rv.validateDate = function (el, value, check) {

    return rv.validateDateTime(el, value, check);

};

/**
 * Validate a date/time-string
 *
 * @param el The element being checked
 * @param value The date/time string to check
 * @param check (not used)
 * @returns {boolean} Wether the string can be converted to a date.
 */

rv.validateDateTime = function (el, value, check) {

    if (rv.uiImplementation == "bootstrap3") {

        return moment(value, el.data("DateTimePicker").format).isValid();

    } else {

        // Currently not supported

        return true;

    }

};

/**
 * Validate a time-string
 *
 * @param el The element being checked
 * @param value The date/time string to check
 * @param check (not used)
 * @returns {boolean} Wether the string can be converted to a date.
 */

rv.validateTime = function (el, value, check) {

    return rv.validateDateTime(el, value, check);

};

/**
 * Check a string, if it resembles an e-mail address.
 *
 * Based on http://www.regular-expressions.info/email.html
 *
 * @param el The element being checked
 * @param value String to check
 * @param check (not used)
 * @returns {boolean} Wether the value is an e-mail-address
 */

rv.validateEmail = function (el, value, check) {

    return rv.validate(
        el,
        value,
        "\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b"
    )

};

/**
 * Check a string, if it resembles an URL.
 *
 * Based on http://blog.mattheworiordan.com/post/
 * 13174566389/url-regular-expression-for-links-with-or-without-the
 *
 * @param el The element being checked
 * @param value String to check
 * @param check (not used)
 * @returns {boolean} Wether the value is an URL
 */

rv.validateUrl = function (el, value, check) {

    return rv.validate(
        el,
        value,
        "((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]" +
            "+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-]*)" +
            "?\??(?:[\-\+=&;%@\.\w]*)#?(?:[\.\!\/\\\w]*))?)"
    );

};