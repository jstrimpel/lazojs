define(['test/mocks/lazo'], function (lazo) {

    function createView(ctl, id, LazoView, _) {
        var el;

        el = LAZO.app.isClient ? $('<div class="view-"' + id + '>') : null;
        return new LazoView({
            el: el,
            templateEngine: 'micro',
            getTemplate: function (options) {
                options.success('I am a template!');
            },
            ctl: ctl
        });
    }

    // these paths do not exist until after the intern configuration has
    // been set. requirejs will be defined at this point.
    return {

        setUpApp: function (callback) {
            requirejs(['underscore'], function (_) {
                // var template = _.template('I am a template!');
                LAZO.require = requirejs;
                LAZO.app.getDefaultTemplateEngineName = function () {};
                LAZO.app.getTemplateEngine = function () {
                    return {
                        compile: function (template) {
                            return _.template(template);
                        },
                        execute: function (compiledTemplate, data) {
                            return compiledTemplate(data);
                        },
                        engine: _.template
                    };
                };

                callback();
            });
        },

        createCtlTree: function (callback) {

            function _getEl() {
                if (LAZO.app.isClient) {
                    return this.$el || (this.$el = $('<div lazo-cmp-id="' + this.cid + '">'));
                }
            }

            requirejs(['lazoView', 'underscore'], function (LazoView, _) {
                var childCtl;
                var ctl = {
                    currentView: null,
                    children: {
                        foo: []
                    },
                    _getEl: _getEl
                };

                for (var i = 0; i < 3; i++) {
                    if (!i) {
                        ctl.currentView = createView(ctl, i, LazoView, _);
                        ctl.currentView.getTemplate = function (options) {
                            options.success('<div lazo-cmp-container="foo"></div>');
                        };
                        ctl.cid = i;
                        ctl.name = 'name' + i;
                        ctl.ctx = {};
                    } else {
                        childCtl = {
                            currentView: null,
                            cid: i,
                            name: 'name' + i,
                            ctx: {},
                            _getEl: _getEl
                        };
                        childCtl.currentView = createView(childCtl, i, LazoView, _);
                        ctl.children.foo.push(childCtl);
                    }
                }

                callback(ctl);
            });
        }

    };

});