exports.up = (pgm) => {
  pgm.createTable('networks', {
    id: { type: 'serial', primaryKey: true },
    country_id: { type: 'integer', notNull: true, references: 'countries' },
    service_id: { type: 'integer', notNull: true, references: 'services' },
    name: { type: 'varchar(100)', notNull: true },
    logo: { type: 'varchar(255)' },
    service_type: { type: 'varchar(50)' },
    is_active: { type: 'boolean', default: true },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') }
  });

  pgm.createIndex('networks', ['country_id', 'service_id']);
  pgm.createIndex('networks', 'is_active');
};

exports.down = (pgm) => {
  pgm.dropTable('networks');
};
