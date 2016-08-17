var React = require('react');
var {
  Image,
  Text,
  View,
  Linking,
} = require('react-native');
var SimpleMarkdown = require('simple-markdown');
var _ = require('lodash');
import GoogleAnalytics from "react-native-google-analytics-bridge";
import Mixpanel from "react-native-mixpanel";

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

function handleLink(node) {
  GoogleAnalytics.trackEvent(
    "Link in article clicked",
    "Article link clicked"
  );
  Mixpanel.trackWithProperties(
    "Article link clicked",
    {
      "text": node.content,
      "url": node.target
    }
  );
  Linking.openURL(node.target);
}

module.exports = function(styles) {
  return {
    autolink: {
      react: function(node, output, state) {
        state.withinText = true;
        return splitWords(node, state, styles.autolink, {onPress: function() {
          handleLink(node);
        }});
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
    em: {
      react: function(node, output, state) {
        state.withinText = true;
        return splitWords(node, state, styles.em);
      }
    },
    link: {
      react: function(node, output, state) {
        state.withinText = true;
        return splitWords(node, state, styles.autolink, {onPress: function() {
          handleLink(node);
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
          return React.createElement(Text, {
            key: i,
            style: styles.listItem
          }, [bullet, output(item, state)]);
        });

        return React.createElement(View, { key: state.key, style: styles.list }, items);
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
    text: {
      match: SimpleMarkdown.inlineRegex(
          /^[\s\S]+?(?=[^0-9A-Za-z\s\u00c0-\uffff_+-.,!@#$%^&();\\/|<>"']|\n\n| {2,}\n|\w+:\S|$)/
      ),
      react: function(node, output, state) {
        // Breaking words up in order to allow for text reflowing in flexbox
        return splitWords(node, state, styles.text);
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
