import pg from 'pg';
/*
Run create_partitions.mjs file 
to create partitions before running this

Then run:  
# node populate_partitions.mjs
*/
async function populatePartitions() {
  /* 1. Connecting to PostgreSQL using pg.Client */
  const dbClientCustomers = new pg.Client({
    user: 'postgres',
    password: 'postgres',
    host: 'localhost',
    port: 5432,
    database: 'customers',
  });
  console.log('Connecting to customers db...');
  await dbClientCustomers.connect();

  /*
  2. Creating a billion customers, 10 million rows for each partition
  */
  console.log('Inserting customers... ');
  for (let partition_i = 0; partition_i < 100; partition_i++) {
    const psql = `insert into customers(name) (
                        select random() from generate_series(1,10000000)
                        )
                          `;

    console.log(`Inserting 10M customers to table ${partition_i}...`);
    await dbClientCustomers.query(psql);
  }

  /* 3. Closing connection */
  console.log('Closing connection');
  await dbClientCustomers.end();
  console.log('Populate customer: done.');
}

populatePartitions();
