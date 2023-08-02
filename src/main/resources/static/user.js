const url = "http://localhost:8080/user/api";

fetch(url)
    .then(response => response.json())
    .then(data => {
        let roles = "";
        data.roles.forEach(role => {
            roles += role.name + " ";
        });

        let body = `
            <tr class="table-active">
                <th scope="row">${data.id}</th>
                <td>${data.username}</td>
                <td>${data.lastName}</td>
                <td>${data.age}</td>
                <td>${data.email}</td>
                <td>${roles}</td>
            </tr>
        `;
        document.querySelector('#table_data').innerHTML = body;

        // Проверяем, есть ли у пользователя роль 'ADMIN'
        let isAdmin = data.roles.some(role => role.name === 'ADMIN');

        // Скрываем или показываем вкладку 'Admin' в зависимости от наличия роли
        if (!isAdmin) {
            document.querySelector('.nav-link[href="/admin/"]').style.display = 'none';
        }
    })
    .catch(error => {
        console.error('Error fetching user data:', error);
    });
