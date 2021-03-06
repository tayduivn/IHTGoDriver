import React from "react";
import { Provider } from "react-redux";
import { ThemeProvider } from "styled-components";
import theme from "./theme";
import Navigation from "./routes";
import { store } from "./store";
import { Platform, StatusBar } from "react-native";
import firebase from "react-native-firebase";
import DropdownAlert from "react-native-dropdownalert";
import {
  SET_ALERT,
  ADD_ALL_ORDER,
  ADD_WAITING_ORDER,
  REMOVE_ORDER
} from "./src/actions/types";
import axios from "./src/utilities/axios";

class App extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  deleteOrder = order_id => {
    store.dispatch({
      type: REMOVE_ORDER,
      id: order_id
    });
  };

  comingOrder = order_id => {
    axios
      .post("driver/get-order", {
        order_id
      })
      .then(res => {
        store.dispatch({
          type: ADD_ALL_ORDER,
          order: res.data
        });
        store.dispatch({
          type: ADD_WAITING_ORDER,
          order: res.data
        });
      })
      .catch(err => {});
  };

  subscribeToNotificationListeners() {
    const channel = new firebase.notifications.Android.Channel(
      "notification_channel_name",
      "Notifications",
      firebase.notifications.Android.Importance.Max
    ).setDescription(
      "A Channel To manage the notifications related to Application"
    );
    firebase.notifications().android.createChannel(channel);

    this.notificationListener = firebase
      .notifications()
      .onNotification(notification => {
        if (parseInt(notification.data.action) === 1) {
          this.deleteOrder(notification.data.order_id);
        } else {
          this.comingOrder(notification.data.order_id);
        }
        this.displayNotification(notification);
        store
          .getState()
          .alert.alert.alertWithType(
            "error",
            notification.title,
            notification.body
          );
      });
  }

  displayNotification = notification => {
    if (Platform.OS === "android") {
      const localNotification = new firebase.notifications.Notification({
        sound: "default",
        show_in_foreground: true
      })
        .setNotificationId(notification.notificationId)
        .setTitle(notification.title)
        .setSubtitle(notification.subtitle)
        .setBody(notification.body)
        .setData(notification.data)
        .android.setChannelId("notification_channel_name")
        .android.setSmallIcon("ic_launcher")
        .android.setPriority(firebase.notifications.Android.Priority.High);

      firebase
        .notifications()
        .displayNotification(localNotification)
        .catch(err => {});
    }
  };

  componentDidMount() {
    firebase
      .messaging()
      .hasPermission()
      .then(hasPermission => {
        if (hasPermission) {
          this.subscribeToNotificationListeners();
        } else {
          firebase
            .messaging()
            .requestPermission()
            .then(() => {
              this.subscribeToNotificationListeners();
            })
            .catch(error => {});
        }
      });
  }

  render() {
    return (
      <>
        <StatusBar hidden={true} />
        <Provider store={store}>
          <ThemeProvider theme={theme}>
            <Navigation />
          </ThemeProvider>
        </Provider>
        <DropdownAlert
          ref={ref => {
            store.dispatch({
              type: SET_ALERT,
              alert: ref
            });
          }}
        />
      </>
    );
  }
}

export default App;
