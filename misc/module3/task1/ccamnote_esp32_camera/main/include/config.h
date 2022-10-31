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
#define CONFIG_ESP_WIFI_PASS "Bluehouse"
#define CONFIG_ESP_WIFI_AUTHMODE WIFI_AUTH_WPA2_PSK  // or WIFI_AUTH_OPEN for yale wireless
#define CONFIG_ESP_MAXIMUM_RETRY 5
#define CONFIG_WEBSOCKET_URI "ws://bcab-2601-18a-c681-c9a0-cc2-d634-6114-6a35.ngrok.io"
#define CONFIG_HTTP_SERVER_URI "http://bcab-2601-18a-c681-c9a0-cc2-d634-6114-6a35.ngrok.io/image"

// Configuration for controller inputs
#define CONFIG_PIN_JOYSTICK_VRX 3  // ANALOG 6, GPIO 34
#define CONFIG_PIN_JOYSTICK_VRY 2  // ANALOG 7, GPIO 35
#define CONFIG_PIN_JOYSTICK_SW -1
#define CONFIG_PIN_BUTTON_1 36
#define CONFIG_PIN_SWITCH_1 -1

// -- CAMERA PINS
// From: https://github.com/easytarget/esp32-cam-webserver/blob/master/camera_pins.h
// (AI Thinker)
// https://github.com/SeeedDocument/forum_doc/raw/master/reg/ESP32_CAM_V1.6.pdf
//
#define CONFIG_PIN_CAM_PWDN 32
#define CONFIG_PIN_CAM_RESET -1
#define CONFIG_PIN_CAM_XCLK 0
#define CONFIG_PIN_CAM_SIOD 26
#define CONFIG_PIN_CAM_SIOC 27
#define CONFIG_PIN_CAM_D7 35
#define CONFIG_PIN_CAM_D6 34
#define CONFIG_PIN_CAM_D5 39
#define CONFIG_PIN_CAM_D4 36
#define CONFIG_PIN_CAM_D3 21
#define CONFIG_PIN_CAM_D2 19
#define CONFIG_PIN_CAM_D1 18
#define CONFIG_PIN_CAM_D0 5
#define CONFIG_PIN_CAM_VSYNC 25
#define CONFIG_PIN_CAM_HREF 23
#define CONFIG_PIN_CAM_PCLK 22
#define CONFIG_PIN_CAM_LED 33    // Status led
#define CONFIG_CAM_LED_ON LOW    // - Pin is inverted.
#define CONFIG_CAM_LED_OFF HIGH  //
#define CONFIG_CAM_PIN_LAMP 4    // LED FloodLamp.

#endif /* __SDK_CONFIG_H__ */