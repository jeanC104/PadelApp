/*! http://mths.be/placeholder v2.0.7 by @mathias */

/* Copyright Mathias Bynens <http://mathiasbynens.be/>

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE. */

;(function(window, document, $) {

        var isInputSupported = 'placeholder' in document.createElement('input');
        var isTextareaSupported = 'placeholder' in document.createElement('textarea');
        var prototype = $.fn;
        var valHooks = $.valHooks;
        var propHooks = $.propHooks;
        var hooks;
        var placeholder;

        if (isInputSupported && isTextareaSupported) {

                placeholder = prototype.placeholder = function() {
                        return this;
                };

                placeholder.input = placeholder.textarea = true;

        } else {

                placeholder = prototype.placeholder = function() {
                        var $this = this;
                        $this
                                .filter((isInputSupported ? 'textarea' : ':input') + '[placeholder]')
                                .not('.placeholder')
                                .bind({
                                        'focus.placeholder': clearPlaceholder,
                                        'blur.placeholder': setPlaceholder
                                })
                                .data('placeholder-enabled', true)
                                .trigger('blur.placeholder');
                        return $this;
                };

                placeholder.input = isInputSupported;
                placeholder.textarea = isTextareaSupported;

                hooks = {
                        'get': function(element) {
                                var $element = $(element);

                                var $passwordInput = $element.data('placeholder-password');
                                if ($passwordInput) {
                                        return $passwordInput[0].value;
                                }

                                return $element.data('placeholder-enabled') && $element.hasClass('placeholder') ? '' : element.value;
                        },
                        'set': function(element, value) {
                                var $element = $(element);

                                var $passwordInput = $element.data('placeholder-password');
                                if ($passwordInput) {
                                        return $passwordInput[0].value = value;
                                }

                                if (!$element.data('placeholder-enabled')) {
                                        return element.value = value;
                                }
                                if (value == '') {
                                        element.value = value;
                                        // Issue #56: Setting the placeholder causes problems if the element continues to have focus.
                                        if (element != safeActiveElement()) {
                                                // We can't use `triggerHandler` here because of dummy text/password inputs :(
                                                setPlaceholder.call(element);
                                        }
                                } else if ($element.hasClass('placeholder')) {
                                        clearPlaceholder.call(element, true, value) || (element.value = value);
                                } else {
                                        element.value = value;
                                }
                                // `set` can not return `undefined`; see http://jsapi.info/jquery/1.7.1/val#L2363
                                return $element;
                        }
                };

                if (!isInputSupported) {
                        valHooks.input = hooks;
                        propHooks.value = hooks;
                }
                if (!isTextareaSupported) {
                        valHooks.textarea = hooks;
                        propHooks.value = hooks;
                }

                $(function() {
                        // Look for forms
                        $(document).delegate('form', 'submit.placeholder', function() {
                                // Clear the placeholder values so they don't get submitted
                                var $inputs = $('.placeholder', this).each(clearPlaceholder);
                                setTimeout(function() {
                                        $inputs.each(setPlaceholder);
                                }, 10);
                        });
                });

                // Clear placeholder values upon page reload
                $(window).bind('beforeunload.placeholder', function() {
                        $('.placeholder').each(function() {
                                this.value = '';
                        });
                });

        }

        function args(elem) {
                // Return an object of element attributes
                var newAttrs = {};
                var rinlinejQuery = /^jQuery\d+$/;
                $.each(elem.attributes, function(i, attr) {
                        if (attr.specified && !rinlinejQuery.test(attr.name)) {
                                newAttrs[attr.name] = attr.value;
                        }
                });
                return newAttrs;
        }

        function clearPlaceholder(event, value) {
                var input = this;
                var $input = $(input);
                if (input.value == $input.attr('placeholder') && $input.hasClass('placeholder')) {
                        if ($input.data('placeholder-password')) {
                                $input = $input.hide().next().show().attr('id', $input.removeAttr('id').data('placeholder-id'));
                                // If `clearPlaceholder` was called from `$.valHooks.input.set`
                                if (event === true) {
                                        return $input[0].value = value;
                                }
                                $input.focus();
                        } else {
                                input.value = '';
                                $input.removeClass('placeholder');
                                input == safeActiveElement() && input.select();
                        }
                }
        }

        function setPlaceholder() {
                var $replacement;
                var input = this;
                var $input = $(input);
                var id = this.id;
                if (input.value == '') {
                        if (input.type == 'password') {
                                if (!$input.data('placeholder-textinput')) {
                                        try {
                                                $replacement = $input.clone().attr({ 'type': 'text' });
                                        } catch(e) {
                                                $replacement = $('<input>').attr($.extend(args(this), { 'type': 'text' }));
                                        }
                                        $replacement
                                                .removeAttr('name')
                                                .data({
                                                        'placeholder-password': $input,
                                                        'placeholder-id': id
                                                })
                                                .bind('focus.placeholder', clearPlaceholder);
                                        $input
                                                .data({
                                                        'placeholder-textinput': $replacement,
                                                        'placeholder-id': id
                                                })
                                                .before($replacement);
                                }
                                $input = $input.removeAttr('id').hide().prev().attr('id', id).show();
                                // Note: `$input[0] != input` now!
                        }
                        $input.addClass('placeholder');
                        $input[0].value = $input.attr('placeholder');
                } else {
                        $input.removeClass('placeholder');
                }
        }

        function safeActiveElement() {
                // Avoid IE9 `document.activeElement` of death
                // https://github.com/mathiasbynens/jquery-placeholder/pull/99
                try {
                        return document.activeElement;
                } catch (err) {}
        }

}(this, document, jQuery));
