// RestView validators

/**
 * Validate a string based on a regular expression
 *
 * @param value The value to check
 * @param check The regular expression
 * @returns {boolean} Wether the regular expression matches
 */

rv.validate = function (value, check) {

    return value.match(new RegExp(check, "gi"));

};

/**
 * Validate a date/time-string by trying to create a Date object from it
 *
 * @param value The date/time string to check
 * @param check (not used)
 * @returns {boolean} Wether the string can be converted to a date.
 */

rv.validateDateTime = function (value, check) {

    var parsedDate = Date.parse(value);

    return parsedDate instanceof Date;

};

/**
 * Check a string, if it resembles an e-mail address.
 *
 * Based on http://www.regular-expressions.info/email.html
 *
 * @param value String to check
 * @param check (not used)
 * @returns {boolean} Wether the value is an e-mail-address
 */

rv.validateEmail = function (value, check) {

    return rv.validate(
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
 * @param value String to check
 * @param check (not used)
 * @returns {boolean} Wether the value is an URL
 */

rv.validateUrl = function (value, check) {

    return rv.validate(
        value,
        "((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]" +
            "+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-]*)" +
            "?\??(?:[\-\+=&;%@\.\w]*)#?(?:[\.\!\/\\\w]*))?)",
        "gi"
    );

};