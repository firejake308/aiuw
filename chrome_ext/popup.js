const pb = new globalThis.PocketBase('https://aiuw-summer-water-3105.fly.dev');
console.log(pb);
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('signupBtn').onclick = async function () {
        try {
            const data = {
                "email": document.getElementById('email').value,
                "password": document.getElementById('password').value,
                "passwordConfirm": document.getElementById('password').value,
                "credits": 200,
            };

            const record = await pb.collection('users').create(data);

            // (optional) send an email verification request
            await pb.collection('users').requestVerification(document.getElementById('email').value);

            const notif = document.getElementById('notificationArea');
            notif.textContent = 'Check your email for a verification code';
            notif.style.visibility = 'visible';
        } catch (err) {
            const notif = document.getElementById('notificationArea');
            if (document.getElementById('password').value.length < 8)
                notif.textContent = 'Password must be at least 8 characters long';
            else
                notif.textContent = 'Failed to signup. Maybe an account already exists with that email?';
            notif.style.visibility = 'visible';
        }
    };

    document.getElementById('loginBtn').onclick = async function () {
        try {
            const authData = await pb.collection('users').authWithPassword(
                document.getElementById('email').value,
                document.getElementById('password').value,
            )
            chrome.runtime.sendMessage({ action: 'aiuw-login', token: pb.authStore.token });
            const notif = document.getElementById('notificationArea');
            notif.textContent = 'Logged in successfully!';
            notif.style.visibility = 'visible';
        } catch (err) {
            const notif = document.getElementById('notificationArea');
            notif.textContent = 'Login failed. Maybe you need to signup first?';
            notif.style.visibility = 'visible';
        }
    };
});