/*
 * sdkconfig.h
 * author: evan kirkiles
 * created on Sun Oct 02 2022
 * 2022 the nobot space,
 */

#ifndef __SDK_CONFIG_H__
#define __SDK_CONFIG_H__

// Configuration for connectivity
#define CONFIG_ESP_WIFI_SSID "yale wireless"
#define CONFIG_ESP_WIFI_PASS "Bluehouse"
// #define CONFIG_ESP_WIFI_AUTHMODE WIFI_AUTH_WPA2_PSK  // or WIFI_AUTH_OPEN for yale wireless
#define CONFIG_ESP_WIFI_AUTHMODE WIFI_AUTH_OPEN

#define CONFIG_ESP_MAXIMUM_RETRY 5
#define CONFIG_WEBSOCKET_URI "ws://bcab-2601-18a-c681-c9a0-cc2-d634-6114-6a35.ngrok.io"
#define CONFIG_HTTP_SERVER_URI "http://bcab-2601-18a-c681-c9a0-cc2-d634-6114-6a35.ngrok.io/image"

// Configuration for controller inputs
#define CONFIG_PIN_JOYSTICK_VRX 6  // ANALOG 6, GPIO 34
#define CONFIG_PIN_JOYSTICK_VRY 7  // ANALOG 7, GPIO 35
#define CONFIG_PIN_JOYSTICK_SW -1
#define CONFIG_PIN_BUTTON_1 32
#define CONFIG_PIN_TOUCHPAD 0  // TOUCHPAD 0, GPIO 4
#define CONFIG_PIN_SWITCH_1 -1

// MAC address of this controller's camera. set this on a per-controller basis.
// Currently at: 40:22:d8:07:1e:84
#define CONFIG_RECEIVER_MAC_ADDRESS \
  (uint8_t[]) { 0x40, 0x22, 0xd8, 0x07, 0x1e, 0x84 }

#endif /* __SDK_CONFIG_H__ */