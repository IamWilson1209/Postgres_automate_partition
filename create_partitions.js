import pg from 'pg';

/*
This script creates { 100 } partitions 
then attaches them to main table "inventory" (貨物清單)

Please make sure you've spin up docker's postgresql through following command:
# docker run --name pg -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres

Then run this command in terminal
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

    /* Dropping existing database if needed, not recommend in real world case */
    // console.log('Dropping database inventory...');
    // await dbClientPostgres.query("drop database inventory");

    /* Start creating fake inventory data */
    console.log('Start creating database inventory...');
    await dbClientPostgres.query('create database inventory');

    /* 2. Connecting to inventory database using pg.Client */
    const dbClientInventory = new pg.Client({
      user: 'postgres',
      password: 'postgres',
      host: 'localhost',
      port: 5432,
      database: 'inventory', // Connect to "inventory" database
    });
    console.log('Connecting to inventory db...');
    await dbClientInventory.connect();

    /* 3. Create inventory table with range partitioning */
    console.log('Creating inventory table...');
    // id: serial(auto increment), name: text, category: text, price: numeric, quantity: integer
    const sql = `create table inventory (id serial, name text, category text, price numeric, quantity integer) 
                 partition by range (id)`;
    await dbClientInventory.query(sql);
    console.log('Creating partitions... ');

    /*
    Make this database support 1 Billion items
    each partition will have 10M items 
    that gives 1000/10 -> 100 partition tables
    */
    for (let partition_i = 0; partition_i < 100; partition_i++) {
      const idFrom = partition_i * 10000000;
      const idTo = (partition_i + 1) * 10000000;
      const partitionName = `inventory_${idFrom}_${idTo}`;

      /* Create inventory table for each partition */
      const psql1 = `create table ${partitionName}
                         (like inventory including indexes)`;

      /* Attach inventory just created to different partitions */
      const psql2 = `alter table inventory
            attach partition ${partitionName}
            for values from (${idFrom}) to (${idTo})
         `;

      console.log(`creating partition ${partitionName}`);
      await dbClientInventory.query(psql1);
      await dbClientInventory.query(psql2);
    }

    /* 4. Closing connection */
    console.log('Closing connection');
    await dbClientInventory.end();
    await dbClientPostgres.end();
    console.log('Automate partitioning: done.');
  } catch (err) {
    console.error(`Something went wrong ${JSON.stringify(err)}`);
  }
}

createPartitions();

/*
Get into container's command line interface
docker exec -it pgpart psql -U postgres -d inventory

Describe inventory
\d inventory

Show all inventory partitions
\d+ inventory

select * from inventory_0_10000000 limit 10;
*/
