var React = require('react');
var {
  View
} = require('react-native');
var _ = require('lodash');
var SimpleMarkdown = require('simple-markdown');

var styles = {
  autolink: {
  },
  em: {
    fontStyle: 'italic'
  },
  link: {

  },
  list: {
    flex: 1
  },
  listItem: {
    flexDirection: 'row'
  },
  listItemBullet: {
    fontSize: 20,
    lineHeight: 20
  },
  listItemNumber: {
    fontWeight: 'bold'
  },
  newline: {
  },
  paragraph: {
    marginTop: 10,
    marginBottom: 10,
    flexWrap: 'wrap',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start'
  },
  plainText: {

  },
  strong: {
    fontWeight: 'bold'
  },
  text: {
    color: '#222222'  
  }
};


var Markdown = React.createClass({

  getDefaultProps: function() {
    return {
      style: styles
    };
  },

  componentWillMount: function() {
    var mergedStyles = _.merge({}, styles, this.props.style);
    var rules = require('./rules')(mergedStyles);
    var subsetDefaultRules = _.pick(SimpleMarkdown.defaultRules, _.keys(mergedStyles));
    rules = _.merge({}, subsetDefaultRules, rules);

    var parser = SimpleMarkdown.parserFor(rules);
    this.parse = function(source) {
      var blockSource = source + '\n\n';
      return parser(blockSource, {inline: false});
    };
    this.renderer = SimpleMarkdown.reactFor(SimpleMarkdown.ruleOutput(rules, 'react'));
  },

  render: function() {

    var child = _.isArray(this.props.children)
      ? this.props.children.join('') : this.props.children;
    var tree = this.parse(child);
    return <View style={[styles.view, this.props.style.view]}>{this.renderer(tree)}</View>;
  }
});

module.exports = Markdown;
