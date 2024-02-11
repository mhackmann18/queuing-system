-- CREATE DATABASE queuing_system;
USE queuing_system;

CREATE TABLE DIVISION (
	divisionId VARCHAR(36) NOT NULL,
	divisionName VARCHAR(50) NOT NULL,
    
    PRIMARY KEY(divisionId)
);

CREATE TABLE CUSTOMER (
	customerId VARCHAR(36) NOT NULL,
    fullName VARCHAR(50) NOT NULL,
    checkInTime DATETIME NOT NULL,

    PRIMARY KEY(customerId)
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

SHOW TABLES IN queuing_system;
-- SELECT c.customerId, c.checkInTime, c.divisionId, c.firstName, c.lastName FROM Customer AS c;

-- Inserting dummy values into DIVISION table
INSERT INTO DIVISION (divisionId, divisionName) VALUES 
(UUID(), 'Motor Vehicle'),
(UUID(), 'Drivers License');

-- Inserting dummy values into CUSTOMER table
INSERT INTO CUSTOMER (customerId, fullName, checkInTime) VALUES
('1056cc0c-c844-11ee-851b-4529fd7b70be', 'John Doe', NOW()),
('1056d5d0-c844-11ee-851b-4529fd7b70be', 'Jane Smith', NOW()),
('1056d7a6-c844-11ee-851b-4529fd7b70be', 'Michael Johnson', NOW()),
('1056d904-c844-11ee-851b-4529fd7b70be', 'Emily Brown', NOW());

-- Inserting dummy values into CUSTOMERDIVISION table
INSERT INTO CUSTOMERDIVISION (customerId, divisionId, status, waitingListIndex) VALUES
('1056cc0c-c844-11ee-851b-4529fd7b70be', (SELECT divisionId FROM DIVISION WHERE divisionName = 'Motor Vehicle'), 'Waiting', 1),
('1056d5d0-c844-11ee-851b-4529fd7b70be', (SELECT divisionId FROM DIVISION WHERE divisionName = 'Motor Vehicle'), 'Serving', NULL),
('1056d7a6-c844-11ee-851b-4529fd7b70be', (SELECT divisionId FROM DIVISION WHERE divisionName = 'Drivers License'), 'Waiting', 1),
('1056d904-c844-11ee-851b-4529fd7b70be', (SELECT divisionId FROM DIVISION WHERE divisionName = 'Drivers License'), 'No Show', NULL);

-- Inserting dummy values into CUSTOMERDIVISIONTIMECALLED table
INSERT INTO CUSTOMERDIVISIONTIMECALLED (customerId, divisionId, timeCalled) VALUES
('1056d5d0-c844-11ee-851b-4529fd7b70be', (SELECT divisionId FROM DIVISION WHERE divisionName = 'Motor Vehicle'), NOW() - INTERVAL 5 MINUTE),
('1056d7a6-c844-11ee-851b-4529fd7b70be', (SELECT divisionId FROM DIVISION WHERE divisionName = 'Drivers License'), NOW() - INTERVAL 10 MINUTE);


SELECT VERSION();



