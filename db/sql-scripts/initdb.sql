-- CREATE DATABASE queuing_system;
USE queuing_system;

CREATE TABLE Company (
	companyId CHAR(36),
	name VARCHAR(50) NOT NULL,
	PRIMARY KEY(companyId)
);

CREATE TABLE Office (
	officeId CHAR(36),
	officeName VARCHAR(70) NOT NULL,
	PRIMARY KEY(officeId)
);

CREATE TABLE CompanyOffice (
	companyId CHAR(36) NOT NULL,
	officeId CHAR(36) NOT NULL,
	PRIMARY KEY(companyId, officeId),
	FOREIGN KEY(companyId) REFERENCES Company(companyId) ON DELETE CASCADE,
	FOREIGN KEY(officeId) REFERENCES Office(officeId) ON DELETE CASCADE
);

CREATE TABLE User (
	userId CHAR(36),
	username VARCHAR(50) NOT NULL UNIQUE,
	password VARCHAR(72) NOT NULL,
	firstName VARCHAR(50) NOT NULL,
	lastName VARCHAR(50) NOT NULL,
	PRIMARY KEY(userId)
);

CREATE TABLE UserOffice (
	userId CHAR(36) NOT NULL,
	officeId CHAR(36) NOT NULL,
	PRIMARY KEY(userId, officeId),
	FOREIGN KEY(userId) REFERENCES User(userId) ON DELETE CASCADE,
	FOREIGN KEY(officeId) REFERENCES Office(officeId) ON DELETE CASCADE
);

CREATE TABLE Division (
	divisionName VARCHAR(50) NOT NULL,
  officeId CHAR(36) NOT NULL,
	numDesks INT NOT NULL,
	FOREIGN KEY(officeId) REFERENCES Office(officeId),
  PRIMARY KEY(divisionName, officeId)
);

CREATE TABLE DivisionDesk (
	number INT NOT NULL,
	divisionName VARCHAR(50) NOT NULL,
	officeId CHAR(36) NOT NULL,
	FOREIGN KEY(divisionName) REFERENCES Division(divisionName),
	FOREIGN KEY(officeId) REFERENCES Office(officeId),
	PRIMARY KEY(officeId, divisionName, number)
);

CREATE TABLE UserAtDivisionDesk(
	userId CHAR(36) NOT NULL,
	deskNumber INT NOT NULL,
	divisionName VARCHAR(50) NOT NULL,
	officeId CHAR(36) NOT NULL,
	FOREIGN KEY(userId) REFERENCES User(userId) ON DELETE CASCADE,
	FOREIGN KEY(officeId, divisionName, deskNumber) 
		REFERENCES DivisionDesk(officeId, divisionName, number) ON DELETE CASCADE,
	PRIMARY KEY(userId, deskNumber, divisionName, officeId),
	UNIQUE(userId), -- A user can only be at one desk at a time
	UNIQUE(officeId, divisionName, deskNumber) -- A desk can only sit one user at a time
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
	status ENUM(
		'Waiting', 
		'Served', 
		'No Show',
		'Serving' 
		-- Serving status should only be possible if the customer is at a desk
	) NOT NULL,
    
	PRIMARY KEY(customerId, officeId, divisionName),
	FOREIGN KEY(customerId) REFERENCES Customer(customerId) ON DELETE CASCADE,
	FOREIGN KEY(officeId, divisionName) REFERENCES Division(officeId, divisionName)
);

CREATE TABLE CustomerAtDivisionDesk	(
	customerId CHAR(36) NOT NULL,
	officeId CHAR(36) NOT NULL,
	divisionName VARCHAR(50) NOT NULL,
	deskNumber INT NOT NULL,
	FOREIGN KEY(customerId) REFERENCES Customer(customerId) ON DELETE CASCADE,
	FOREIGN KEY(officeId, divisionName, deskNumber) 
		REFERENCES DivisionDesk(officeId, divisionName, number),
	PRIMARY KEY(customerId, officeId, divisionName, deskNumber),
	UNIQUE(customerId), -- A customer can only be at one desk at a time
	UNIQUE(officeId, divisionName, deskNumber) -- A desk can only sit one customer at a time
);

