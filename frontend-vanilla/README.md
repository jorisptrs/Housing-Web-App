# Vanilla JS Rental Properties API frontend

This directory contains our implementation of a the Rental Properties API frontend, using the API as specified in `../specification/spec.yml`.

## Getting started

The simplest way of getting going for development purposes is still running the webserver inside of a Docker container.

```bash
docker run --rm -p <XXXX>:80 --mount type=bind,source=$(pwd),target=/usr/share/nginx/html -d nginx
```

This means: start a docker container from the image `nginx` (running the nginx webserver) on port `<XXXX>` (replace with your own port number), where we bind mount the files in the current folder to the webserver path. Run the container in the background (`-d`) and make sure to clean it up after it stops/crashes (`--rm`).

Now, you should be able to see the docker container when running `docker ps`, you can stop it by running `docker stop <name>` where the name is the one you see in `docker ps`. You should also be able to access the application by navigating to `localhost:XXXX` in your browser.
