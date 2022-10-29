/*
 * sdkconfig.h
 * author: evan kirkiles
 * created on Sun Oct 02 2022
 * 2022 the nobot space,
 */

#ifndef __SDK_CONFIG_H__
#define __SDK_CONFIG_H__

#include "esp_wifi.h"

// Configuration for connectivity
#define CONFIG_ESP_WIFI_SSID "Green Haus"
#define CONFIG_ESP_WIFI_PASSWORD "Bluehouse"
#define CONFIG_ESP_WIFI_AUTHMODE WIFI_AUTH_WPA2_PSK  // or WIFI_AUTH_OPEN for yale wireless
#define CONFIG_ESP_MAXIMUM_RETRY 5
#define CONFIG_WEBSOCKET_URI "ws://75c9-128-36-7-251.ngrok.io"

// Configuration for controller inputs
#define CONFIG_PIN_JOYSTICK_VRX 6  // ANALOG 6, GPIO 34
#define CONFIG_PIN_JOYSTICK_VRY 7  // ANALOG 7, GPIO 35
#define CONFIG_PIN_JOYSTICK_SW -1
#define CONFIG_PIN_BUTTON_1 -1
#define CONFIG_PIN_SWITCH_1 -1

#endif /* __SDK_CONFIG_H__ */