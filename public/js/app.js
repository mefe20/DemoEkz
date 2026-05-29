// функция для красивых уведомлений (вместо alert)
function showToast(msg, type = 'error') {
    const toast = document.getElementById('toast');
    if(!toast) return;
    toast.innerText = msg;
    toast.className = `toast ${type}`;
    toast.style.display = 'block';
    
    // плавная анимация появления
    setTimeout(() => toast.style.opacity = '1', 10);
    
    // скрываем через 3 секунды
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.style.display = 'none', 300);
    }, 3000);
}

// переключение между входом и регистрацией
function toggleAuth() {
    const loginSec = document.getElementById('login-section');
    const regSec = document.getElementById('register-section');
    loginSec.style.display = loginSec.style.display === 'none' ? 'block' : 'none';
    regSec.style.display = regSec.style.display === 'none' ? 'block' : 'none';
}

// логика входа
async function auth(e) {
    e.preventDefault();
    const login = document.getElementById('login').value;
    const pass = document.getElementById('password').value;

    try {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ login, password: pass })
        });
        const data = await res.json();
        
        if (res.ok) {
            localStorage.setItem('userId', data.userId);
            localStorage.setItem('role', data.role);
            window.location.href = data.role === 'admin' ? 'admin.html' : 'dashboard.html';
        } else {
            showToast(data.error);
        }
    } catch (err) { showToast('ошибка сервера'); }
}

// логика регистрации
async function reg(e) {
    e.preventDefault();
    const reqData = {
        fio: document.getElementById('reg-fio').value,
        phone: document.getElementById('reg-phone').value,
        email: document.getElementById('reg-email').value,
        login: document.getElementById('reg-login').value,
        password: document.getElementById('reg-password').value
    };

    try {
        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reqData)
        });
        const data = await res.json();

        if(res.ok) {
            showToast('успешно! теперь войдите', 'success');
            setTimeout(() => toggleAuth(), 1500);
        } else {
            showToast(data.error);
        }
    } catch(err) { showToast('ошибка сервера'); }
}

// логика создания заявки
async function createBooking(e) {
    e.preventDefault();
    const userId = localStorage.getItem('userId');
    if(!userId) return showToast('сначала войдите в систему');

    const reqData = {
        user_id: userId,
        hall_id: document.getElementById('hall_id').value,
        start_date: document.getElementById('start_date').value,
        payment_method: document.getElementById('payment_method').value
    };

    try {
        const res = await fetch('/api/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reqData)
        });
        
        if(res.ok) {
            showToast('заявка отправлена!', 'success');
            setTimeout(() => window.location.href = 'dashboard.html', 1500);
        } else {
            showToast('ошибка при создании');
        }
    } catch(err) { showToast('ошибка сервера'); }
}

// выход
function logout() {
    localStorage.clear();
    window.location.href = 'index.html';
}

// динамическое меню для главной страницы
window.onload = () => {
    const navMenu = document.getElementById('nav-menu');
    if(navMenu) {
        const role = localStorage.getItem('role');
        if(role === 'admin') navMenu.innerHTML = '<a href="admin.html">Админка</a> <a href="#" onclick="logout()">Выйти</a>';
        else if(role === 'user') navMenu.innerHTML = '<a href="dashboard.html">Личный кабинет</a> <a href="#" onclick="logout()">Выйти</a>';
        else navMenu.innerHTML = '<a href="auth.html">Вход / Регистрация</a>';
    }
};