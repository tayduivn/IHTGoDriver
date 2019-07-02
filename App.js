import React from "react";
import { Provider } from "react-redux";
import { ThemeProvider } from "styled-components";
import theme from "./theme";
import Navigation from "./routes";
import LocationServicesDialogBox from "react-native-android-location-services-dialog-box";
import { store } from "./store";
import { Platform, StatusBar } from "react-native";
import firebase from "react-native-firebase";
import DropdownAlert from "react-native-dropdownalert";
import { SET_ALERT } from "./src/actions/types";

class App extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  subscribeToNotificationListeners() {
    const channel = new firebase.notifications.Android.Channel(
      "notification_channel_name", // To be Replaced as per use
      "Notifications", // To be Replaced as per use
      firebase.notifications.Android.Importance.Max
    ).setDescription(
      "A Channel To manage the notifications related to Application"
    );
    firebase.notifications().android.createChannel(channel);

    this.notificationListener = firebase
      .notifications()
      .onNotification(notification => {
        console.log("onNotification notification-->", notification);
        console.log("onNotification notification.data -->", notification.data);
        console.log(
          "onNotification notification.notification -->",
          notification.notification
        );
        // Process your notification as required
        this.displayNotification(notification);
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
        .android.setChannelId("notification_channel_name") // e.g. the id you chose above
        .android.setSmallIcon("ic_launcher") // create this icon in Android Studio
        .android.setPriority(firebase.notifications.Android.Priority.High);

      firebase
        .notifications()
        .displayNotification(localNotification)
        .catch(err => console.error(err));
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
            .catch(error => {
              console.error(error);
            });
        }
      });

    LocationServicesDialogBox.checkLocationServicesIsEnabled({
      message:
        "<h2>Bật định vị đi mày</h2>This app wants to change your device settings:<br/><br/>Use GPS, Wi-Fi, and cell network for location",
      ok: "YES",
      cancel: "NO",
      enableHighAccuracy: true,
      showDialog: true,
      openLocationServices: true,
      preventOutSideTouch: false,
      preventBackClick: false,
      providerListener: true
    })
      .then((success => {}).bind(this))
      .catch(error => {
        console.log(error.message);
      });
  }

  componentWillUnmount() {
    this.notificationListener();
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
