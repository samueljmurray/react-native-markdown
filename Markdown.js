var React = require('react');
var {
  View,
  Dimensions
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
  },
  listItem: {
    flexDirection: 'row'
  },
  listItemBullet: {
  },
  listItemNumber: {
  },
  newline: {
    width: Dimensions.get("window").width - 32 - 48
  },
  paragraph: {
    marginTop: 12,
    marginBottom: 12,
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
