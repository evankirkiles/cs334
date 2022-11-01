# Module 3, Task 1: Webserver

_by Evan Kirkiles. Nov. 1, 2022_

the web server is a basic REST API and websocket routing system that maintains a list of all `CONTROLLER`s, `CAMERA`s, and `CONSUMER`s connected to its instance over sockets. it parses controller states received from all `CONTROLLER`s and uses that to send commands to the cameras for remote operation. the meaning of each of these client types is:

1. `CONTROLLER` - an ESP32 controller with a button and touch sensor, used for taking pictures and controlling the flash, respectively.
2. `CAMERA` - an ESP-CAM board receiving commands from the server, that can upload JPEG image data back to the server using a POST request to `/image`
3. `CONSUMER` - (not implemented) a web client for viewing the total state of the network, as well as uploaded pictures.

## Development

to run the web server, you'll need [Node.js](https://nodejs.org/en/) and the package manager [Yarn](https://yarnpkg.com).

```bash
# clone the git repository and navigate into the camera
$ git clone --recurse-submodules -j8 git@github.com:evankirkiles/cs334.git
$ cd cs334/misc/module3/task1/ccamnote_ws_server
```

install your dependencies, and then you should be good to go locally!

```bash
# install deps
$ yarn install

# start the dev server
$ yarn dev
# ALTERNATIVELY, build and start
$ yarn build
$ yarn strt
```

if you want to expose the web server to the internet so your components can communicate with the server, you can easily do so using [ngrok](https://ngrok.com):

```bash
# begin the ngrok server using HTTP
$ ngrok http 3000 --scheme=http
```

then supply the domain assigned by ngrok to the `config.h` files of the camera and the controller so they can communicate with the server!

## Related

The controller source code can be found [here](https://github.com/evankirkiles/cs334/tree/master/misc/module3/task1/ccamnote_esp32_controller).

The camera source code can be found [here](https://github.com/evankirkiles/cs334/tree/master/misc/module3/task1/ccamnote_esp32_camera).
