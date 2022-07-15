# Components

Four main subcomponents may be identified within this project: API-Design, Backend, Database, and Frontend. The design-choices are described below. For the 
The API documentation in OpenAPI 3.x format may be found in `specification/spec.yml`.

# Architecture and Implementation

## API-design
With our API design we aimed to provide all required functionallity to request, update and delete a rental property and its features based on the location, cost and its characteristics. In order to do so we implemented the following schemas:
<ol>
  
  <li> City: This schema represents a City object and it contains the id of the city, its name and the list of properties that correspond to this location.</li>

  <li> CitySummary: This is another location-oriented schema that includes the id of the city and its name. Unlike City it does not include the list of properties, thus it is used as a property of the rental properties.</li>

  <li> Statistics: This schema contains all of the relevant statistics related information for the users such as mean, median and standard deviation for the rent and the deposit. We decided to include it as a separate object, because our statistics are dynamically calculated in our backend.</li>

  <li> Property: This is the Property object and it includes all of the available information for a rental property. Additionally, the CitySummary object here is part of the location-oriented properties in this schema.</li>

  <li> PropertySummary: This object includes brief information about a single rental property, such as its id, rent and the name of the city in which it is located.</li>

</ol>

Additionally, we implemented 10 filters, which select or order properties based on different criteria. 

We divided our endpoints by classifying them either as city-oriented(tag:Cities) or property-oriented(tag:Properties). Our Cities endpoints serve to retreive information from our database and are the following:
<ol>

  <li> /cities - GET
This endpoint retreives the list of available cities from our database. </li>

  <li> /city/{id}/properties - GET
This enpoint retrieves top N properties in a given city. It includes filters to set the value of N, order by a specific criteria and show the results in a specific direction, selecting only the active rental prop setting a budget for the rent(min and max rent), and choosing other characteristics such as the gender of the inhabitants for the shared properties and if the room should be furnished or not.</li>

  <li> /city/{id}/statistics - GET
This endpoint retreives the statistics of the rent and the deposit for all properties in a given city using the Statistics object in our schemas. </li>
</ol>

Our Properties endpoints include:

<ol>
  <li> /properties - GET
Retreives all properties on a specific longitude and latitude</li>

  <li> /properties - PUT
This endpoint serves to update all properties on a specific longitude and latitude.</li>

  <li> /properties - DELETE
This deletes a all properties on a specific longitude and latitude. </li>

  <li> /properties - POST
This endpoint creates a new property object. The schema that is used is Property.</li>

  <li> /properties/{propertyID} - GET
This endpoint retrieves a property based on a given id. The return value is a Property Object.</li>

  <li> /properties/{propertyID} - PUT
Updates a property based on its id. Te request body is a Property object.</li>

  <li> /properties/{propertyID} - DELETE
Deletes a property given its id.</li>

  <li> /properies/{propertyID}/coverImageUrl - GET
Retrieves the URL of the cover image of a specific property based on the property id. This was an addition beyond the base requirements.</li>

  <li> /properies/{propertyID}/coverImageUrl - DELETE
Deletes the URL of the cover image of a property given the property id. This was an addition beyond the base requirements.</li>
</ol>

All of our endpoints support both JSON and CSV.

## Backend
The backend was designed using the MVC (Model-View-Controller) pattern. Since it implements an API, the "View" is only the data model used in the API requests/responses as provided in the `api-models` directory. The model as provided in `models` provides the database model classes and coincides with those models of the sql database. The controller is as provided in `controllers` implemets the user interactions with the database. The backend is written in TypeScript instead of "traditional" JavaScript to provide type-safety and to have some nicer language features to our disposal, such as decorations (annotations/attributes) and easy type validations. Additional modules like the routing and the `server.ts` provide the necessary serving functionality.

### Serving requests
The construction of the server is done in the `server.ts` file. The Express backend framework was used instead of a simple http library to make use of, among others, the chaining of modules like body parsing (for json and csv). When a request arrives it is rerouted to the main router which, in turn, reroutes it to the appropriate city- or property-route. This makes handling requests more organized. In the latter two files, you can observe which controller-functions are called for the different endpoints described in the API-specification.

### Controller
From the routes, the controller function processes the requests. It handles all application logic and has no access to the DB implementation details, such that changing the db schemes don't require controller modifications. As a first (and last) step, to enable csv-support, the controller methods that handle requests with a body (these are the ones with the option for csv-content) convert between JSON and CSV using two methods written in `helpers.ts`. We, thus, chose only operate on JSON and convert all csv to it during processing. As a potential step, the requested information is validated which is conveniently done by specifying the constraints in TypeOrm's class-validator (see '@' tags in the api-models). Apart from input validation, TypeOrm was used to simplify the interactions between model and view; it provides a typesafe conversion of object-oriented operations to SQL queries and vice versa.

Next, the JSON object, path parameters, and query parameters are then used by the corresponding controller functions to create the database query using the TypeOrm module. The sql-requests by the controller to the model (database) are done by white-listing only the needed properties, avoiding security issues; each db-query only contains what is needed for the functionality of the corresponding api request. After the db queries queries were made, a response containing infromation about success or failure and, possibly, data changes in the database.

