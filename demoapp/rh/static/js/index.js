
function getDepartment(department){
    department_id = department.id
    fetch('/rh/get/employees/' + department_id, {
      method: 'GET',
    })
    .then(response => response.json())
    .then(data => {
      const myEmptyObj = {}
      if (!Object.keys(data).length == 0) {
        for (let i = 0; i < Object.keys(data.employees).length; i++) {
          verifyIfObjectAreCreated(data.employees[i], data.employees[i].employee_id)
        }
      }
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


function createEmployee(employee){
  const div_employee = document.createElement("div")
  div_employee.className = "employee"
  const div_pic_info_emp = document.createElement("div")
  div_pic_info_emp.className = "picture-info-employee"
  const div_emp_btn_view = document.createElement("div")
  div_emp_btn_view.className = "employee-btn-view"
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

departments = document.querySelectorAll(".btn-dept")
departments.forEach(department => {
    department.addEventListener("click", () =>{
      getDepartment(department)
    })
})


// departments.forEach(("department", function(){
//     department.addEventListener("onclick", getDepartment(department))
// }))
