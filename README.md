
<img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" /> <img src="https://img.shields.io/badge/JavaScript-323330?style=for-the-badge&logo=javascript&logoColor=F7DF1E" /> <img src="https://img.shields.io/badge/Ubuntu-E95420?style=for-the-badge&logo=ubuntu&logoColor=white" /> <img src="https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white" />

## Purpose
Implement horizontal partitioning through PostgreSQL.

## Functionality
Creates 100 partitions for a database with 1 billion data.<br>
Each table will contain 10M data, serialized with data-id.

## How to use this repository

### 1. Install all dependencies<br>
```npm install```

### 2. Please make sure you've spun up docker's PostgreSQL through the following command:<br>
```docker run --name [container_name] -e POSTGRES_PASSWORD=[password] -p [container_port]:[localhost_port] -d [image_name]```<br>
ex. docker run --name pg -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres

### 3. Run create_partitions.js
Run this command in the terminal
```node create_partitions.js```

Get into the container's command line interface<br>
```docker exec -it [container_name] psql -U [username] -d [database]```
ex. docker exec -it pg_partition psql -U postgres -d customers

Describe customers<br>
```\d customers```

Show all customers partitions<br>
```\d+ customers```

Testing<br>
select * from customers_0_10000000 limit 10

### 4. Run populate_customers.js
Run this command in the terminal
```node populate_customers.js```
