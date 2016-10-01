'use strict';

import React, { Component, PropTypes } from 'react';
import { WebView, View, Text, ListView, StyleSheet } from 'react-native';
import Button from 'react-native-button';
import { bindActionCreators } from 'redux';
import { selectReddit, fetchPostsIfNeeded, invalidateReddit } from '../actions/expenseActions';
import Picker from '../components/Picker';
import ReactNativeLogin from '../containers/App'
import { connect } from 'react-redux';
import CookieManager from 'react-native-cookies';


const LOGOUT_URL = 'https://app.chromeriver.com/logout';

class Expense extends Component {
  constructor(props) {
    super(props)
    this.handleChange = this.handleChange.bind(this)
    this.handleRefreshPress = this.handleRefreshPress.bind(this)
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      loggedIn: true,
      ds: ds.cloneWithRows(props.posts.map((post) => post.title))
    };
  }

  componentDidMount() {
    const { dispatch, selectedReddit } = this.props
    dispatch(fetchPostsIfNeeded(selectedReddit))
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.selectedReddit !== this.props.selectedReddit) {
      const { dispatch, selectedReddit } = nextProps
      dispatch(fetchPostsIfNeeded(selectedReddit))
    }
  }

  handleChange(nextReddit) {
    this.props.dispatch(selectReddit(nextReddit))
  }

  handleRefreshPress() {
    const { dispatch, selectedReddit } = this.props
    dispatch(invalidateReddit(selectedReddit))
    dispatch(fetchPostsIfNeeded(selectedReddit))
  }

  onNavigationStateChange (navState) {
    console.log(navState);
    this.setState({
      loggedIn: false,
    });
  }

  logout () {
    CookieManager.clearAll((err, res) => {
      console.log(err);
      console.log(res);
    });

    this.render(<WebView
      ref={'webview'}
      automaticallyAdjustContentInsets={false}
      source={{uri: LOGOUT_URL}}
      javaScriptEnabled={true}
      onNavigationStateChange={this.onNavigationStateChange.bind(this)}
      startInLoadingState={true}
      scalesPageToFit={true}
    />)

    this.setState({
      loggedIn: false,
    });
  }

  render() {
    const { selectedReddit, posts, isFetching, lastUpdated } = this.props
    const isEmpty = posts.length === 0
    this.state.ds = this.state.ds.cloneWithRows((posts.map((post) => post.title)))
    if (this.state.loggedIn) {
      return (
        <View>
          <Picker value={selectedReddit}
                  onChange={this.handleChange}
                  options={[ 'reactjs', 'frontend', 'angular' ]}/>
          <Button style={{color: 'black'}} onPress={this.logout.bind(this)}>Logout</Button>
          <View style={{flex: 1, flexDirection: 'row'}}>
            {lastUpdated && <Text>Last updated at {new Date(lastUpdated).toLocaleTimeString()}.{' '}</Text>}
            {!isFetching &&
            <Text
              style={styles.link}
              onPress={this.handleRefreshPress}>
              Refresh
            </Text>
            }
          </View>
          {isEmpty
            ? (isFetching ? <Text>Loading...</Text> : <Text>Empty.</Text>)
            : <View style={{ opacity: isFetching ? 0.5 : 1 }}>
            <ListView
              dataSource={this.state.ds}
              renderRow={(rowData) => <Text>{rowData}</Text>}
            />
          </View>
          }
        </View>
      )
    }
    else {
      return (
        <ReactNativeLogin/>
      );
    }
  }
}

const styles = StyleSheet.create({
  link: {
    color: 'blue',
    fontWeight: 'bold'
  }
});

ListView.propTypes = {
  dataSource: PropTypes.object.isRequired
}

Expense.propTypes = {
  selectedReddit: PropTypes.string.isRequired,
  posts: PropTypes.array.isRequired,
  isFetching: PropTypes.bool.isRequired,
  lastUpdated: PropTypes.number,
  dispatch: PropTypes.func.isRequired
}

function mapStateToProps(state) {
  const {
          selectedReddit,
          postsByReddit
        } = state
  const {
          isFetching,
          lastUpdated,
          items: posts
        } = postsByReddit[selectedReddit] || {
    isFetching: true,
    items: []
  }

  return {
    selectedReddit,
    posts,
    isFetching,
    lastUpdated
  }
}

export default connect(mapStateToProps)(Expense)