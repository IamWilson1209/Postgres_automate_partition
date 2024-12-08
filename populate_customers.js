import pg from 'pg';

/*
Run create_partitions.mjs file 
to create partitions before running this

Then run:  
# node populate_partitions.mjs
*/
async function populatePartitions() {
  /* 1. Connecting to PostgreSQL using pg.Client */
  const dbClientInventory = new pg.Client({
    user: 'postgres',
    password: 'postgres',
    host: 'localhost',
    port: 5432,
    database: 'inventory', // Changed to "inventory" database
  });
  console.log('Connecting to inventory db...');
  await dbClientInventory.connect();

  /*
  2. Creating a billion items, 10 million rows for each partition
  */
  console.log('Inserting inventory items... ');
  for (let partition_i = 0; partition_i < 100; partition_i++) {
    // name: random text as name
    // category: random integer between 1 and 10 as category
    // price: random number between 1 and 100 as price
    // quantity: random integer between 1 and 100 as quantity
    const psql = `insert into inventory(name, category, price, quantity) (
                        select 
                            random()::text as name, 
                            'category_' || (random() * 10)::int as category,
                            (random() * 100)::numeric as price,
                            (random() * 100)::int as quantity
                        from generate_series(1, 10000000)
                        )
                          `;

    console.log(`Inserting 10M items into partition ${partition_i}...`);
    await dbClientInventory.query(psql);
  }

  /* 3. Closing connection */
  console.log('Closing connection');
  await dbClientInventory.end();
  console.log('Populate inventory: done.');
}

populatePartitions();
