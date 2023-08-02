const tableNode = document.querySelector('.tbody');
const usersTableCard = $('#users_table_card');
const newUserCard = $('#new_user_card');
const cardDiv = $('.card');

class Role {
    constructor(id, role) {
        this.id = id;
        this.role = role;
    }
}

$(document).ready(function () {

    window.addEventListener('load', getDatabase);

});

function getDatabase() {
    fetch("http://localhost:8080/api/")
        .then((response) => {
            return response.json();
        })
        .then((data) => {
            let temp = "";
            let roleString = "";
            data.forEach((elem) => {
                temp += "<tr class='table'>";
                temp += "<th id='id'>" + elem.id + "</th>";
                temp += "<td id='username'>" + elem.username + "</td>";
                temp += "<td id='lastName'>" + elem.lastName + "</td>";
                temp += "<td id='age'>" + elem.age + "</td>";
                temp += "<td id='email'>" + elem.email + "</td>";
                elem.roles.forEach((role) => {
                    roleString += role.name + " ";
                })
                temp += "<td>" + roleString + "</td>";
                roleString = "";
                temp += "<td><button type='button' data-toggle='modal' " +
                    "class='btn btn-primary btn-sm text-white btn-info' data-target='#editModal' onclick='showEditModal(" + elem.id + ")'>Edit</button></td>";
                temp += "<td><button type='submit' class='btn btn-primary btn-sm btn-danger' onclick='delUser(" + elem.id + ")'>Delete</button></td>";
                temp += "</tr>";
            })
            tableNode.innerHTML = "";
            tableNode.innerHTML += temp
            temp = "";
        })
        .catch((err) => {
            console.error(err);
        });
}

//POST-request with new user
async function newUser() {
    const url = "http://localhost:8080/api";

    const form = document.querySelector('.form-new-user');

    const formData = new FormData(form);
    let currentRoles = [];
    const existingRoles = Array.from(formData.getAll('roles'))

    for (let i = 0; i < existingRoles.length; i++) {
        const id = existingRoles[i];
        const role = id == 1 ? `ROLE_ADMIN` : `ROLE_USER`;
        currentRoles.push(new Role(id, role));
    }

    let data = {
        username: formData.get('username'),
        lastName: formData.get('lastName'),
        age: formData.get('age'),
        email: formData.get('email'),
        password: formData.get('password'),
        roles: currentRoles
    }
    console.log(data)
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify(data)
        }).then(resp => resp.json()).then(data => {
            form.reset();
            // Switch to the "Admin Panel" tab after adding a new user
            usersTableCard.click(); // Programmatically trigger the click event
        })
    } catch (err) {
        console.log(err)
    }
}

document.querySelector("#addNewUserBtn").addEventListener('click', newUser);
usersTableCard.click(() => {
    if (!usersTableCard.attr('class').includes('active')) {
        getDatabase();
        usersTableCard.attr('class', "nav-link active");
        newUserCard.attr('class', "nav-link text-primary");

        //change body into div Card
        document.querySelector('.secondCard').style.display = "none";
        document.querySelector('.firstCard').style.display = "block";
    }
})
newUserCard.click(() => {
    if (!newUserCard.attr('class').includes("active")) {
        newUserCard.attr('class', "nav-link active");
        usersTableCard.attr('class', "nav-link text-primary");

        //change body into div Card
        document.querySelector('.secondCard').style.display = "block";
        document.querySelector('.firstCard').style.display = "none";
    }
});

// Function to show the edit modal
function showEditModal(id) {
    let url = "http://localhost:8080/api/" + id;
    fetch(url)
        .then((resp) => resp.json())
        .then((data) => {
            console.log("Got this user for editing " + data);

            // Populate the form fields with user details
            document.querySelector('#id_edit').value = data.id;
            document.querySelector('#name_edit').value = data.username;
            document.querySelector('#lastname_edit').value = data.lastName;
            document.querySelector('#age_edit').value = data.age;
            document.querySelector('#email_edit').value = data.email;
            document.querySelector('#password_edit').value = data.password;
            document.querySelector('#edit-role').value = data.roles.map(r => (r.id === 1) ? "Admin" : (r.id === 2) ? "User" : r.id);

            // Show the edit modal
            $('#editModal').modal('show');
        })
        .catch((err) => {
            console.log(err);
        });
}

// Click event for opening the edit modal
document.querySelector('.tbody').addEventListener('click', (event) => {
    if (event.target.classList.contains('btn-info')) {
        const userId = event.target.getAttribute('onclick').match(/\d+/)[0];
        showEditModal(userId);
    }
});

// Function to edit the user
async function editInfoUser() {
    const currentRoles = [];
    const formData = new FormData(document.querySelector("#formEditUser"));
    const existingRoles = Array.from(formData.getAll('roles'));

    for (let i = 0; i < existingRoles.length; i++) {
        const id = existingRoles[i];
        const role = id == 1 ? `ROLE_ADMIN` : `ROLE_USER`;
        currentRoles.push(new Role(id, role));
    }

    const data = {
        id: formData.get('id'),
        username: formData.get('username'),
        lastName: formData.get('lastName'),
        age: formData.get('age'),
        email: formData.get('email'),
        password: formData.get('password'),
        roles: currentRoles
    };
    console.log(data);

    try {
        const response = await fetch("http://localhost:8080/api/edit", {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify(data)
        });
        if (response.ok) {
            console.log("Edit user with id: " + formData.get('id'));
            $('#editModal').modal('hide');
            getDatabase();
        } else {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to edit user.");
        }
    } catch (err) {
        console.log(err);
    }
}

// Click event for editing the user
document.querySelector('#editInfo').addEventListener('click', editInfoUser);

// Function to show the delete modal
function showDeleteModal(id) {
    let url = "http://localhost:8080/api/" + id;
    fetch(url)
        .then((resp) => resp.json())
        .then((data) => {
            console.log("Got this user for deleting " + data);
            document.querySelector('#id_del').value = data.id;
            document.querySelector('#name_del').value = data.username;
            document.querySelector('#lastname_del').value = data.lastName;
            document.querySelector('#age_del').value = data.age;
            document.querySelector('#email_del').value = data.email;
            document.querySelector('#edit-role').value = data.roles.map(r => (r.id === 1) ? "Admin" : (r.id === 2) ? "User" : r.id);
            $('#deleteModal').modal('show');
        })
        .catch((err) => {
            console.log(err);
        });
}

// Function to delete the user
async function deleteUser() {
    let id = document.querySelector('#id_del').value;
    let urlDel = "/api/" + id;
    let method = {
        method: 'DELETE',
        headers: {
            "Content-Type": "application/json"
        }
    };

    try {
        const response = await fetch(urlDel, method);
        if (response.ok) {
            console.log("Deleted user with id: " + id);
            $('#deleteModal').modal('hide');
            getDatabase();
        } else {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to delete user.");
        }
    } catch (err) {
        console.log(err);
    }
}

// Click event for opening the delete modal
document.querySelector('.tbody').addEventListener('click', (event) => {
    if (event.target.classList.contains('btn-danger')) {
        const userId = event.target.getAttribute('onclick').match(/\d+/)[0];
        showDeleteModal(userId);
    }
});

// Click event for deleting the user
document.querySelector('#deleteBtn').addEventListener('click', deleteUser);