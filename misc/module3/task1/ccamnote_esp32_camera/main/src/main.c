/*
 * controller_main.c
 * author: evan kirkiles
 * created on Sun Oct 02 2022
 * 2022 the nobot space,
 */
#include <inttypes.h>
#include <stdio.h>
#include <math.h>
#include <string.h>

#include "driver/adc.h"
#include "driver/gpio.h"
#include "esp_event.h"
#include "esp_log.h"
#include "esp_system.h"
#include "esp_wifi.h"
#include "esp_websocket_client.h"
#include "esp_now.h"
#include "freertos/FreeRTOS.h"
#include "freertos/event_groups.h"
#include "freertos/queue.h"
#include "freertos/task.h"
#include "nvs_flash.h"
#include "config.h"

#include "controller_camera.h"
#include "wifi_connect.h"
#include "wifi_http_client.h"
#include "wifi_ws_client.h"

#define JOYSTICK_DEADZONE 0.05

static const char* TAG = "CCAMNotary Camera";

/* -------------------------- MAIN CONTROLLER LOOP -------------------------- */

/**
 * @brief Stalls for 5 minutes on each loop to allow ESP32 continual running
 *
 * @param pvParameter
 */
static void stalling_task(void* pvParameter) {
  while (true) {
    vTaskDelay(5 * 60 * 1000 / portTICK_PERIOD_MS);
  }
}

/**
 * @brief Initializes the controller input queue.
 *
 * @return esp_err_t - An OK signal indicating the controller queue is now running.
 */
static esp_err_t stall_forever(void) {
  xTaskCreate(stalling_task, "stalling_task", 2048, NULL, 4, NULL);
  return ESP_OK;
}

/**
 * @brief Websocket callback handler for receiving server messages
 *
 * @param mac The MAC address of the message sender.
 * @param incomingData The message sent over ESP-NOW.
 * @param len The length of the message.
 */
static void receive_websocket_data(void* handler_args, esp_event_base_t base, int32_t event_id, void* event_data) {
  esp_websocket_event_data_t* data = (esp_websocket_event_data_t*)event_data;
  if (data->op_code == 10) return;  // ignore simple pings
  // figure out what we got from the websocket
  char command[13];
  snprintf(command, sizeof command, "%s", (char*)data->data_ptr);
  // if we're sent the take_picture command, do so
  if (!strcmp(command, "take_picture")) {
    ESP_LOGI(TAG, "Picture ordered by websocket. Proceeding...");
    camera_fb_t* fb = NULL;
    // take a picture with the camera into picBuf and bufLen
    ESP_ERROR_CHECK(controller_camera_take_photo(&fb));
    ESP_LOGI(TAG, "JPEG picture taken of size %d bytes.", fb->len);
    // now upload it using the HTTP client
    ESP_ERROR_CHECK(http_post_image(CONFIG_HTTP_SERVER_URI, fb));
    ESP_LOGI(TAG, "Picture uploaded to server!");
    // and finally clean up the frame buffer
    ESP_ERROR_CHECK(controller_camera_return_fb(fb));
    // when flash turns on, tell the camera to turn the flash on
  } else if (!strcmp(command, "flash_on")) {
    controller_camera_set_flash(true);
    // likewise for flash off
  } else if (!strcmp(command, "flash_off")) {
    controller_camera_set_flash(0);
  }
}

/* -------------------------------------------------------------------------- */
/*                                APP EXECUTION                               */
/* -------------------------------------------------------------------------- */

void app_main() {
  esp_err_t ret;

  // 1. initialize non-volatile storage. if we're out of memory or there's a new
  // version, attempt to erase the current NVS and re-initialize it.
  ret = nvs_flash_init();
  if (ret == ESP_ERR_NVS_NO_FREE_PAGES || ret == ESP_ERR_NVS_NEW_VERSION_FOUND) {
    ESP_ERROR_CHECK(nvs_flash_erase());
    ret = nvs_flash_init();
  }
  ESP_ERROR_CHECK(ret);

  // 2. initialize the camera interface
  ESP_ERROR_CHECK(controller_camera_init());

  // 3. initialize the on-board ESP32 wifi
  ESP_ERROR_CHECK(wifi_init_sta());

  // 4. create websocket client task and listen for data. no WS sending is done here.
  ESP_ERROR_CHECK(websocket_client_start());
  ESP_ERROR_CHECK(websocket_client_listen(receive_websocket_data));

  // 5. infinite loop of delay, as we now are just waiting for WS data to tell
  //    us to take a picture and upload it to the server.
  ESP_ERROR_CHECK(stall_forever());
}