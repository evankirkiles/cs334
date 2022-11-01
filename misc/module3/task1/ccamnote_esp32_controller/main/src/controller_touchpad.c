/*
 * controller_buttons.c
 * author: evan kirkiles
 * created on Sun Oct 02 2022
 * 2022 the nobot space,
 */

#include <stdlib.h>

#include "freertos/FreeRTOS.h"
#include "freertos/queue.h"
#include "freertos/task.h"
#include "driver/gpio.h"
#include "esp_log.h"

#include "controller_touchpad.h"

#define TOUCH_THRESH_NO_USE (0)

// our tag for ESP Info logging
static const char* TAG = "CCAMNotary Touchpad";

/* ------------------------------ BUTTON EVENTS ----------------------------- */

// handle a global state for the touchpad queue
static QueueHandle_t queue;

/**
 * @brief Sends a button event to the larger event queue.
 *
 * @param state The state of all buttons, encoded as a binary number.
 */
static void send_event(bool state) {
  controller_touchpad_event_t event = {
      .state = state};
  xQueueSend(queue, &event, 1000 / portTICK_PERIOD_MS);
}

/**
 * @brief Polls for touchpad events.
 *
 * @param pvParameter Placeholder values to pass into the task function (unused)
 */
static void controller_touchpad_task(void* pvParameter) {
  uint16_t touch_filter_value;
  bool touch_pad_state = false;

  while (true) {
    // read the value from the touchpad
    touch_pad_read_filtered(TOUCHPAD_PIN, &touch_filter_value);
    if ((touch_filter_value < TOUCHPAD_TOUCHED_THRESHOLD) != touch_pad_state) {
      touch_pad_state = !touch_pad_state;
      send_event(touch_pad_state);
    }
    // delay the task 20ms to free up resources
    vTaskDelay(20 / portTICK_PERIOD_MS);
  }
}

/**
 * @brief Creates the queue for handling controller button inputs
 *
 * @return QueueHandle_t* - The handle of the queue
 */
QueueHandle_t controller_touchpad_init(void) {
  // initialize the touch pad
  ESP_ERROR_CHECK(touch_pad_init());
  // set reference voltage for charging / discharging
  touch_pad_set_voltage(TOUCH_HVOLT_2V7, TOUCH_LVOLT_0V5, TOUCH_HVOLT_ATTEN_1V);
  // configure the pins with the touchpad
  touch_pad_config(TOUCHPAD_PIN, TOUCH_THRESH_NO_USE);
  // start the touchpad filter
  touch_pad_filter_start(10);

  // create the touchpad task queue
  queue = xQueueCreate(4, sizeof(controller_touchpad_event_t));
  xTaskCreate(controller_touchpad_task, "touchpad_task", 2048, NULL, 4, NULL);
  return queue;
}