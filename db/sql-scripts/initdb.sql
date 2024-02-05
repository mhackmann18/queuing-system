CREATE SCHEMA queuing_system;
USE queuing_system;

CREATE TABLE CUSTOMER (
	customerId VARCHAR(36) NOT NULL,
    divisionId VARCHAR(36) NOT NULL,
    firstName VARCHAR(50) NOT NULL,
	lastName VARCHAR(50) NOT NULL,
    checkInTime DATETIME NOT NULL,

    PRIMARY KEY(customerId),
    FOREIGN KEY(divisionId) REFERENCES DIVISION(divisionId)
);

CREATE TABLE DIVISION (
	divisionId VARCHAR(36) NOT NULL,
	divisionName VARCHAR(50) NOT NULL,
    
    PRIMARY KEY(divisionId)
);

CREATE TABLE CUSTOMERDIVISION (
	customerId VARCHAR(36) NOT NULL,
	divisionId VARCHAR(36) NOT NULL,
	status ENUM('Waiting', 'Serving', 'Served', 'No Show') NOT NULL,
	waitingListIndex INT,
    
    PRIMARY KEY(customerId, divisionId),
	FOREIGN KEY(customerId) REFERENCES CUSTOMER(customerId),
	FOREIGN KEY(divisionId) REFERENCES DIVISION(divisionId)
);

CREATE TABLE CUSTOMERDIVISIONTIMECALLED (
	customerId VARCHAR(36) NOT NULL,
	divisionId VARCHAR(36) NOT NULL,
    timeCalled DATETIME NOT NULL,
    
	PRIMARY KEY(customerId, divisionId, timeCalled),
	FOREIGN KEY(customerId) REFERENCES CUSTOMER(customerId),
	FOREIGN KEY(divisionId) REFERENCES DIVISION(divisionId)
);


SELECT c.customerId, c.checkInTime, c.divisionId, c.firstName, c.lastName FROM Customers AS c;

SELECT VERSION();



