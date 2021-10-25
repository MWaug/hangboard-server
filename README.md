# HangOnIt Backend and MQTT

See https://github.com/MWaug/hangboard-app for a system diagram and information about this open source hangboard project.

# Setup and Run

The hangboard Node backend and MQTT server run inside docker containers.
To launch all the backend components
install [Docker](https://www.docker.com) and run

```bash
docker-compose -f docker-compose-esp-mock.yml up
```

This will also launch a hangboard emulator that creates example MQTT traffic and can be used for testing.
