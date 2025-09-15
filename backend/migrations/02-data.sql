INSERT INTO roles (name) VALUES
('admin'),
('engineer')
ON CONFLICT (name) DO NOTHING;

INSERT INTO users (first_name, last_name, middle_name, password, email, role_id) 
VALUES (
    'Главный',
    'Администратор',
    'Системы',
    'admin123', -- Замените на хеш, если используете хеширование
    'admin@company.com',
    (SELECT id FROM roles WHERE name = 'admin')
)
ON CONFLICT (email) DO NOTHING;