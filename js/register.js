const registerForm = document.getElementById('registerForm');
const registerButton = document.getElementById('registerButton');
const registerError = document.getElementById('registerError');

registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    registerError.style.display = 'none';

    registerButton.disabled = true;
    registerButton.textContent = 'در حال ساخت حساب...';

    try {

        const response = await apiRequest('/auth/register', {
            method: 'POST',

            body: JSON.stringify({
                name,
                email,
                password,
            }),
        });

        const accessToken = response.data.accessToken;

        localStorage.setItem('accessToken', accessToken);

        window.location.href = './dashboard.html';

    } catch (error) {

        registerError.textContent = error.message;

        registerError.style.display = 'block';

    } finally {

        registerButton.disabled = false;
        registerButton.textContent = 'ساخت حساب';

    }
});