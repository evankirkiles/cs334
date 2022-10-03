/*
 * controller_buttons.h
 * author: evan kirkiles
 * created on Sun Oct 02 2022
 * 2022 the nobot space,
 */

#ifndef __CONTROLLER_BUTTONS_H__
#define __CONTROLLER_BUTTONS_H__

#include <stdlib.h>

/* -------------------------------------------------------------------------- */
/*                                    PINS                                    */
/* -------------------------------------------------------------------------- */

// only a single button on pin 27
#define BUTTON_1_PIN 27
// the switch is on pin 14––we can treat it as a button
#define BUTTON_2_PIN 14

struct QueueDefinition;
typedef struct QueueDefinition* QueueHandle_t;

/* -------------------------------------------------------------------------- */
/*                                  TEMPLATES                                 */
/* -------------------------------------------------------------------------- */

// the event handler for the controller buttons
QueueHandle_t controller_buttons_init(void);

/* -------------------------------------------------------------------------- */
/*                                    TYPES                                   */
/* -------------------------------------------------------------------------- */

typedef struct {
  uint8_t pin;
} button_t;

typedef struct {
  uint16_t state;
} controller_buttons_event_t;

#endif /* __CONTROLLER_BUTTONS_H__ */