-- @BLOCK
CREATE DATABASE kamernet_properties;
USE kamernet_properties;
-- @BLOCK
-- Create table containing cities
CREATE TABLE Cities(
    cityID INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE Locations(
    locationID INT PRIMARY KEY AUTO_INCREMENT,
    longitute DECIMAL(12,10),
    latitude DECIMAL(12,10),
    cityID INT,
    CONSTRAINT FK_cityID FOREIGN KEY (cityID)     
        REFERENCES Cities (cityID)
);

-- Create table containing costs
CREATE TABLE Costs(
    costID INT PRIMARY KEY AUTO_INCREMENT,
    -- The highest allowed value for rent, additonalCost and deposit is 9,999,999.99 euro
    rent DECIMAL(9, 2),
    additionalCosts DECIMAL(9, 2),
    deposit DECIMAL(9, 2)
);

CREATE TABLE Properties(
    propertyID VARCHAR(255) PRIMARY KEY,
    isRoomActive BOOLEAN,
    areaSqm INT,
    gender VARCHAR(15),
    furnished BOOLEAN,
    coverImageUrl VARCHAR(255),
    costID INT,
    CONSTRAINT FK_costID FOREIGN KEY (costID)     
        REFERENCES Costs (costID),
    locationID INT,
    CONSTRAINT FK_locationID FOREIGN KEY (locationID)     
        REFERENCES Locations (locationID)
);


-- @BLOCK
LOAD DATA INFILE 'cities.csv'
INTO TABLE City
FIELDS TERMINATED BY ','
LINES TERMINATED BY '\n'
SET id = NULL
