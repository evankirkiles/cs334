/*
 * config.h
 * author: evan kirkiles
 * created on Sun Oct 02 2022
 * 2022 the nobot space, 
 */

#ifndef __CONFIG_H__
#define __CONFIG_H__

#include "esp_wifi.h"

// CONFIG: Connectivity
#define CONFIG_ESP_WIFI_SSID "Green Haus"
#define CONFIG_ESP_WIFI_PASSWORD "Bluehouse"
#define CONFIG_ESP_WIFI_AUTHMODE WIFI_AUTH_WPA2_PSK // or WIFI_AUTH_OPEN for yale wireless
#define CONFIG_ESP_MAXIMUM_RETRY 5
#define CONFIG_WEBSOCKET_URI "ws://75c9-128-36-7-251.ngrok.io"

// CONFIG: Controller Pins
#define CONFIG_PIN_JOYSTICK_VRX     0
#define CONFIG_PIN_JOYSTICK_VRY     4
#define CONFIG_PIN_JOYSTICK_SW      16
#define CONFIG_PIN_BUTTON           

// CONFIG: Camera pins
#define CONFIG_PIN_

#endif /* __CONFIG_H__ */