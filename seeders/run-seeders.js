const { pool } = require('../config/database');

async function seed() {
  try {
    // Seed countries
    await pool.query(`
      INSERT INTO countries (name, code, currency, flag_icon, languages, payment_methods) VALUES
      ('Nigeria', 'NG', 'NGN', '🇳🇬', '["en"]', '["card", "bank", "transfer"]'),
      ('United States', 'US', 'USD', '🇺🇸', '["en"]', '["card", "paypal"]'),
      ('United Kingdom', 'UK', 'GBP', '🇬🇧', '["en"]', '["card", "paypal"]'),
      ('Kenya', 'KE', 'KES', '🇰🇪', '["en", "sw"]', '["card", "mpesa"]')
      ON CONFLICT (code) DO NOTHING;
    `);

    // Seed services
    await pool.query(`
      INSERT INTO services (name, icon, description) VALUES
      ('Mobile Data', '📱', 'Internet data plans'),
      ('Airtime', '⏰', 'Phone credit top-up'),
      ('Electricity', '💡', 'Utility bill payments'),
      ('TV Subscription', '📺', 'Cable TV subscriptions')
      ON CONFLICT DO NOTHING;
    `);

    console.log('✅ Database seeded successfully');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  }
}

seed();
