document.addEventListener("DOMContentLoaded", function(event) {
    // set event for each department button
    departments = document.querySelectorAll(".department")
    departments.forEach(department => {
      department.addEventListener("click", () => {
        // assures that view employee is hidden and department employees is not
        document.querySelector('.page-department-employees').classList.remove("hidden")
        document.querySelector('.page-view-employee').classList.add("hidden")
        
        // checks if the department isn't already clicked by checking the title
        btn_dept = department.firstElementChild
        current_dept = document.querySelector('#id-h1').innerText
        if (current_dept != department.id) {
          // It removes the employees from the department view
          clearEmployees()
           
          // Fetch employees from a department and displays it
          getEmployees(btn_dept).then(data => {
            checkListEmployees(data)
          })
          
          
          getDepartment(btn_dept).then(data => {
            changeDepartmentTitle(data.department_name) 
          })

        }
      })
    })
    
    // sets first department to be clicked as default
    var first_dept = document.querySelector('.departments').firstElementChild
    first_dept.click()
})



async function getEmployees(department) { 
  try{
    const response = await fetch('/api/employees/department/' + department.id, {
      method: 'GET',
    })
    const data = await response.json()
    return data 
  } catch(error){
    console.error("Error: " + error)
    throw error
  }

}

async function getDepartment(department){
  try{
    const response = await fetch('/api/departments/' + department.id, {
      method: 'GET',
    })
    const data = await response.json()
    return data 
  } catch(error){
    console.error("Error: " + error)
    throw error
  }
}

function changeDepartmentTitle(department_name){
  h1_title = document.querySelector('#id-h1')
  h1_title.innerText = department_name
}

function checkListEmployees(data){
  if (!Object.keys(data).length == 0) {
    for (let i = 0; i < Object.keys(data).length; i++) {
      var isCreated = verifyIfObjectAreCreated(data[i], data[i].employee_id)
      if(!isCreated){
        viewCardEmployee(data[i])
      }
    }
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
      return false
    }
    return true
}

function viewCardEmployee(employee) {
    const div_employee = document.createElement("div")
    div_employee.className = "employee"
    div_employee.id = employee.id
    const div_pic_info_emp = document.createElement("div")
    div_pic_info_emp.className = "picture-info-employee"
    const div_emp_btn_view = document.createElement("div")
    div_emp_btn_view.className = "employee-btn-view"
    
    // Add event listener for the view button and call togglePage
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
    img_emp.src = employee.employee_icon
    div_emp_pic.append(img_emp)

    const p_name = document.createElement("p")
    const p_titlejob = document.createElement("p")
    const p_id_emp = document.createElement("p")

    p_name.className = "name"
    p_name.innerText = employee.employee_name
    p_titlejob.className = "title-job"
    p_titlejob.innerText = employee.employee_titlejob.position_name
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

function clearEmployees() {
    div_employee = document.querySelector('.container-employees')
    while (div_employee.hasChildNodes()) {
        div_employee.removeChild(div_employee.firstChild)
    }
}

function togglePage(employee) {
  // toggles between page department employees and shows page view employee
  hiddenClass()
  // displays the employee info
  let tokenizedData
  name = document.querySelector(".employee-name").innerText
  
  
  if(name != employee.employee_name){
    clearViewInfoEmployee()
    getTokenizedEmployee(employee.id)
    .then((employeeData) => {
      tokenizedData = employeeData
      console.log(employeeData)
      //console.log(tokenizedData)
      return detokenizeData(tokenizedData)
    })
    .then((detokenizedData) => {
      viewInfoEmployee(detokenizedData)
    })
    .catch((error) => {
      console.log("Error: ", error)
    })
  }
  else{
    getTokenizedEmployee(employee.id)
    .then((employeeData) => {
      console.log(employeeData)
      viewInfoEmployee(detokenizedData)
    })
    .catch((error) => {
      console.log("Error: ", error)
    })

  }
}

async function detokenizeData(tokenizedData){
  try{
    const csrftoken = getCookie('csrftoken')
    const response = await fetch('/api/detokenize/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrftoken,
      },
      body: JSON.stringify(tokenizedData),
    })

    const data = await response.json()

    return data
  
  } catch(error){
    console.error("Error: " + error)
    throw error
  }
}



async function getTokenizedEmployee(employee_id){
  try{
    const response = await fetch('/api/employees/' + employee_id, {
      method: 'GET',
    })
    const data = await response.json()
    return data 
  } catch(error){
    console.error("Error: " + error)
    throw error
  }
}

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

function hiddenClass() {
    document.querySelector('.page-department-employees').classList.toggle("hidden")
    document.querySelector('.page-view-employee').classList.toggle("hidden")
}

function clearViewInfoEmployee(){
  var container_image = document.querySelector(".container-image")
  container_image.removeChild(container_image.firstChild) 
  var employee_name = document.querySelector(".employee-name").innerText = ""
  var employee_title_job = document.querySelector(".employee-title-job").innerText = ""
  var employee_id = document.querySelector(".employee-id").innerText = ""
  var employee_cpf = document.querySelector(".employee-cpf").innerText = ""
  var employee_rg = document.querySelector(".employee-rg").innerText = ""
  var employee_birthdate = document.querySelector(".employee-birthdate ").innerText = ""
  var employee_startdate = document.querySelector(".employee-startdate").innerText = ""
  var employee_salary = document.querySelector(".employee-salary").innerText = ""
  var employee_department = document.querySelector(".employee-department").innerText = ""
  var employee_email = document.querySelector(".employee-email").innerText = "" 
  var employee_phone = document.querySelector(".employee-phone").innerText = "" 
  var employee_agency = document.querySelector(".employee-agency").value = "" 
  var employee_cc = document.querySelector(".employee-cc").value = "" 
}

function viewInfoEmployee(employee) {

  var employee_pic = document.createElement("img")
  employee_pic.src = employee.employee_icon
  employee_pic.className = "employee-pic"
  document.querySelector('.container-image').appendChild(employee_pic)
  var employee_name = document.querySelector(".employee-name").innerText = employee.employee_name
  var employee_title_job = document.querySelector(".employee-title-job").innerText = employee.employee_titlejob.position_name
  var employee_id = document.querySelector(".employee-id").innerText = employee.employee_id
  var employee_cpf = document.querySelector(".employee-cpf").innerText = "CPF: " + employee.employee_cpf
  var employee_rg = document.querySelector(".employee-rg").innerText = "RG: " + employee.employee_rg
  var employee_birthdate = document.querySelector(".employee-birthdate ").innerText = "Data de Nascimento: " + employee.employee_birthdate
  var employee_startdate = document.querySelector(".employee-startdate").innerText = "Data de Admissão: " + employee.employee_startdate
  var employee_salary = document.querySelector(".employee-salary").innerText = "Salário: " + employee.employee_salary
  var employee_department = document.querySelector(".employee-department").innerText = "Setor: " + employee.department.department_name
  var employee_email = document.querySelector(".employee-email").innerText = "E-mail: " + employee.employee_email
  var employee_phone = document.querySelector(".employee-phone").innerText = "Telefone: " + employee.employee_phone
  var employee_agency = document.querySelector(".employee-agency").value = employee.employee_agency
  var employee_cc = document.querySelector(".employee-cc").value = employee.employee_cc

  document.querySelector("#return").addEventListener("click", () => {
      document.querySelector('.page-department-employees').classList.remove("hidden")
      document.querySelector('.page-view-employee').classList.add("hidden")
  })
}
