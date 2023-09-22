
function getDepartment(department){
    department_id = department.id
    console.log(department_id)
    fetch('/rh/get/employees/' + department_id, {
        method: 'GET',
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
    })
    .catch(e => {
        console.log("Error: " + e)
    })


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
