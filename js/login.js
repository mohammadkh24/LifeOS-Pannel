const loginForm = document.getElementById('loginForm');
const loginButton = document.getElementById('loginButton');
const loginError = document.getElementById('loginError');

loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document
        .getElementById('email')
        .value
        .trim();

    const password = document
        .getElementById('password')
        .value;

    loginError.style.display = 'none';

    loginButton.disabled = true;
    loginButton.textContent = 'در حال ورود...';

    try {

        const response = await window.apiRequest('/auth/login', {
            method: 'POST',

            body: JSON.stringify({
                email,
                password,
            }),
        });

        const accessToken = response.data.accessToken;

        localStorage.setItem('accessToken', accessToken);

        window.location.href = './dashboard.html';

    } catch (error) {

        loginError.textContent = error.message;

        loginError.style.display = 'block';

    } finally {

        loginButton.disabled = false;
        loginButton.textContent = 'ورود';

    }
});


 