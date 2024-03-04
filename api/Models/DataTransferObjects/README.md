# Data Transfer Objects

This directory contains the Data Transfer Objects (DTOs) used in the API.

## Overview

DTOs are objects that carry data between different layers of an application. They are commonly used to transfer data between the API and the client. In this application, these DTOs define the exact format of the response data. For example, the data sent from the API to the client in the GET /api/v1/customers endpoint is an array of CustomerDto objects. If an endpoint returns customers, they'll all match the format of the CustomerDto, offices will be OfficeDtos, Users will be UserDtos, etc. When consuming this API, this directory can serve as a helpful resource for determining the shape of data recieved from the server.
