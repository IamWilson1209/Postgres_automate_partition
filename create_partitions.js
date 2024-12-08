import pg from 'pg';
/*
This script creates { 100 } partitions 
then attaches them to main table "customers"

Please make sure you've spin up docker's postgresql through following command:
# docker run --name pg -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres

The run this command in terminal
# node create_partitions.mjs
*/
async function createPartitions() {
  try {
    /* 1. Connecting to PostgreSQL using pg.Client */
    const dbClientPostgres = new pg.Client({
      user: 'postgres',
      password: 'postgres',
      host: 'localhost',
      port: 5432,
      database: 'postgres', // Connect to "postgres"
    });
    console.log('Connecting to postgres database...');
    await dbClientPostgres.connect();

    /* Dropping existing database if needed, not recommend in real word case */
    // console.log('Dropping database customers...');
    // await dbClientPostgres.query("drop database customers")

    /* Start creating fake customer data */
    console.log('Start creating database customers...');
    await dbClientPostgres.query('create database customers');

    /* 2. Connecting to customer database using pg.Client */
    const dbClientCustomers = new pg.Client({
      user: 'postgres',
      password: 'postgres',
      host: 'localhost',
      port: 5432,
      database: 'customers', // Connect to "customer" database
    });
    console.log('Connecting to customers db...');
    await dbClientCustomers.connect();

    /* 3. Create customers table with range partitioning */
    console.log('Creating customers table...');
    // id: serial(auto increment), name: text
    const sql = `create table customers (id serial, name text) 
                 partition by range (id)`;
    await dbClientCustomers.query(sql);
    console.log('Creating partitions... ');
    /*
    Make this database support 1 Billion customers
    each partition will have 10M customers 
    that gives 1000/10 -> 100 partition tables 
    */
    for (let partition_i = 0; partition_i < 100; partition_i++) {
      const idFrom = partition_i * 10000000;
      const idTo = (partition_i + 1) * 10000000;
      const partitionName = `customers_${idFrom}_${idTo}`;

      /* Create customer table for each partition */
      const psql1 = `create table ${partitionName}
                         (like customers including indexes)`;

      /* Attach customers just created to different partitions */
      const psql2 = `alter table customers
            attach partition ${partitionName}
            for values from (${idFrom}) to (${idTo})
         `;

      console.log(`creating partition ${partitionName} `);
      await dbClientCustomers.query(psql1);
      await dbClientCustomers.query(psql2);
    }

    /* 4. Closing connection */
    console.log('Closing connection');
    await dbClientCustomers.end();
    await dbClientPostgres.end();
    console.log('Automate partitioning: done.');
  } catch (err) {
    console.error(`Something went wrong ${JSON.stringify(err)}`);
  }
}

createPartitions();

/*
Get into container's command line interface
docker exec -it pgpart psql -U postgres -d customers

Describe customers
\d customers

Show all customers partitions
\d+ customers

select * from customers_0_10000000 limit 10;
*/
