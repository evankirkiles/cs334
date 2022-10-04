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
#include "freertos/FreeRTOS.h"
#include "freertos/event_groups.h"
#include "freertos/queue.h"
#include "freertos/task.h"
#include "nvs_flash.h"
#include "sdkconfig.h"

#include "controller_buttons.h"
#include "wifi_connect.h"
#include "wifi_ws_client.h"

#define NOBOT_CONTROLLER_TAG "nobot controller"

#define JOYSTICK_DEADZONE 0.05

/* ----------------------------- JOYSTICK INPUT ----------------------------- */

/**
 * @brief Reads analog joystick input from an ADC channel.
 *
 * The ESP32 integrates two 12-bit SAR (Successive Approximation Register) ADCs,
 * supporting a total of 18 measurement channels (analog enabled pins).
 *
 * The ADC driver API supports ADC1 (8 channels, attached to GPIOs 32 - 39), and
 * ADC2 (10 channels, attached to GPIOs 0, 2, 4, 12 - 15 and 25 - 27). However,
 * the usage of ADC2 has some restrictions for the application:
 *
 * 1. ADC2 is used by the Wi-Fi driver. Therefore the application can only use
 *      ADC2 when the Wi-Fi driver has not started.
 * 2. Some of the ADC2 pins are used as strapping pins (GPIO 0, 2, 15) thus
 *      cannot be used freely.
 *
 * @param channel The input ADC channel.
 * @return uint8_t - The analog input (0-255) to the channel.
 */
static uint8_t readJoystickChannel(adc1_channel_t channel) {
  adc1_config_width(ADC_WIDTH_BIT_10);                  // Range 0-1023
  adc1_config_channel_atten(channel, ADC_ATTEN_DB_11);  // ADC_ATTEN_DB_11 = 0-3,6V
  return (uint8_t)(adc1_get_raw(channel) >> 2);         // Read analog and shift to 0-255
}

/* -------------------------- MAIN CONTROLLER LOOP -------------------------- */

/**
 * @brief Polls for button and joystick input events.
 *
 * Uses tiny checksums to detect state changes, only emitting packets when said
 * state change is detected.
 *
 * @param pvParameter A placeholder for provided variables (unused).
 */
static void read_controller_task(void *pvParameter) {
  // INPUT: joystick
  double js_x, js_y;                    // joystick x and y
  double last_js_x = 0, last_js_y = 0;  // previous joystick x and y

  // INPUT: buttons
  uint16_t buttons = 0;       // button inputs
  uint16_t last_buttons = 0;  // previous button inputs

  // begin & listen to the button event queue
  controller_buttons_event_t ev;
  QueueHandle_t controller_buttons_events = controller_buttons_init();
  while (true) {
    // if there's a button event available, save it into buttons
    ESP_LOGD(NOBOT_CONTROLLER_TAG, "wait for button events");
    if (xQueueReceive(controller_buttons_events, &ev, 50 / portTICK_PERIOD_MS)) {
      ESP_LOGI(NOBOT_CONTROLLER_TAG, "joystick_buttons_events %d", ev.state);
      buttons = ev.state;
    }

    // read in joystick axis input from the ESP32 ADC channels 4 and 5.
    // note that the joystick we use has 5V analog output, but our ADC only handles
    // up to 3.5V input, mapped from 0-255. so the resting position on each axis
    // of 2.5V actually maps to (2.5/3.5)*255 = 182. Therefore, higher X and Y
    // values actually just get cut off at 255––there are 180 states dedicated to
    // lower-voltage positions, and only 75 dedicated to higher, with voltages
    // higher than 3.5V simply capping the ADC at 255. There's no real way around
    // this with our hardware, so we kind of have to make do.
    double steps = 0xFF;
    js_x = (3.5 / 2.5) * ((readJoystickChannel(ADC1_CHANNEL_4) / steps) - (2.5 / 3.5));
    js_y = (3.5 / 2.5) * ((readJoystickChannel(ADC1_CHANNEL_5) / steps) - (2.5 / 3.5));

    ESP_LOGD(NOBOT_CONTROLLER_TAG, "last_js_x %0.2f last_js_y %0.2f", last_js_x, last_js_y);

    // transmit input if something has changed, based on checksum
    if (fabs(js_x - last_js_x) > JOYSTICK_DEADZONE || fabs(js_y - last_js_y) > JOYSTICK_DEADZONE || last_buttons != buttons) {
      // ESP_LOGI(NOBOT_CONTROLLER_TAG, "send buttons %d JS X=%0.2f Y=%0.2f", buttons, js_x, js_y);
      char message[128];
      sprintf(message, "{\"type\":\"controller_state\",\"data\":{\"buttons\":%d,\"js_x\":%0.2f,\"js_y\":%0.2f}}", buttons, js_x, js_y);
      websocket_client_send(message, strlen(message));

      // update the previous axes only when we send a packet
      last_js_x = js_x;
      last_js_y = js_y;
    }

    // use previous values to detect state changes, triggering packets
    last_buttons = buttons;
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
  wifi_init_sta();

  // 3. create websocket server task
  websocket_client_start();

  // 4. begin reading input from controller
  if ((ret = read_controller_init()) != ESP_OK) {
    ESP_LOGE(NOBOT_CONTROLLER_TAG, "%s init read controller failed\n", __func__);
  }

  // 5. shut down the websocket in case of read controller error
  websocket_client_stop();
}