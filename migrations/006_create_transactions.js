exports.up = (pgm) => {
  pgm.createTable('transactions', {
    id: { type: 'serial', primaryKey: true },
    user_id: { type: 'integer', notNull: true, references: 'users' },
    country_id: { type: 'integer', notNull: true, references: 'countries' },
    service_id: { type: 'integer', notNull: true, references: 'services' },
    network_id: { type: 'integer', notNull: true, references: 'networks' },
    plan_id: { type: 'integer', notNull: true, references: 'plans' },
    recipient: { type: 'varchar(50)', notNull: true },
    amount_paid: { type: 'decimal(10,2)', notNull: true },
    status: { 
      type: 'varchar(20)', 
      notNull: true, 
      default: 'pending',
      check: "status IN ('pending', 'success', 'failed', 'processing')"
    },
    payment_gateway: { type: 'varchar(50)' },
    api_provider_id: { type: 'integer', references: 'api_providers' },
    api_response: { type: 'jsonb' },
    transaction_id: { type: 'varchar(50)', notNull: true, unique: true },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', default: pgm.func('current_timestamp') }
  });

  pgm.createIndex('transactions', 'user_id');
  pgm.createIndex('transactions', 'transaction_id');
  pgm.createIndex('transactions', 'status');
  pgm.createIndex('transactions', 'created_at');
};

exports.down = (pgm) => {
  pgm.dropTable('transactions');
};
