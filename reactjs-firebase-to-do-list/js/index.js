"use strict";

var rootUrl = 'https://glowing-inferno-7011.firebaseio.com/renwudemo/';
var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

var Input = React.createClass({
    displayName: "Input",

    render: function render() {
        return React.createElement(
            "div",
            { className: "input" },
            React.createElement(
                "h1",
                null,
                "待办事项:"
            ),
            React.createElement("input", { type: "text", placeholder: "新待办事件",
                value: this.props.val,
                onChange: this.props.change
            }),
            React.createElement("input", { type: "button", value: "+",
                onClick: this.props.action
            }),
            React.createElement("hr", null)
        );
    }
});

var ClearBtn = React.createClass({
    displayName: "ClearBtn",

    render: function render() {
        return React.createElement(
            "div",
            { className: "clearAll " + (this.props.show ? 'show' : '') },
            React.createElement("input", { type: "button", value: "删除所有",
                onClick: this.props.clear })
        );
    }
});

var DeleteBtn = React.createClass({
    displayName: "DeleteBtn",

    render: function render() {
        return React.createElement(
            "div",
            { className: "deleteAll " + (this.props.show ? 'show' : '') },
            React.createElement("input", { type: "button", value: "删除所选",
                onClick: this.props.deleteAll
            })
        );
    }
});

var Component = React.createClass({
    displayName: "Component",

    getInitialState: function getInitialState() {
        return {
            text: this.props.item.text,
            done: this.props.item.done
        };
    },

    checking: function checking(event) {
        var updated = { done: event.target.checked };
        this.setState(updated);
        this.firebase.update(updated);
    },

    componentWillMount: function componentWillMount() {
        this.firebase = new Firebase(rootUrl + 'items/' + this.props.item.key);
    },

    editing: function editing(event) {
        this.setState({ text: event.target.value });
    },

    deleting: function deleting() {
        this.firebase.remove();
    },

    saving: function saving() {
        this.firebase.update({ text: this.state.text });
    },

    render: function render() {
        return React.createElement(
            "div",
            { className: "component" },
            React.createElement("input", { type: "checkbox",
                checked: this.state.done,
                onChange: this.checking
            }),
            React.createElement("input", { type: "text",
                className: this.state.done ? 'lineThrough' : '',
                disabled: this.state.done,
                value: this.state.text,
                onChange: this.editing,
                onBlur: this.saving
            }),
            React.createElement("input", { type: "button", value: "x",
                onClick: this.deleting
            })
        );
    }
});

var ListComponent = React.createClass({
    displayName: "ListComponent",

    rendering: function rendering() {
        var itemsList = [];
        if (this.props.items && Object.keys(this.props.items) != 0) {
            for (var key in this.props.items) {
                if (key == '.key' || key == '.value') continue;
                if (this.props.items.hasOwnProperty(key)) {
                    var item = this.props.items[key];
                    item.key = key;

                    itemsList.push(React.createElement(Component, { key: key, item: item }));
                }
            }
            return itemsList;
        } else {
            return React.createElement("div", null);
        }
    },

    render: function render() {
        return React.createElement(
            "div",
            { className: 'listComponent ' + (this.props.isLoaded ? 'show' : '') },
            React.createElement(
                ReactCSSTransitionGroup,
                {
                    transitionName: "list",
                    transitionEnterTimeout: 300,
                    transitionLeaveTimeout: 300 },
                this.rendering()
            )
        );
    }
});

var App = React.createClass({
    displayName: "App",

    mixins: [ReactFireMixin],

    componentWillMount: function componentWillMount() {
        this.firebase = new Firebase(rootUrl + 'items/');
        this.bindAsObject(this.firebase, 'list');
        this.firebase.on('value', this.loaded);
    },

    getInitialState: function getInitialState() {
        return {
            list: {},
            inputText: '',
            loadedData: false
        };
    },

    changeText: function changeText(event) {
        this.setState({
            inputText: event.target.value
        });
    },

    addNew: function addNew() {
        if (this.state.inputText.length) {
            this.firebaseRefs.list.push({
                text: this.state.inputText,
                done: false
            });
            this.setState({ inputText: '' });
        }
    },

    loaded: function loaded() {
        this.setState({ loadedData: true });
    },

    deleteAll: function deleteAll() {
        for (var key in this.state.list) {
            if (key == '.key' || key == '.value') continue;
            if (this.state.list.hasOwnProperty(key) && this.state.list[key].done) {
                this.firebase.child(key).remove();
            }
        }
    },

    clear: function clear() {
        for (var key in this.state.list) {
            if (key == '.key' || key == '.value') continue;
            if (this.state.list.hasOwnProperty(key)) {
                this.firebase.child(key).remove();
            }
        }
    },

    render: function render() {
        return React.createElement(
            "div",
            { className: "container" },
            React.createElement(Input, { val: this.state.inputText,
                change: this.changeText,
                action: this.addNew
            }),
            React.createElement(ListComponent, {
                isLoaded: this.state.loadedData,
                items: this.state.list
            }),
            React.createElement(DeleteBtn, { deleteAll: this.deleteAll,
                show: this.state.loadedData && this.state.list && !this.state.list.hasOwnProperty('.value')
            }),
            React.createElement(ClearBtn, { clear: this.clear,
                show: this.state.loadedData && this.state.list && !this.state.list.hasOwnProperty('.value')
            })
        );
    }
});

ReactDOM.render(React.createElement(App, null), document.getElementById('app'));