CREATE TABLE CustomerDivisionTimeCalled (
	customerId CHAR(36) NOT NULL,
	divisionName VARCHAR(50) NOT NULL,
	officeId CHAR(36) NOT NULL,
  timeCalled DATETIME NOT NULL,
    
	PRIMARY KEY(customerId, divisionName, timeCalled, officeId),
	FOREIGN KEY(customerId, officeId, divisionName) 
		REFERENCES CustomerDivision(customerId, officeId, divisionName) ON DELETE CASCADE
);

SHOW TABLES IN queuing_system;
-- SELECT c.customerId, c.checkInTime, c.divisionId, c.firstName, c.lastName FROM Customer AS c;

INSERT INTO Company (companyId, name) VALUES 
('1056zz0c-c844-11ee-851b-4529fd7b70be', 'P&H MGMT LC');

-- Inserting dummy values into Office table
INSERT INTO Office (officeId, officeName) VALUES 
('1056cc0c-c844-11ee-851b-4529fd7b70be', 'Troy License Office');
-- P&H MGMT is the name of the company
-- TODO: Should be in the company table once it's created

INSERT INTO CompanyOffice (companyId, officeId) VALUES 
('1056zz0c-c844-11ee-851b-4529fd7b70be', '1056cc0c-c844-11ee-851b-4529fd7b70be');

-- Inserting dummy values into Division table
INSERT INTO Division (divisionName, officeId, numDesks) VALUES 
('Motor Vehicle', '1056cc0c-c844-11ee-851b-4529fd7b70be', 4),
('Driver License', '1056cc0c-c844-11ee-851b-4529fd7b70be', 2);

-- Inserting dummy values into Customer table
-- INSERT INTO Customer (customerId, fullName, checkInTime) VALUES
-- ('1056cc0c-c844-11ee-851b-4529fd7b70be', 'John Doe', NOW()),
-- ('1056d5d0-c844-11ee-851b-4529fd7b70be', 'Jane Smith', NOW()),
-- ('1056d7a6-c844-11ee-851b-4529fd7b70be', 'Michael Johnson', NOW()),
-- ('1056d904-c844-11ee-851b-4529fd7b70be', 'Emily Brown', NOW());

-- Inserting dummy values into CustomerDivision table
-- INSERT INTO CustomerDivision (customerId, divisionName, officeId, status, waitingListIndex) VALUES
-- ('1056cc0c-c844-11ee-851b-4529fd7b70be', 'Motor Vehicle', '1056cc0c-c844-11ee-851b-4529fd7b70be', 'Waiting', 1),
-- ('1056d5d0-c844-11ee-851b-4529fd7b70be', 'Motor Vehicle', '1056cc0c-c844-11ee-851b-4529fd7b70be', 'Desk 1', NULL),
-- ('1056d7a6-c844-11ee-851b-4529fd7b70be', 'Driver License', '1056cc0c-c844-11ee-851b-4529fd7b70be', 'Waiting', 1),
-- ('1056d904-c844-11ee-851b-4529fd7b70be', 'Driver License', '1056cc0c-c844-11ee-851b-4529fd7b70be', 'No Show', NULL);

-- Inserting dummy values into CustomerDivisionTimeCalled table
-- INSERT INTO CustomerDivisionTimeCalled (customerId, divisionName, officeId, timeCalled) VALUES
-- ('1056d5d0-c844-11ee-851b-4529fd7b70be', 'Motor Vehicle', '1056cc0c-c844-11ee-851b-4529fd7b70be', NOW()),
-- ('1056d7a6-c844-11ee-851b-4529fd7b70be', 'Driver License', '1056cc0c-c844-11ee-851b-4529fd7b70be', NOW());

SELECT VERSION();
