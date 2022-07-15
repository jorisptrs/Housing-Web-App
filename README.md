# Kamernet Properties Web App

#### By Alexandru Dimofte, Maria Kapusheva, Jakub Łucki, and Joris Peters

# Project description

This project implements a web app to interact with a database of Kamernet properties through a RESTful API. The data is a subset of the Netherlands Rental Properties dataset available at [Kaggle](https://www.kaggle.com/juangesino/netherlands-rent-properties?select=properties.json) that resulted from crawling the Kamernet web site. The program was developped during the course Web Engineering taught at RuG.

## Running the web app

From the root directory:
```
docker-compose up
```
Access on `http://localhost:port` where the port is specified in the `.env` file.

## Troubleshooting

Most likely, the binary files in database are incompatible with your machine. To overcome this, delete all the files in `database/db` folder. Run `docker-compose up` one more time. Wait until the database is fully initialized with all the scripts loaded. Once this is done stop the containers by `Ctrl+C` and run `docker-compose up` once again.