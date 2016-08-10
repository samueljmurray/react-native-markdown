var React = require('react');
var {
  Image,
  Text,
  View,
  Linking,
} = require('react-native');
var SimpleMarkdown = require('simple-markdown');
var _ = require('lodash');

function splitWords(node, state, styles, props) {
  // Breaking words up in order to allow for text reflowing in flexbox
  if (Array.isArray(node.content)) {
    node.content = _.map(node.content, function(c, i) {
      return c.content
    }).join(' ')
  }
  var words = node.content.split(' ');
  words = _.map(words, function(word, i) {
    var elements = [];
    if (i != words.length - 1) {
      word = word + ' ';
    }
    var textStyles = [styles];
    if (!state.withinText) {
      textStyles.push(styles.plainText);
    }
    var allProps = _.merge({}, {
      key: i,
      style: textStyles
    }, props)
    return React.createElement(Text, allProps, word);
  });
  return words;
}

module.exports = function(styles) {
  return {
    autolink: {
      react: function(node, output, state) {
        state.withinText = true;
        return splitWords(node, state, styles.autolink, {onPress: function() {
          Linking.openURL(node.target);
        }});
      }
    },
    blockQuote: {
      react: function(node, output, state) {
        state.withinText = true;
        return React.createElement(Text, {
          key: state.key,
          style: styles.blockQuote
        }, output(node.content, state));
      }
    },
    br: {
      react: function(node, output, state) {
        return React.createElement(Text, {
          key: state.key,
          style: styles.br
        }, '\n\n');
      }
    },
    codeBlock: {
      react: function(node, output, state) {
        state.withinText = true;
        return React.createElement(Text, {
          key: state.key,
          style: styles.codeBlock
        }, null);
      }
    },
    del: {
      react: function(node, output, state) {
        state.withinText = true;
        return React.createElement(Text, {
          key: state.key,
          style: styles.del
        }, output(node.content, state));
      }
    },
    em: {
      react: function(node, output, state) {
        state.withinText = true;
        return splitWords(node, state, styles.em);
      }
    },
    heading: {
      react: function(node, output, state) {
        state.withinText = true;
        return React.createElement(Text, {
          key: state.key,
          style: [styles.heading, styles['heading' + node.level]]
        }, output(node.content, state));
      }
    },
    hr: {
      react: function(node, output, state) {
        return React.createElement(View, { key: state.key, style: styles.hr });
      }
    },
    image: {
      react: function(node, output, state) {
        return React.createElement(Image, {
          key: state.key,
          source: { uri: node.target },
          style: styles.image
        });
      }
    },
    inlineCode: {
      react: function(node, output, state) {
        state.withinText = true;
        return React.createElement(Text, {
          key: state.key,
          style: styles.inlineCode
        }, output(node.content, state));
      }
    },
    link: {
      react: function(node, output, state) {
        state.withinText = true;
        return splitWords(node, state, styles.autolink, {onPress: function() {
          Linking.openURL(node.target);
        }});
      }
    },
    list: {
      react: function(node, output, state) {

        var items = _.map(node.items, function(item, i) {
          var bullet;
          if (node.ordered) {
            bullet = React.createElement(Text, { style: styles.listItemNumber  }, (i + 1) + '. ');
          }
          else {
            bullet = React.createElement(Text, { style: styles.listItemBullet }, '\u2022 ');
          }
          return React.createElement(View, {
            key: i,
            style: styles.listItem
          }, [bullet, output(item, state)]);
        });

        return React.createElement(View, { key: state.key, style: styles.list }, items);
      }
    },
    mailto: {
      react: function(node, output, state) {
        state.withinText = true;
        return React.createElement(Text, {
          key: state.key,
          style: styles.mailto,
          onPress: _.noop
        }, output(node.content, state));
      }
    },
    newline: {
      react: function(node, output, state) {
        return React.createElement(Text, {
          key: state.key,
          style: styles.newline
        }, '\n');
      }
    },
    paragraph: {
      react: function(node, output, state) {
        return React.createElement(View, {
          key: state.key,
          style: styles.paragraph
        }, output(node.content, state));
      }
    },
    strong: {
      react: function(node, output, state) {
        state.withinText = true;
        return splitWords(node, state, styles.strong);
      }
    },
    table: {
      react: function(node, output, state) {
        var headers = _.map(node.header, function(content, i) {
          return React.createElement(Text, {
            key: i,
            style: styles.tableHeaderCell
          }, output(content, state));
        });

        var header = React.createElement(View, { style: styles.tableHeader }, headers);

        var rows = _.map(node.cells, function(row, r) {
          var cells = _.map(row, function(content, c) {
            return React.createElement(View, {
              key: c,
              style: styles.tableRowCell
            }, output(content, state));
          });
          var rowStyles = [styles.tableRow];
          if (node.cells.length - 1 == r) {
            rowStyles.push(styles.tableRowLast);
          }
          return React.createElement(View, { key: r, style: rowStyles }, cells);
        });

        return React.createElement(View, { key: state.key, style: styles.table }, [ header, rows ]);
      }
    },
    text: {
      match: SimpleMarkdown.inlineRegex(
          /^[\s\S]+?(?=[^0-9A-Za-z\s\u00c0-\uffff_+-.,!@#$%^&();\\/|<>"']|\n\n| {2,}\n|\w+:\S|$)/
      ),
      react: function(node, output, state) {
        // Breaking words up in order to allow for text reflowing in flexbox
        return splitWords(node, state, styles.text);
      }
    },
    u: {
      react: function(node, output, state) {
        state.withinText = true;
        return React.createElement(View, {
          key: state.key,
          style: styles.u
        }, output(node.content, state));
      }
    },
    url: {
      react: function(node, output, state) {
        state.withinText = true;
        return React.createElement(Text, {
          key: state.key,
          style: styles.url,
          onPress: _.noop
        }, output(node.content, state));
      }
    }
  }
};
