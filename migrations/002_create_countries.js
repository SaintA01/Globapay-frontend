exports.up = (pgm) => {
  pgm.createTable('countries', {
    id: { type: 'serial', primaryKey: true },
    name: { type: 'varchar(100)', notNull: true },
    code: { type: 'varchar(2)', notNull: true, unique: true },
    currency: { type: 'varchar(3)', notNull: true },
    flag_icon: { type: 'varchar(10)' },
    languages: { type: 'jsonb', default: '[]' },
    payment_methods: { type: 'jsonb', default: '[]' },
    is_active: { type: 'boolean', default: true },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') }
  });

  pgm.createIndex('countries', 'code');
  pgm.createIndex('countries', 'is_active');
};

exports.down = (pgm) => {
  pgm.dropTable('countries');
};
