-- CREATE DATABASE queuing_system;
USE queuing_system;

CREATE TABLE Office (
	officeId CHAR(36),
	officeName VARCHAR(70) NOT NULL,
	PRIMARY KEY(officeId)
);

CREATE TABLE Division (
	divisionName VARCHAR(50) NOT NULL,
  officeId CHAR(36) NOT NULL,
	numDesks INT NOT NULL,
	FOREIGN KEY(officeId) REFERENCES Office(officeId),
  PRIMARY KEY(divisionName, officeId)
);

CREATE TABLE Customer (
	customerId CHAR(36) NOT NULL,
	fullName VARCHAR(100) NOT NULL,
	checkInTime DATETIME NOT NULL,

	PRIMARY KEY(customerId)
);

CREATE TABLE CustomerDivision (
	customerId CHAR(36) NOT NULL,
	officeId CHAR(36) NOT NULL,
	divisionName VARCHAR(50) NOT NULL,
	waitingListIndex INT,
	status ENUM('Waiting', 'Serving', 'Served', 'No Show') NOT NULL,
    
	PRIMARY KEY(customerId, officeId, divisionName),
	FOREIGN KEY(customerId) REFERENCES Customer(customerId),
	FOREIGN KEY(divisionName) REFERENCES Division(divisionName),
	FOREIGN KEY(officeId) REFERENCES Office(officeId)
);

CREATE TABLE CustomerDivisionTimeCalled (
	customerId CHAR(36) NOT NULL,
	divisionName VARCHAR(50) NOT NULL,
	officeId CHAR(36) NOT NULL,
  timeCalled DATETIME NOT NULL,
    
	PRIMARY KEY(customerId, divisionName, timeCalled, officeId),
	FOREIGN KEY(customerId) REFERENCES Customer(customerId),
	FOREIGN KEY(officeId) REFERENCES Office(officeId),
	FOREIGN KEY(divisionName) REFERENCES Division(divisionName)
);

SHOW TABLES IN queuing_system;
-- SELECT c.customerId, c.checkInTime, c.divisionId, c.firstName, c.lastName FROM Customer AS c;

-- Inserting dummy values into Office table
INSERT INTO Office (officeId, officeName) VALUES 
('1056cc0c-c844-11ee-851b-4529fd7b70be', 'DMV Office 1'),
('1056d5d0-c844-11ee-851b-4529fd7b70be', 'DMV Office 2');

-- Inserting dummy values into Division table
INSERT INTO Division (divisionName, officeId, numDesks) VALUES 
('Motor Vehicle', '1056cc0c-c844-11ee-851b-4529fd7b70be', 4),
('Drivers License', '1056cc0c-c844-11ee-851b-4529fd7b70be', 2),
('Motor Vehicle', '1056d5d0-c844-11ee-851b-4529fd7b70be', 4),
('Drivers License', '1056d5d0-c844-11ee-851b-4529fd7b70be', 2);

-- Inserting dummy values into Customer table
INSERT INTO Customer (customerId, fullName, checkInTime) VALUES
('1056cc0c-c844-11ee-851b-4529fd7b70be', 'John Doe', NOW()),
('1056d5d0-c844-11ee-851b-4529fd7b70be', 'Jane Smith', NOW()),
('1056d7a6-c844-11ee-851b-4529fd7b70be', 'Michael Johnson', NOW()),
('1056d904-c844-11ee-851b-4529fd7b70be', 'Emily Brown', NOW());

-- Inserting dummy values into CustomerDivision table
INSERT INTO CustomerDivision (customerId, divisionName, officeId, status, waitingListIndex) VALUES
('1056cc0c-c844-11ee-851b-4529fd7b70be', 'Motor Vehicle', '1056cc0c-c844-11ee-851b-4529fd7b70be', 'Waiting', 1),
('1056d5d0-c844-11ee-851b-4529fd7b70be', 'Motor Vehicle', '1056cc0c-c844-11ee-851b-4529fd7b70be', 'Serving', NULL),
('1056d7a6-c844-11ee-851b-4529fd7b70be', 'Drivers License', '1056cc0c-c844-11ee-851b-4529fd7b70be', 'Waiting', 1),
('1056d904-c844-11ee-851b-4529fd7b70be', 'Drivers License', '1056cc0c-c844-11ee-851b-4529fd7b70be', 'No Show', NULL);

-- Inserting dummy values into CustomerDivisionTimeCalled table
INSERT INTO CustomerDivisionTimeCalled (customerId, divisionName, officeId, timeCalled) VALUES
('1056d5d0-c844-11ee-851b-4529fd7b70be', 'Motor Vehicle', '1056cc0c-c844-11ee-851b-4529fd7b70be', NOW()),
('1056d7a6-c844-11ee-851b-4529fd7b70be', 'Drivers License', '1056cc0c-c844-11ee-851b-4529fd7b70be', NOW());


SELECT VERSION();
