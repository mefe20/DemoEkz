-- Таблица пользователей
CREATE TABLE Users (
    id SERIAL PRIMARY KEY,
    fio VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    login VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user'
);

-- Таблица помещений
CREATE TABLE Halls (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

-- Таблица заявок
CREATE TABLE Bookings (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES Users(id),
    hall_id INT REFERENCES Halls(id),
    start_date DATE NOT NULL,
    payment_method VARCHAR(50),
    status VARCHAR(50) DEFAULT 'Новая'
);

-- Заполнение доступных помещений
INSERT INTO Halls (name) VALUES 
('Зал'), 
('Ресторан'), 
('Летняя веранда'), 
('Закрытая веранда');





ALTER TABLE Bookings ADD COLUMN review TEXT;
