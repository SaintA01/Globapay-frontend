exports.up = (pgm) => {
  pgm.createTable('plans', {
    id: { type: 'serial', primaryKey: true },
    network_id: { type: 'integer', notNull: true, references: 'networks' },
    name: { type: 'varchar(200)', notNull: true },
    description: { type: 'text' },
    cost_price: { type: 'decimal(10,2)', notNull: true },
    selling_price: { type: 'decimal(10,2)', notNull: true },
    validity: { type: 'varchar(50)' },
    data_volume: { type: 'varchar(50)' },
    is_active: { type: 'boolean', default: true },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', default: pgm.func('current_timestamp') }
  });

  pgm.createIndex('plans', 'network_id');
  pgm.createIndex('plans', 'is_active');
};

exports.down = (pgm) => {
  pgm.dropTable('plans');
};
