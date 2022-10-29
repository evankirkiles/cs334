/*
 * controller_joystick.h
 * author: evan kirkiles
 * created on Thu Oct 27 2022
 * 2022 the nobot space, 
 */

#ifndef __CONTROLLER_JOYSTICK_H__
#define __CONTROLLER_JOYSTICK_H__

#include "config.h"
#include <stdlib.h>

/* -------------------------------------------------------------------------- */
/*                                    PINS                                    */
/* -------------------------------------------------------------------------- */

// Define our joystick's pinouts
#define JOYSTICK_X_PIN CONFIG_PIN_JOYSTICK_VRX
#define JOYSTICK_Y_PIN CONFIG_PIN_JOYSTICK_VRY
#define JOYSTICK_PRESS_PIN CONFIG_PIN_JOYSTICK_SW

struct QueueDefinition;
typedef struct QueueDefinition* QueueHandle_t;

/* -------------------------------------------------------------------------- */
/*                                  TEMPLATES                                 */
/* -------------------------------------------------------------------------- */

// the event handler for the controller joystick
QueueHandle_t controller_joystick_init(void);

/* -------------------------------------------------------------------------- */
/*                                    TYPES                                   */
/* -------------------------------------------------------------------------- */

typedef struct {
  uint8_t xpin;
  uint8_t ypin;
  uint8_t swpin;
} joystick_t;

typedef struct {
  double xstate;
  double ystate;
  bool pressed;
} controller_joystick_event_t;

#endif /* __CONTROLLER_JOYSTICK_H__ */