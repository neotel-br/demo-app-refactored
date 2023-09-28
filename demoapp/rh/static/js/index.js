
document.addEventListener("DOMContentLoaded", function(event){
  departments = document.querySelectorAll(".btn-sidebar")
  console.log(departments)
  departments.forEach(department => {
      department.addEventListener("click", () =>{
        document.querySelector('.page-departments').classList.remove("hidden")
        document.querySelector('.page-view-employee').classList.add("hidden")

        btn_dept = department.firstElementChild
        current_dept = document.querySelector('#id-h1').innerText
        if(current_dept != department.id){
          clearDepartment()
          getDepartment(btn_dept)
        }
      })
  })


  var first_dept = document.querySelector('.departments').firstElementChild
  first_dept.click()
})



function getDepartment(department){
    department_id = department.id
    fetch('/rh/get/employees/' + department_id, {
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
        // <div class="employee">
        //     <div class="picture-info-employee">
        //         <div class="employee-picture">
        //             <img src="{% static 'images/sanuka.png' %}" alt="">
        //         </div>
        //         <div class="employee-info">
        //             <p class="name">Sanuka LambeLambe<p>
        //             <p class="title-job">Analista de Segurança<p>
        //             <p class="id-employee">420<p>
        //
        //         </div>
        //     </div>
        //     <div class="employee-btn-view">
        //         <button type="button">View</button>
        //     </div>
        // </div>
function changeTitleDepartment(department_name){
  h1_title = document.querySelector('#id-h1')
  h1_title.innerText = department_name
}


function createEmployee(employee){
  const div_employee = document.createElement("div")
  div_employee.className = "employee"
  div_employee.id = employee.id
  const div_pic_info_emp = document.createElement("div")
  div_pic_info_emp.className = "picture-info-employee"
  const div_emp_btn_view = document.createElement("div")
  div_emp_btn_view.className = "employee-btn-view"

  div_emp_btn_view.addEventListener("click", () => {
    togglePage()
  })

  div_employee.appendChild(div_pic_info_emp)
  div_employee.appendChild(div_emp_btn_view)
  
  const div_emp_pic = document.createElement("div")
  div_emp_pic.className = "employee-picture"
  const div_emp_info = document.createElement("div")
  div_emp_info.className = "employee-info"
  div_pic_info_emp.append(div_emp_pic)
  div_pic_info_emp.append(div_emp_info)

  const img_emp = document.createElement("img")
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

function clearDepartment(){
  div_employee = document.querySelector('.container-employees')
  while(div_employee.hasChildNodes()){
    div_employee.removeChild(div_employee.firstChild)
  }
}

function verifyIfObjectAreCreated(employee, id){
  all_ids = document.querySelectorAll('.id-employee')
  count = 0

  for (let index = 0; index < all_ids.length; index++) {
    if(all_ids[index].innerText == id){
      count++
    }
  }
  
  if(!count > 0){
    createEmployee(employee)
  }

}

function togglePage(){
  document.querySelector('.page-departments').classList.toggle("hidden")
  document.querySelector('.page-view-employee').classList.toggle("hidden")
}


// departments.forEach(("department", function(){
//     department.addEventListener("onclick", getDepartment(department))
// }))