### Api-model (view):
Throught the process, the Api-models define how the data is layed out as the API-user sees it. Each of the models (See API-design section) features a public conversion method to construct the API-model from a database-model.

### Model:
Meanwhile, the model component specifies for TypeOrm how the data is layed out in the databas, and, thus, coincides with the representation of the database.

## Database

The dataset is well structured therefore we used an SQL database (as opposed to a no-sql db). We decided to use a MariaDB to manage our database, since it is compatible with MySQL and we found its docker image to be more clear than MySQL's. Docker stores the database files in a `database/db` folder as an external volume. Database's credentials are configured via `.env`.

In order to initilize the create and fill the database itself we use the files in `database/sql`. 
<ol>
  <li> `User.sql` - This file contains global settings which are supposed to increase the buffer size, time and space limit. This is done to enable large inserts in the next files.</li>
  <li> `Cities.sql` - This file defines a table "Cities" representing all available cities and contains statement which inserts all rows containing cities' data.</li>
  <li> `Properties.sql` - This file defines a table "Properties" representing all properties and contains statement which inserts all rows containing properties' data.</li>
</ol>

The insert statements were generated using the Jupyter Notebook `data-loading.ipynb` in `database/utilities`. We used it to transform json file with the original dataset into SQL insert statements. Moreover, we used it to clean the dataset by getting rid of `null` values. With integer values such as `rent` or `additionalCost` we changed them into 0s. In categorical fields such as `Furnished` we introduced a category `Unknown` to replace missing values. In boolean fields we changed missing values into `false`.

Our database contains two tables for practical reasons: "Cities" and "Properties". However, conceptually it contains four: "Cities", "Properties", "Location" and "Cost". "Cost" has one-to-one relation with the "Properties" and "Location" almost has one-to-one relation (meaning that sometimes there are few properties at the same location, but it is rare and only few properties are affected). Therefore, we decided that incorporating these tables just as additional variables into table "Property" would be the best solution. They conceptual classes are highlighed by prefixes "Cost_" and "Location_".0s

Table "Cities" contain names of the cities and their id (primary key).

Conceptual table "Cost" contains amount of `Rent`, `AdditionalCosts`, `Deposit` and `RentPerAreaSqm`.

Conceptual table "Location" contains geographical coordinates: `Latitude` and `Longitude`.

Table "Properties" contains indicator whether a room is active (`isRoomActive`), gender of desired locator (`gender`), indicator of how the property is furnished (`furnished`), url to cover image of a certain property (`coverImageUrl`). On top of that it contains the two abovementioned conceptual tables. Ultimately, "Properties" have a many-to-one relation with "Cities" table under a name `cityId`.


## Frontend
A front-end was built using vanilla JS without any third-party libraries. In order to make the application more intuitive to use, we segmented the structure of the webpages. For this purpose we use four interlinked HTML files and we are showing in separate pages the initial page, the detailed property overview, the list of properties when the city has been selected and the list of properties which share the same longitude and latitude. This integrates very well with our API in terms of displaying the rental properties, as we are able to show summarized overview when the properties are presented as search results. Additionally we also offer detailed information when the user clicks on a property from the list. An additional google maps api was used to visualize the location.

In our HTML files we use templates to create the structure, which are defined in the components files. The JavaScript code is distributed in the following way:

- api:
Includes files call.js, cities.js, properties.js, which send requests to our api. They are separated in a similar way as the API endpoints - cities.js is used for city-oriented requests(tag: Cities) and properties.js is for property-oriented requests(tag: Properties). The function call.js makes a request to the API to the URL thats given.

- components:
The files here define the templates that are used in our html code.

- models:
Includes the files city.js, property-summary.js, property.js and statistics.js. The model files serve as a frontend representation of the data that has been requested from the API, thus they correspond respectively to the objects in our API schemas.

- storage:
The storage includes property-filter-storage.js, which has the purpose of storing the filter information that has been selected by the user.

# potential issues that they to be aware of when adopting the API

When /db folder (which contains the database files) is empty and docker compose up is called there will be connection error thrown by backend container. The issue is that the db container is initialized first (since it is a dependency of backend) but its initialization with all the SQL files to be loaded takes a while, in the meantime docker "thinks" that everything is already up an ready so it initializes backend which throws an error. To overcome it it is enough to run `docker compose up` command once, wait until database is loaded. Then run `docker compose up` one more time.

# Running the application & Accessing the applications

There are two main ways to run the application with all its components: using Docker, or manually on your local machine. The Docker instructions are provided in the README.md file. Its settings configured like important ports are listed in the `.env` file. During execution, its values are passed by Docker on to the environment variables used by front- and backend and the database. For the second option, of running the components manually, please consult the respective subfolders. You can also find instructions on how to access the application in the main README.md.

# Work distribution

Throught the course everyone had their main responsibilities but we were all informed about eachother's progress and we organised weekly meetings on Discord. We used Notion project created by Joris to organize our tasks. The initial data preprocessing was handled by Maria. She and Alex implemented the API, but everyone agreed on the design and the endpoints that we should focus on. The database was implemented by Jakub. Joris focused on the backend design and implementation. The frontend was implemented by Alex with the help of Maria. Everyone contributed to the error-handling of eachother's parts and the report.
