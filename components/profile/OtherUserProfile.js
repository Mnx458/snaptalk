import React, {Component} from 'react';
import {
  View,
  Text,
  Image,
  TouchableHighlight,
  Modal,
  ImageBackground,
} from 'react-native';
import FollowButton from '../profile/FollowButton';
import LogoutButton from '../profile/LogoutButton';
import Icon from 'react-native-vector-icons/Ionicons';
import styles from '../profile/style/OtherUserProfileStyle';
import firebase from 'firebase';
require('firebase/firestore');

export default class ModalExample extends Component {
  state = {
    modalVisible: false,
    user: {},
    nbOfFollowers: 0,
    nbOfFollowing: 0,
    nbOfPosts: 0,
    currentUserId: null,
    isNotSameUser: true,
  };

  setModalVisible(visible) {
    this.setState({modalVisible: visible});
  }

  componentDidMount() {
    this.getUserId();
  }

  getListSize = async () => {
    const user = await firebase
      .firestore()
      .collection('users')
      .doc(this.props.postUserId)
      .get();

    const listOfPosts = new firebase.firestore.FieldPath('listOfPosts');
    const listOfFollowers = new firebase.firestore.FieldPath('listOfFollowers');
    const listOfFollowing = new firebase.firestore.FieldPath('listOfFollowing');

    this.setState({nbOfPosts: await user.get(listOfPosts).length});
    this.setState({nbOfFollowers: await user.get(listOfFollowers).length});
    this.setState({nbOfFollowing: await user.get(listOfFollowing).length});
  };

  getUserId = async () => {
    this.setState({isLoadingList: true});
    this.unsubscribe = await firebase
      .firestore()
      .collection('users')
      .get()
      .then(snapshot => {
        snapshot.forEach(doc => {
          if (doc.data().name == this.props.username) {
            this.setState({user: doc.data()});
            this.getListSize();
            var current = firebase.auth().currentUser;
            this.setState({currentUserId: current.uid});
            if (current.uid == doc.id) {
              this.setState({isNotSameUser: false});
            }
          }
        });
      });
  };

  render() {
    return (
      <View>
        <Modal
          animationType="slide"
          transparent={false}
          visible={this.state.modalVisible}
          onRequestClose={() => {
            this.setModalVisible(!this.state.modalVisible);
          }}>
          <View style={styles.modalContainer}>
            <View style={styles.topBar}>
              <TouchableHighlight
                onPress={() => {
                  this.setModalVisible(!this.state.modalVisible);
                }}>
                <Icon
                  name="ios-arrow-back"
                  size={24}
                  style={styles.backButton}
                />
              </TouchableHighlight>
              {!this.state.isNotSameUser && (
                <LogoutButton style={styles.logout} />
              )}
            </View>
            <View>
              <View styles={styles.container}>
                <View style={styles.header}>
                  <ImageBackground
                    source={require('../../assets/Default-profile-bg.jpg')}
                    style={styles.backgroundImage}>
                    <View style={styles.avatarContainer}>
                      <Image
                        style={styles.avatar}
                        source={
                          this.state.user.profilePicture
                            ? {uri: this.state.user.profilePicture}
                            : require('../../assets/tempAvatar.jpg')
                        }
                      />
                    </View>
                    <Text style={styles.name}> {this.state.user.name} </Text>
                  </ImageBackground>
                </View>
                <View style={styles.followStyle}>
                  {this.state.isNotSameUser && (
                    <FollowButton
                      loggedUserUID={this.state.currentUserId}
                      userToFollow={this.state.user.uid}
                    />
                  )}
                </View>
                <View style={styles.info}>
                  <View style={styles.state}>
                    <Text style={styles.amount}> {this.state.nbOfPosts} </Text>
                    <Text style={styles.title}> Posts </Text>
                  </View>
                  <View style={[styles.state, styles.separators]}>
                    <Text style={styles.amount}>
                      {' '}
                      {this.state.nbOfFollowers}{' '}
                    </Text>
                    <Text style={styles.title}> Followers </Text>
                  </View>
                  <View style={styles.state}>
                    <Text style={styles.amount}>
                      {' '}
                      {this.state.nbOfFollowing}{' '}
                    </Text>
                    <Text style={styles.title}> Following </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </Modal>
        <TouchableHighlight
          onPress={() => {
            this.setModalVisible(true);
          }}>
          <Text style={styles.modalProfile}>{this.props.username}</Text>
        </TouchableHighlight>
      </View>
    );
  }
}
