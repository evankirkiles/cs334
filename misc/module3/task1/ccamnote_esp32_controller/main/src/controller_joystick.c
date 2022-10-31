/*
 * controller_joystick.c
 * author: evan kirkiles
 * created on Thu Oct 27 2022
 * 2022 the nobot space,
 */

#include <stdlib.h>
#include <stdbool.h>
#include <inttypes.h>
#include <math.h>

#include "freertos/FreeRTOS.h"
#include "freertos/queue.h"
#include "freertos/task.h"
#include "driver/adc.h"
#include "driver/gpio.h"
#include "esp_log.h"

#include "controller_joystick.h"
#include "util.h"

// our tag for EPS Info logging
#define CONTROLLER_JOYSTICK_TAG "CCAMNotary Joystick"

// this is how much the joystick needs to change by to be registered as an event
#define JOYSTICK_DEADZONE 0.05

// handle a global state for the joystick queue
static QueueHandle_t queue;

/**
 * @brief Sends a joystick event to the larger event queue.
 *
 * @param state The state of the joystick
 */
static void send_event(controller_joystick_event_t event) {
  xQueueSend(queue, &event, 1000 / portTICK_PERIOD_MS);
}

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

/**
 * @brief Polls for joystick events.
 *
 * Continually emits the state of the joystick initialized in `controller_joystick.c`,
 * producing an X value, Y value, and press value.
 *
 * @param pvParameter Placeholder values to pass into the task function (unused)
 */
static void controller_joystick_task(void *pvParameter) {
  // keep track of joystick state and previous.
  double js_x, js_y;
  double last_js_x = 0, last_js_y = 0;

  controller_joystick_event_t ev;
  while (true) {
    // read in joystick axis input from the ESP32 ADC channels they're set to.
    double steps = 0xFF;
    js_x = nearest_tenth(readJoystickChannel(JOYSTICK_X_PIN) / steps - 0.5) * 2;
    js_y = nearest_tenth(readJoystickChannel(JOYSTICK_Y_PIN) / steps - 0.5) * 2;

    // once joystick has changed significantly since last event
    if (fabs(js_x - last_js_x) > JOYSTICK_DEADZONE || fabs(js_y - last_js_y) > JOYSTICK_DEADZONE) {
      // transmit the event object
      ev.xstate = js_x;
      ev.ystate = js_y;
      ev.pressed = false;
      send_event(ev);
      // and save the js_x and js_y into the previous values
      last_js_x = js_x;
      last_js_y = js_y;
      // log the button event, and update button state
      ESP_LOGI(CONTROLLER_JOYSTICK_TAG, "[joystick] x: %0.2f, y: %0.2f, pressed: %d", ev.xstate, ev.ystate, ev.pressed);
    }

    // delay for 10ms so other things can use thread
    vTaskDelay(10 / portTICK_PERIOD_MS);
  }
}

/**
 * @brief Initializes the controller input queue.
 *
 * @return esp_err_t - An OK signal indicating the controller queue is now running.
 */
QueueHandle_t controller_joystick_init(void) {
  queue = xQueueCreate(4, sizeof(controller_joystick_event_t));
  xTaskCreate(controller_joystick_task, "joystick_task", 2048, NULL, 4, NULL);
  return queue;
}