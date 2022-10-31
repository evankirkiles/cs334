/*
 * wifi_espnow_client.c
 * author: evan kirkiles
 * created on Sun Oct 30 2022
 * 2022 the nobot space,
 */

#include "wifi_espnow_client.h"

static const char* TAG = "CCAMNotary WiFi ESP-NOW Station";

/**
 * @brief Sets up the ESP-NOW wifi station.
 *
 * Begins in ESPNOW_WIFI_MODE, as we're not exposing to the internet. We just
 * want to emit events to our slave node which IS connected to the internet.
 */
esp_err_t wifi_init(void) {
  ESP_ERROR_CHECK(esp_netif_init());
  ESP_ERROR_CHECK(esp_event_loop_create_default());
  wifi_init_config_t cfg = WIFI_INIT_CONFIG_DEFAULT();
  ESP_ERROR_CHECK(esp_wifi_init(&cfg));
  ESP_ERROR_CHECK(esp_wifi_set_storage(WIFI_STORAGE_RAM));
  ESP_ERROR_CHECK(esp_wifi_set_mode(WIFI_MODE_STA));
  ESP_ERROR_CHECK(esp_wifi_start());
  return ESP_OK;
}

/**
 * @brief Logs ESP-NOW message send statuses.
 *
 * @param mac_addr
 * @param status
 */
static void on_esp_now_send(const uint8_t* mac_addr, esp_now_send_status_t status) {
  ESP_LOGI(TAG, "ESP-NOW message send to [%02X:%02X:%02X:%02X:%02X:%02X]: %s",
           mac_addr[0], mac_addr[1], mac_addr[2],
           mac_addr[3], mac_addr[4], mac_addr[5],
           status == ESP_NOW_SEND_SUCCESS ? "SUCCESS" : "FAILURE");
}

/**
 * @brief Sets up the ESP-NOW peer connection.
 *
 * Begins in ESPNOW_WIFI_MODE, as we're not exposing to the internet. We just
 * want to emit events to our camera node which IS connected to the internet.
 */
esp_err_t esp_now_peer_init(uint8_t* peerAddress) {
  // register the callback function to respond to our send events
  esp_now_register_send_cb(on_esp_now_send);

  // set up the peer connection
  esp_now_peer_info_t peerInfo = {};
  memcpy(peerInfo.peer_addr, peerAddress, 6);
  peerInfo.channel = 0;
  peerInfo.encrypt = false;
  return esp_now_add_peer(&peerInfo);
}