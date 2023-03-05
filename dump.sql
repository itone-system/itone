CREATE DATABASE itone
GO

USE itone
GO

CREATE TABLE dbo.Users(
	id bigint IDENTITY(1,1) PRIMARY KEY,
	Name varchar(100) NOT NULL
)
GO

INSERT INTO dbo.Users (Name)
VALUES 
('Julio Amourim');