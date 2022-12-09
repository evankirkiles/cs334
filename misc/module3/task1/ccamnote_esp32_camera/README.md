# Module 3, Task 1: Camera

_by Evan Kirkiles. Nov. 1, 2022_

the camera is a standalone system that receives commands over websockets from a server. it has no pin out, so it is entirely made up of the ESP-CAM held in place inside of one of the marlboro red boxes, powered through serial. it receives three possible commands:

1. `take_picture` - use the `esp-camera` component to read the camera data into the frame buffer, then write the contents of the frame buffer to the body of a POST request, and send to `<URL>/image`.
2. `flash_{on,off}` - set the output of the pin corresponding to the ESP-CAM’s LED flash.

## Development

To run the camera's code, you'll need the [Espressif IDE](https://docs.espressif.com/projects/esp-idf/en/latest/esp32/get-started/index.html).

```bash
# clone the git repository and navigate into the camera
$ git clone --recurse-submodules -j8 git@github.com:evankirkiles/cs334.git
$ cd cs334/misc/module3/task1/ccamnote_esp32_camera

# load ESP-IDF environment variables
$ $IDF_PATH/export.sh
```

now, make any modifications to `main/include/config.h`, changing the WiFi credentials and server URL. then, build & flash your ESP-CAM. it is highly recommended to use the [VSCode Espressif IDF](https://marketplace.visualstudio.com/items?itemName=espressif.esp-idf-extension) extension, as this provides a GUI for running the `idf.py` commands below:

```bash
# build the code
$ idf.py build

# flash to your connected ESP-32, replacing the port
#   e.g. idf.py flash -p /dev/cu.usbserial-1410
$ idf.py flash -p <USB-PORT-FOR-ESP32>
```

if everything worked, you should begin consuming controller input on your camera from the server configured in `config.h`!

### Common Problems

the submodule for the `esp32-camera` component is sometimes broken. in that case, you can simply download the `esp32-camera` repository from [here](https://github.com/espressif/esp32-camera/tree/master) and put that in your `components/` folder.
