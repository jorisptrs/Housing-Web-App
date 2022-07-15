## Running

A MySQL-compatible database. One option is to run the database in Docker using `docker-compose up mariadb` in the base directory. The relevant details are the host and port (usually `localhost` and `3306`), the database name (`properties` for the one in Docker) and the username/password of an account with access to that database (`mariadb`/`mariadb` for the one in Docker).
- NVM (Node Version Manager) to install the correct node version to use in this project specifically. Installation instructions [here](https://github.com/nvm-sh/nvm), you should be able to run `nvm --version` and have a version >=2.x.x.

The first step is to actually install the correct Node version by running `nvm install` and `nvm use`. Then, possibly adjusting the parameters of the `.env` file to match what you have set up yourself. The example values are sufficient for the database started through Docker.
