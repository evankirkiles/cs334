 /*
 * controller_camera.h
 * author: evan kirkiles
 * created on Thu Oct 27 2022
 * 2022 the nobot space, 
 */

#ifndef __CONTROLLER_CAMERA_H__
#define __CONTROLLER_CAMERA_H__

#include <stdbool.h>
#include "config.h"
#include "esp_log.h"
#include "esp_camera.h"

/* -------------------------------------------------------------------------- */
/*                                    PINS                                    */
/* -------------------------------------------------------------------------- */

// Define our camera's pins
#define CAM_PIN_PWDN    CONFIG_PIN_CAM_PWDN
#define CAM_PIN_RESET   CONFIG_PIN_CAM_RESET
#define CAM_PIN_XCLK    CONFIG_PIN_CAM_XCLK
#define CAM_PIN_SIOD    CONFIG_PIN_CAM_SIOD
#define CAM_PIN_SIOC    CONFIG_PIN_CAM_SIOC
#define CAM_PIN_D7      CONFIG_PIN_CAM_D7
#define CAM_PIN_D6      CONFIG_PIN_CAM_D6
#define CAM_PIN_D5      CONFIG_PIN_CAM_D5
#define CAM_PIN_D4      CONFIG_PIN_CAM_D4
#define CAM_PIN_D3      CONFIG_PIN_CAM_D3
#define CAM_PIN_D2      CONFIG_PIN_CAM_D2
#define CAM_PIN_D1      CONFIG_PIN_CAM_D1
#define CAM_PIN_D0      CONFIG_PIN_CAM_D0
#define CAM_PIN_VSYNC   CONFIG_PIN_CAM_VSYNC
#define CAM_PIN_HREF    CONFIG_PIN_CAM_HREF
#define CAM_PIN_PCLK    CONFIG_PIN_CAM_PCLK

/* -------------------------------------------------------------------------- */
/*                                  TEMPLATES                                 */
/* -------------------------------------------------------------------------- */

// camera functions
esp_err_t controller_camera_init(void);
esp_err_t controller_camera_take_photo(camera_fb_t** fb);
esp_err_t controller_camera_set_flash(bool on);
esp_err_t controller_camera_return_fb(camera_fb_t *fb);

#endif /* __CONTROLLER_JOYSTICK_H__ */