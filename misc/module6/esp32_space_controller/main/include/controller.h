#ifndef CONTROLLER_H
#define CONTROLLER_H

#include "esp_system.h"

/**
 * @brief Begins reading from the controller
 * 
 * @return esp_err_t 
 */
esp_err_t controller_init(void);

#endif /* CONTROLLER_H */
