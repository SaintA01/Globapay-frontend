exports.up = (pgm) => {
  pgm.createTable('services', {
    id: { type: 'serial', primaryKey: true },
    name: { type: 'varchar(100)', notNull: true },
    icon: { type: 'varchar(50)' },
    description: { type: 'text' },
    is_active: { type: 'boolean', default: true },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') }
  });

  pgm.createIndex('services', 'is_active');
};

exports.down = (pgm) => {
  pgm.dropTable('services');
};
