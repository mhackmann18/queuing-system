-- CREATE DATABASE queuing_system; -- This is done in the Dockerfile
USE queuing_system;

CREATE TABLE Company (
	id CHAR(36),
	name VARCHAR(50) NOT NULL,
	PRIMARY KEY(id)
);

CREATE TABLE Office (
	id CHAR(36),
	name VARCHAR(70) NOT NULL,
	timezone VARCHAR(32) NOT NULL,
	PRIMARY KEY(id)
);

CREATE TABLE CompanyOffice (
	companyId CHAR(36) NOT NULL,
	officeId CHAR(36) NOT NULL,
	PRIMARY KEY(companyId, officeId),
	FOREIGN KEY(companyId) REFERENCES Company(id) ON DELETE CASCADE,
	FOREIGN KEY(officeId) REFERENCES Office(id) ON DELETE CASCADE
);

CREATE TABLE User (
	id VARCHAR(36),
	PRIMARY KEY(id)
);

CREATE TABLE UserOffice (
	userId VARCHAR(36) NOT NULL,
	officeId CHAR(36) NOT NULL,
	PRIMARY KEY(userId, officeId),
	FOREIGN KEY(userId) REFERENCES User(id) ON DELETE CASCADE,
	FOREIGN KEY(officeId) REFERENCES Office(id) ON DELETE CASCADE
);

CREATE TABLE Division (
	name VARCHAR(50) NOT NULL,
  officeId CHAR(36) NOT NULL,
	maxNumberOfDesks INT NOT NULL,
	FOREIGN KEY(officeId) REFERENCES Office(id) ON DELETE CASCADE,
  PRIMARY KEY(name, officeId)
);

CREATE TABLE Desk (
	number INT NOT NULL,
	divisionName VARCHAR(50) NOT NULL,
	divisionOfficeId CHAR(36) NOT NULL,
	FOREIGN KEY(divisionOfficeId, divisionName) REFERENCES Division(officeId, name) ON DELETE CASCADE,
	PRIMARY KEY(divisionOfficeId, divisionName, number)
);

CREATE TABLE UserAtDesk(
	userId VARCHAR(36) NOT NULL,
	deskNumber INT NOT NULL,
	deskDivisionName VARCHAR(50) NOT NULL,
	deskDivisionOfficeId CHAR(36) NOT NULL,
	sessionEndTime DATETIME NOT NULL,
	FOREIGN KEY(userId) REFERENCES User(id) ON DELETE CASCADE,
	-- TODO: Consider what should happen if desk is deleted
	FOREIGN KEY(deskDivisionOfficeId, deskDivisionName, deskNumber) 
		REFERENCES Desk(divisionOfficeId, divisionName, number), 
	PRIMARY KEY(userId, deskNumber, deskDivisionName, deskDivisionOfficeId),
	UNIQUE(userId), -- A user can only be at one desk at a time
	UNIQUE(deskDivisionOfficeId, deskDivisionName, deskNumber) -- A desk can only sit one user at a time
);

CREATE TABLE Customer (
	id CHAR(36) NOT NULL,
	fullName VARCHAR(100) NOT NULL,
	checkInTime DATETIME NOT NULL,
	PRIMARY KEY(id)
);

CREATE TABLE CustomerDivision (
	customerId CHAR(36) NOT NULL,
	divisionName VARCHAR(50) NOT NULL,
	divisionOfficeId CHAR(36) NOT NULL,
	waitingListIndex INT,
	status ENUM(
		'Waiting', 
		'Served', 
		'No Show',
		'Desk 1',
		'Desk 2',
		'Desk 3',
		'Desk 4' 
		-- Serving status should only be possible if the customer is at a desk
	) NOT NULL,
	PRIMARY KEY(customerId, divisionName, divisionOfficeId),
	FOREIGN KEY(customerId) REFERENCES Customer(id) ON DELETE CASCADE,
	FOREIGN KEY(divisionOfficeId, divisionName) REFERENCES Division(officeId, name)
);

CREATE TABLE CustomerAtDesk	(
	customerId CHAR(36) NOT NULL,
	deskDivisionOfficeId CHAR(36) NOT NULL,
	deskDivisionName VARCHAR(50) NOT NULL,
	deskNumber INT NOT NULL,
	FOREIGN KEY(customerId) REFERENCES Customer(id) ON DELETE CASCADE,
	FOREIGN KEY(deskDivisionOfficeId, deskDivisionName, deskNumber) 
		REFERENCES Desk(divisionOfficeId, divisionName, number),
	PRIMARY KEY(customerId, deskDivisionOfficeId, deskDivisionName, deskNumber),
	UNIQUE(customerId), -- A customer can only be at one desk at a time
	UNIQUE(deskDivisionOfficeId, deskDivisionName, deskNumber) -- A desk can only serve one customer at a time
);

CREATE TABLE CustomerDivisionTimeCalled (
	customerDivisionCustomerId CHAR(36) NOT NULL,
	customerDivisionDivisionName VARCHAR(50) NOT NULL,
	customerDivisionDivisionOfficeId CHAR(36) NOT NULL,
  timeCalled DATETIME NOT NULL,
    
	PRIMARY KEY(
		customerDivisionCustomerId, 
		customerDivisionDivisionName, 
		customerDivisionDivisionOfficeId, 
		timeCalled),
	FOREIGN KEY(
    customerDivisionCustomerId, 
		customerDivisionDivisionName,
    customerDivisionDivisionOfficeId) 
		REFERENCES CustomerDivision(customerId, divisionName, divisionOfficeId) ON DELETE CASCADE
);

SHOW TABLES IN queuing_system;
-- SELECT c.customerId, c.checkInTime, c.divisionId, c.firstName, c.lastName FROM Customer AS c;

INSERT INTO Company (id, name) VALUES 
('1056zz0c-c844-11ee-851b-4529fd7b70be', 'P&H MGMT LC');

-- Inserting dummy values into Office table
INSERT INTO Office (id, name, timezone) VALUES 
('1056cc0c-c844-11ee-851b-4529fd7b70be', 'Troy License Office', 'America/Chicago');
-- P&H MGMT is the name of the company
-- TODO: Should be in the company table once it's created

INSERT INTO CompanyOffice (companyId, officeId) VALUES 
('1056zz0c-c844-11ee-851b-4529fd7b70be', '1056cc0c-c844-11ee-851b-4529fd7b70be');

-- Inserting dummy values into Division table
INSERT INTO Division (name, officeId, maxNumberOfDesks) VALUES 
('Motor Vehicle', '1056cc0c-c844-11ee-851b-4529fd7b70be', 4),
('Driver License', '1056cc0c-c844-11ee-851b-4529fd7b70be', 2);

-- Inserting dummy values into Desk table
INSERT INTO Desk (divisionName, divisionOfficeId, number) VALUES 
('Motor Vehicle', '1056cc0c-c844-11ee-851b-4529fd7b70be', 1),
('Motor Vehicle', '1056cc0c-c844-11ee-851b-4529fd7b70be', 2),
('Motor Vehicle', '1056cc0c-c844-11ee-851b-4529fd7b70be', 3),
('Motor Vehicle', '1056cc0c-c844-11ee-851b-4529fd7b70be', 4),
('Driver License', '1056cc0c-c844-11ee-851b-4529fd7b70be', 1),
('Driver License', '1056cc0c-c844-11ee-851b-4529fd7b70be', 2);

SELECT VERSION();
