const { pool } = require('../config/database');

const seedData = async () => {
  try {
    console.log('🌱 Seeding initial data...');

    // Seed Countries
    await pool.query(`
      INSERT INTO countries (name, code, currency, flag_icon, languages, payment_methods) VALUES
      ('Nigeria', 'NG', 'NGN', '🇳🇬', '["en"]', '["card", "bank", "transfer"]'),
      ('United States', 'US', 'USD', '🇺🇸', '["en"]', '["card", "paypal"]'),
      ('United Kingdom', 'UK', 'GBP', '🇬🇧', '["en"]', '["card", "paypal"]'),
      ('Kenya', 'KE', 'KES', '🇰🇪', '["en", "sw"]', '["card", "mpesa"]'),
      ('Ghana', 'GH', 'GHS', '🇬🇭', '["en"]', '["card", "mobile_money"]')
      ON CONFLICT (code) DO NOTHING;
    `);
    console.log('✅ Countries seeded');

    // Seed Services
    await pool.query(`
      INSERT INTO services (name, icon, description) VALUES
      ('Mobile Data', '📱', 'Internet data plans for all networks'),
      ('Airtime', '⏰', 'Phone credit top-up'),
      ('Electricity', '💡', 'Utility bill payments'),
      ('TV Subscription', '📺', 'Cable TV subscriptions'),
      ('Gift Cards', '🎁', 'Digital gift cards')
      ON CONFLICT DO NOTHING;
    `);
    console.log('✅ Services seeded');

    // Seed Networks for Nigeria
    await pool.query(`
      INSERT INTO networks (country_id, service_id, name, service_type) 
      SELECT c.id, s.id, n.name, 'mobile'
      FROM countries c, services s, (VALUES 
        ('MTN Nigeria'), ('Airtel Nigeria'), ('Glo Nigeria'), ('9mobile')
      ) AS n(name)
      WHERE c.code = 'NG' AND s.name = 'Mobile Data'
      ON CONFLICT DO NOTHING;
    `);
    console.log('✅ Networks seeded');

    // Seed Sample Plans
    await pool.query(`
      INSERT INTO plans (network_id, name, cost_price, selling_price, validity, data_volume) 
      SELECT n.id, p.name, p.cost_price, p.selling_price, p.validity, p.data_volume
      FROM networks n,
      (VALUES 
        ('1GB - 30 days', 200, 250, '30 days', '1GB'),
        ('2.5GB - 30 days', 450, 500, '30 days', '2.5GB'),
        ('5GB - 30 days', 800, 900, '30 days', '5GB')
      ) AS p(name, cost_price, selling_price, validity, data_volume)
      WHERE n.name = 'MTN Nigeria'
      ON CONFLICT DO NOTHING;
    `);
    console.log('✅ Plans seeded');

    // Seed API Providers
    await pool.query(`
      INSERT INTO api_providers (name, endpoint, api_key, is_active) VALUES
      ('Reloadly', 'https://topups.reloadly.com', 'reloadly_api_key_here', true),
      ('VTU.ng', 'https://vtu.ng/api', 'vtung_api_key_here', true),
      ('Airtime Africa', 'https://airtime.africa/api', 'airtime_africa_key', true)
      ON CONFLICT DO NOTHING;
    `);
    console.log('✅ API Providers seeded');

    console.log('🎉 All seed data inserted successfully!');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await pool.end();
  }
};

seedData();
