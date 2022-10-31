/*
 * controller_camera.c
 * author: evan kirkiles
 * created on Thu Oct 27 2022
 * 2022 the nobot space,
 */

#include "controller_camera.h"

#define TAG "CCAMNotary Camera"

/**
 * @brief Configures the CCAMNotary camera for use
 *
 * @return esp_err_t
 */
esp_err_t controller_camera_init() {
  camera_config_t camera_config = {
      .ledc_channel = LEDC_CHANNEL_0,
      .ledc_timer = LEDC_TIMER_0,
      .pin_d0 = CAM_PIN_D0,
      .pin_d1 = CAM_PIN_D1,
      .pin_d2 = CAM_PIN_D2,
      .pin_d3 = CAM_PIN_D3,
      .pin_d4 = CAM_PIN_D4,
      .pin_d5 = CAM_PIN_D5,
      .pin_d6 = CAM_PIN_D6,
      .pin_d7 = CAM_PIN_D7,
      .pin_xclk = CAM_PIN_XCLK,
      .pin_pclk = CAM_PIN_PCLK,
      .pin_vsync = CAM_PIN_VSYNC,
      .pin_href = CAM_PIN_HREF,
      .pin_sccb_sda = CAM_PIN_SIOD,
      .pin_sccb_scl = CAM_PIN_SIOC,
      .pin_pwdn = CAM_PIN_PWDN,
      .pin_reset = CAM_PIN_RESET,
      .xclk_freq_hz = 20000000,
      .pixel_format = PIXFORMAT_JPEG,
      .frame_size = FRAMESIZE_UXGA,
      .jpeg_quality = 10,
      .fb_count = 2,
      .grab_mode = CAMERA_GRAB_LATEST};
  return esp_camera_init(&camera_config);
}

/**
 * @brief Takes a picture using the camera
 *
 * @param fb
 * @return esp_err_t
 */
esp_err_t controller_camera_take_photo(camera_fb_t **fb) {
  ESP_LOGI(TAG, "Taking photo...");

  // snap a picture from the camera
  *fb = esp_camera_fb_get();
  if (!(*fb)) {
    ESP_LOGI(TAG, "Photo capture failed.");
    return ESP_FAIL;
  }

  return ESP_OK;
}

/**
 * @brief Returns the framebuffer for reuse
 */
esp_err_t controller_camera_return_fb(camera_fb_t *fb) {
  esp_camera_fb_return(fb);
  return ESP_OK;
}