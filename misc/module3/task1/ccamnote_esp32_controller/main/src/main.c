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
#include "esp_now.h"
#include "freertos/FreeRTOS.h"
#include "freertos/event_groups.h"
#include "freertos/queue.h"
#include "freertos/task.h"
#include "nvs_flash.h"
#include "config.h"

#include "controller_buttons.h"
#include "controller_joystick.h"
#include "controller_touchpad.h"
#include "wifi_connect.h"
#include "wifi_ws_client.h"

#define TAG "CCAMNotary Controller"

#define JOYSTICK_DEADZONE 0.05

typedef struct {
  double joystick_xstate;
  double joystick_ystate;
  uint16_t button_state;
} controller_state_t;

/* -------------------------- MAIN CONTROLLER LOOP -------------------------- */

/**
 * @brief Polls for button and joystick input events.
 *
 * Uses tiny checksums to detect state changes, only emitting packets when said
 * state change is detected. We send all events over websockets. However, it is
 * assumed that every even numbered button press uploads a picture, and every
 * odd numbered button press solidifies placement of a just-uploaded picture.
 *
 * @param pvParameter A placeholder for provided variables (unused).
 */
static void read_controller_task(void *pvParameter) {
  // begin & listen to the joystick & button event queue
  char message[128];
  bool received_joystick = false, received_button = false, received_touchpad = false;
  controller_joystick_event_t ev_joystick;
  ev_joystick.xstate = 0;
  ev_joystick.ystate = 0;
  ev_joystick.pressed = false;
  controller_buttons_event_t ev_buttons;
  ev_buttons.state = 0;
  controller_touchpad_event_t ev_touchpad;
  ev_touchpad.state = 0;
  QueueHandle_t controller_buttons_events = controller_buttons_init();
  QueueHandle_t controller_touchpad_events = controller_touchpad_init();
  // QueueHandle_t controller_joystick_events = controller_joystick_init();

  // // peer address
  // uint8_t *peerAddress = CONFIG_RECEIVER_MAC_ADDRESS;
  // // controller state to send to the peer
  // controller_state_t controller_state;

  // continually loop to retrieve input from the controller
  while (true) {
    // events emitted are guaranteed to be state changes. so on any event,
    // we want to send the entire state of the joystick to the websocket.
    //  - we wait up to 300 ms for the buttons, and then 300 ms for joystick
    received_button = xQueueReceive(controller_buttons_events, &ev_buttons, 20 / portTICK_PERIOD_MS);
    received_touchpad = xQueueReceive(controller_touchpad_events, &ev_touchpad, 20 / portTICK_PERIOD_MS);
    // received_button = xQueueReceive(controller_joystick_events, &ev_joystick, 20 / portTICK_PERIOD_MS);
    if (received_joystick || received_button || received_touchpad) {
      // if we got either a joystick or button update, send an update to the websocket
      sprintf(message, "{\"type\":\"controller_state\",\"data\":[%.2f, %.2f, %d, %s, %d, %s]}",
              ev_joystick.xstate,
              ev_joystick.ystate,
              ev_buttons.state,
              ((ev_buttons.state & 1) && received_button) ? "true" : "false",
              ev_touchpad.state,
              ((ev_touchpad.state & 1) && received_touchpad) ? "true" : "false");
      websocket_client_send(message, strlen(message));
    }
  }
}

/**
 * @brief Initializes the controller input queue.
 *
 * @return esp_err_t - An OK signal indicating the controller queue is now running.
 */
static esp_err_t read_controller_init(void) {
  xTaskCreate(read_controller_task, "read_controller_task", 2048, NULL, 4, NULL);
  return ESP_OK;
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

  // 2. initialize the on-board ESP32 wifi
  ESP_ERROR_CHECK(wifi_init_sta());

  // 3. create websocket server task
  ESP_ERROR_CHECK(websocket_client_start());

  // 4. begin reading input from controller
  if ((ret = read_controller_init()) != ESP_OK) {
    ESP_LOGE(TAG, "%s init controller read loop failed\n", __func__);
    // shut down the websocket in case of read controller error
    websocket_client_stop();
  }
}