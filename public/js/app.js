function showToast(msg, type = 'error') {
    const toast = document.getElementById('toast');
    if(!toast) return;
    toast.innerText = msg;
    toast.className = `toast ${type}`;
    toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, 3000);
}

function toggleAuth() {
    const loginSec = document.getElementById('login-section');
    const regSec = document.getElementById('register-section');
    loginSec.style.display = loginSec.style.display === 'none' ? 'block' : 'none';
    regSec.style.display = regSec.style.display === 'none' ? 'block' : 'none';
}

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
        } else { showToast(data.error); }
    } catch (err) { showToast('Ошибка сети'); }
}

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
            showToast('Успешно! Теперь войдите', 'success');
            setTimeout(() => toggleAuth(), 1500);
        } else { showToast(data.error); }
    } catch(err) { showToast('Ошибка сети'); }
}

async function createBooking(e) {
    e.preventDefault();
    const userId = localStorage.getItem('userId');
    if(!userId) return showToast('Сначала войдите');

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
            showToast('Заявка отправлена!', 'success');
            setTimeout(() => window.location.href = 'dashboard.html', 1500);
        } else { showToast('Ошибка при создании'); }
    } catch(err) { showToast('Ошибка сети'); }
}

function logout() {
    localStorage.clear();
    window.location.href = 'index.html';
}

window.onload = () => {
    const navMenu = document.getElementById('nav-menu');
    if(navMenu) {
        const role = localStorage.getItem('role');
        if(role === 'admin') navMenu.innerHTML = '<a href="admin.html">Админка</a> <a href="#" onclick="logout()">Выйти</a>';
        else if(role === 'user') navMenu.innerHTML = '<a href="dashboard.html">Личный кабинет</a> <a href="#" onclick="logout()">Выйти</a>';
        else navMenu.innerHTML = '<a href="auth.html">Вход / Регистрация</a>';
    }
};