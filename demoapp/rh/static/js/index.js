
document.addEventListener("DOMContentLoaded", function(event) {
    departments = document.querySelectorAll(".btn-sidebar")
    departments.forEach(department => {
        department.addEventListener("click", () => {
            document.querySelector('.page-departments').classList.remove("hidden")
            document.querySelector('.page-view-employee').classList.add("hidden")

            btn_dept = department.firstElementChild
            current_dept = document.querySelector('#id-h1').innerText
            if (current_dept != department.id) {
                clearDepartment()
                getDepartment(btn_dept)
            }
        })
    })

    var first_dept = document.querySelector('.departments').firstElementChild
    first_dept.click()
})



function getDepartment(department) {
    department_id = department.id
    fetch('/get/employees/' + department_id, {
        method: 'GET',
    })
        .then(response => response.json())
        .then(data => {
            if (!Object.keys(data).length == 0) {
                for (let i = 0; i < Object.keys(data.employees).length; i++) {
                    verifyIfObjectAreCreated(data.employees[i], data.employees[i].employee_id)
                }
            }
            changeTitleDepartment(data.department[0].department_name)
        })
        .catch(e => {
            console.log("Error: " + e)
        })
}
function getEmployee(employee) {
    employee_id = employee.employee_id
    fetch('/get/employee/' + employee_id, {
        method: 'GET',
    })
        .then(response => response.json())
        .then(data => {
            getEmployeeView(employee)
        })
        .catch(e => {
            console.log("Error: " + e)
        })
}

function getEmployeeView(employee) {
    employee_pic = document.querySelector(".pic-view").src = "images/" + employee.employee_icon
    employee_name = document.querySelector(".employee-name").innerText = employee.employee_name
    // employee_name = document.querySelector(".employee-name").innerText = employee.employee_name
    // employee_title_job = document.querySelector(".employee-title-job").innerText = employee.employee_title_job
    var employee_id = document.querySelector(".employee-id").innerText = employee.employee_id
    var employee_cpf = document.querySelector(".employee-cpf").innerText = "CPF: " + employee.employee_cpf
    var employee_rg = document.querySelector(".employee-rg").innerText = "RG: " + employee.employee_rg
    var employee_birthdate = document.querySelector(".employee-birthdate ").innerText = "Data de Nascimento: " + employee.employee_birthdate
    var employee_startdate = document.querySelector(".employee-startdate").innerText = "Data de Admissão: " + employee.employee_startdate
    var employee_salary = document.querySelector(".employee-salary").innerText = "Salário: " + employee.employee_salary
    var employee_department = document.querySelector(".employee-department").innerText = "Setor: " + employee.employee_department
    var employee_email = document.querySelector(".employee-email").innerText = "E-mail: " + employee.employee_email
    var employee_phone = document.querySelector(".employee-phone").innerText = "Telefone: " + employee.employee_phone
    var employee_agency = document.querySelector(".employee-agency").innerText = "Agência: " + employee.employee_agency
    var employee_cc = document.querySelector(".employee-cc").innerText = "Conta corrente: " + employee.employee_cc


    document.querySelector("#return").addEventListener("click", () => {
        document.querySelector('.page-departments').classList.remove("hidden")
        document.querySelector('.page-view-employee').classList.add("hidden")
    })

}


function changeTitleDepartment(department_name) {
    h1_title = document.querySelector('#id-h1')
    h1_title.innerText = department_name
}


function createEmployee(employee) {
    const div_employee = document.createElement("div")
    div_employee.className = "employee"
    div_employee.id = employee.id
    const div_pic_info_emp = document.createElement("div")
    div_pic_info_emp.className = "picture-info-employee"
    const div_emp_btn_view = document.createElement("div")
    div_emp_btn_view.className = "employee-btn-view"

    div_emp_btn_view.addEventListener("click", () => {
        togglePage(employee)
    })

    div_employee.appendChild(div_pic_info_emp)
    div_employee.appendChild(div_emp_btn_view)

    const div_emp_pic = document.createElement("div")
    const div_emp_info = document.createElement("div")
    div_emp_info.className = "employee-info"
    div_pic_info_emp.append(div_emp_pic)
    div_pic_info_emp.append(div_emp_info)

    const img_emp = document.createElement("img")
    img_emp.className = "employee-pic"
    img_emp.src = '/images/' + employee.employee_icon
    div_emp_pic.append(img_emp)

    const p_name = document.createElement("p")
    const p_titlejob = document.createElement("p")
    const p_id_emp = document.createElement("p")

    p_name.className = "name"
    p_name.innerText = employee.employee_name
    p_titlejob.className = "title-job"
    p_titlejob.innerText = employee.employee_titlejob
    p_id_emp.className = "id-employee"
    p_id_emp.innerText = employee.employee_id


    div_emp_info.appendChild(p_name)
    div_emp_info.appendChild(p_titlejob)
    div_emp_info.appendChild(p_id_emp)


    const btn = document.createElement("button")
    btn.type = "button"
    btn.innerText = "View"
    div_emp_btn_view.append(btn)

    const div_cont_emp = document.querySelector(".container-employees")
    div_cont_emp.appendChild(div_employee)

}

function clearDepartment() {
    div_employee = document.querySelector('.container-employees')
    while (div_employee.hasChildNodes()) {
        div_employee.removeChild(div_employee.firstChild)
    }
}

function verifyIfObjectAreCreated(employee, id) {
    all_ids = document.querySelectorAll('.id-employee')
    count = 0

    for (let index = 0; index < all_ids.length; index++) {
        if (all_ids[index].innerText == id) {
            count++
        }
    }

    if (!count > 0) {
        createEmployee(employee)
    }

}

function hiddenClass() {
    document.querySelector('.page-departments').classList.toggle("hidden")
    document.querySelector('.page-view-employee').classList.toggle("hidden")
}
function togglePage(employee) {
    hiddenClass()
    getEmployee(employee)
}


// departments.forEach(("department", function(){
//     department.addEventListener("onclick", getDepartment(department))
// }))
