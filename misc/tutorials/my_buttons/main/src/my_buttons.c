#include "my_buttons.h"

#define TAG "MyButton"

/* -------------------------------------------------------------------------- */
/*                                 BUTTON MAP                                 */
/* -------------------------------------------------------------------------- */

// here we define a bit mask that selects for the buttons we're configuring.
#define BUTTON_SELECT (PIN_BIT(CONFIG_PIN_BUTTON_1) | PIN_BIT(CONFIG_PIN_BUTTON_2))
// similarly, make an array to allow us to iterate over each of our buttons
static const button_t button_idx_map[] = {
    [0] { CONFIG_PIN_BUTTON_1 }, [1] { CONFIG_PIN_BUTTON_2 }};
static const size_t button_idx_map_length = sizeof(button_idx_map) / sizeof(button_t);

/* -------------------------------------------------------------------------- */
/*                                BUTTON EVENTS                               */
/* -------------------------------------------------------------------------- */

// define a local queue which will handle button events
static QueueHandle_t queue;

/**
 * @brief Polls for button events.
 *
 * Emits the total state of all buttons defined in our button_idx_map whenever
 * one of them is detected to have changed state. Each button corresponds to
 * a specific bit in the button_state value. For example, with two buttons:
 *  - when both buttons are pressed             button_state = 0b11
 *  - when only the second button is pressed    button_state = 0b10
 *  - when only the first button is pressed     button_state = 0b01
 *  - when no buttons are pressed               button_state = 0b00
 * Every time a button's state changes, the total button_state value is updated
 * and emitted to the queue returned by my_buttons_init.
 *
 * @param pvParameter Placeholder values to pass into the function (not used)
 */
static void my_buttons_task(void *pvParameter) {
  // keep track of our own total button state, combining all buttons into one int
  uint16_t button_state = 0;       // current total button state
  uint16_t last_button_state = 0;  // previous total button state

  // initialize the esp32-button component event queue
  button_event_t ev;
  QueueHandle_t button_events = button_init(BUTTON_SELECT);

  // continually poll for button events
  while (true) {
    // wait up to 30ms for any new events from the external button queue
    if (xQueueReceive(button_events, &ev, 30 / portTICK_PERIOD_MS)) {
      // if we get an event, update the bit for that button
      for (int i = 0; i < button_idx_map_length; i++) {
        if (button_idx_map[i].pin == ev.pin) {
          if (ev.event == BUTTON_UP) {
            button_state &= ~(1 << i);
          } else {
            button_state |= (1 << i);
          }
        }
      }
      // if the button state changed, emit the new total button state
      if (button_state != last_button_state) {
        my_buttons_event_t new_ev = {button_state};
        xQueueSend(queue, &new_ev, 30 / portTICK_PERIOD_MS);
        last_button_state = button_state;
      }
    }
  }
}

/* -------------------------------------------------------------------------- */
/*                              PUBLIC INTERFACE                              */
/* -------------------------------------------------------------------------- */

/**
 * @brief Creates the local button queue and returns it.
 *
 * Initializes a local queue of size 4 for our button events, and begins the
 * button listening task that emits to said queue.
 *
 * @return QueueHandle_t The total button state event queue
 */
QueueHandle_t my_buttons_init(void) {
  queue = xQueueCreate(4, sizeof(my_buttons_event_t));
  xTaskCreate(my_buttons_task, "my_buttons_task", 2048, NULL, 4, NULL);
  return queue;
}
