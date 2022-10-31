/*
 * wifi_espnow_client.h
 * author: evan kirkiles
 * created on Sun Oct 30 2022
 * 2022 the nobot space, 
 */

// INSPIRED BY: https://github.com/espressif/esp-idf/blob/2d9e75bf0515ac3f09723cfba471ba363d030637/examples/wifi/espnow/main/espnow_example_main.c
// Initializes an ESP-NOW protocol WiFi station for emitting controller events
// to the camera in the ESP32-CAM.

#ifndef __WIFI_ESPNOW_CLIENT_H__
#define __WIFI_ESPNOW_CLIENT_H__

#include <string.h>

#include "config.h"
#include "esp_wifi.h"
#include "esp_event.h"
#include "esp_log.h"
#include "esp_now.h"

esp_err_t wifi_init(void);
esp_err_t esp_now_peer_init(uint8_t* peerAddress);

#endif /* __WIFI_ESPNOW_CLIENT_H__  */