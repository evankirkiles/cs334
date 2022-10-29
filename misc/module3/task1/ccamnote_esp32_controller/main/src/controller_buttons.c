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

#include "controller_buttons.h"
#include "button.h"

// our tag for ESP Info logging
#define CONTROLLER_BUTTONS_TAG "CCAMNotary Buttons"

/* ------------------------------- BUTTON MAP ------------------------------- */

// button maps for easy button reference
#define BUTTON_SELECT (PIN_BIT(BUTTON_1_PIN) | PIN_BIT(SWITCH_1_PIN))

static const button_t button_idx_map[] = {
    [0] { BUTTON_1_PIN },
    [1] { SWITCH_1_PIN }};
static const size_t button_idx_map_length = sizeof(button_idx_map) / sizeof(button_t);

/* ------------------------------ BUTTON EVENTS ----------------------------- */

// handle a global state for the button queue
static QueueHandle_t queue;

/**
 * @brief Sends a button event to the larger event queue.
 *
 * @param state The state of all buttons, encoded as a binary number.
 */
static void send_event(uint16_t state) {
  controller_buttons_event_t event = {
      .state = state};
  xQueueSend(queue, &event, 1000 / portTICK_PERIOD_MS);
}

/**
 * @brief Polls for button events.
 *
 * Continually emits the total state of all buttons initialized in `controller_buttons.c`,
 * listening to button events from the button queue.
 *
 * @param pvParameter Placeholder values to pass into the task function (unused)
 */
static void controller_buttons_task(void *pvParameter) {
  printf("button_idx_map_length: %d\n", button_idx_map_length);
  button_event_t ev;
  QueueHandle_t button_events = button_init(BUTTON_SELECT);
  uint16_t button_state = 0;       // current buttons inputs
  uint16_t last_button_state = 0;  // previous button inputs
  while (true) {
    // attempt to read an event from the button queue into ev
    if (xQueueReceive(button_events, &ev, 1000 / portTICK_PERIOD_MS)) {
      // if successful, search for the matching button pin
      for (int i = 0; i < button_idx_map_length; i++) {
        if (button_idx_map[i].pin == ev.pin) {
          // log the button event, and update button state
          ESP_LOGI(CONTROLLER_BUTTONS_TAG, "button pin: %d event: %d idx: %d", ev.pin, ev.event, i);
          if (ev.event == BUTTON_UP) {
            button_state &= ~(1 << i);
          } else {
            button_state |= (1 << i);
          }
        }
      }
      // emit the button event to the main queue if the button state has changed
      if (button_state != last_button_state) {
        send_event(button_state);
        last_button_state = button_state;
      }
    }
  }
}

/**
 * @brief Creates the queue for handling controller button inputs
 *
 * @return QueueHandle_t* - The handle of the queue
 */
QueueHandle_t controller_buttons_init(void) {
  queue = xQueueCreate(4, sizeof(controller_buttons_event_t));
  xTaskCreate(controller_buttons_task, "button_task", 2048, NULL, 4, NULL);
  return queue;
}