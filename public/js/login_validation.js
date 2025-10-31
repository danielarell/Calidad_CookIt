// Función para validar la sesión
async function validarSesion() {
    // Verificar si la cookie de sesión está presente
    let resp = await fetch('/api/users/search/me',{
        method :'GET'
    })

    console.log(resp.status);
    let data = await resp.json()
    
    // Si la cookie de sesión no está presente, redirigir al usuario a la página de inicio de sesión
    if (data.error) {
      window.location.href = "../Login_SignUp_Page/index.html";
    }
}

// Obtener todos los enlaces que requieren sesión
var enlacesRequierenSesion = document.querySelectorAll('.requiere-sesion');

// Agregar un event listener a cada enlace para validar la sesión cuando se hace clic en ellos
enlacesRequierenSesion.forEach(function(enlace) {
    enlace.addEventListener('click', function(event) {
        validarSesion();
    });
});


async function log_out()
{
    let resp = await fetch('/api/auth/logout',{
        method :'GET'
    })

    console.log(resp.status);
    let data = await resp.json()
    console.log(data)

    window.location.href = "../index.html";
}