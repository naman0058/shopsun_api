
let addgroup = []
let student = []
let table = 'partner'



$('#show').click(function(){
$.getJSON(`/${table}/show`, data => {
    console.log(data)
    student = data
    makeTable(data)
  
})
})



$('.save').click(function(){
  if($('#name').val()==[] || $('#name').val()=="") alert('Enter Name')
  else if($('#number').val()==[] || $('#number').val()=="") alert('Enter Mobile Number')
  else if($('#password').val()==[] || $('#password').val()=="") alert('Enter Password')
  else if($('#address').val()==[] || $('#address').val()=="") alert('Enter Address')

  else{
   let insertObj = {
    name : $('#name').val(),
    number:$('#number').val(),
    password:$('#password').val(),
    address:$('#address').val(),

   }
   $.post(`/${table}/insert`,insertObj,data=>{
    alert('Successfully Inserted')
   })
  }
})




function fillDropDown(id, data, label, selectedid = 0) {
    $(`#${id}`).empty()
    $(`#${id}`).append($('<option>').val("null").text(label))

    $.each(data, (i, item) => {
        if (item.id == selectedid) {
            $(`#${id}`).append($('<option selected>').val(item.id).text(item.name))
        } else {
            $(`#${id}`).append($('<option>').val(item.id).text(item.name))
        }
    })
}

    





function makeTable(board){
    let table = ` <div class="row mt-5">
    <div class="col">
      <div class="card bg-default shadow">
        <div class="card-header bg-transparent border-0">
          <h3 class="text-white mb-0">All BDA Partner List</h3>
          <br>
          <button type="button" id="back" class="btn btn-sm btn-primary">BacK</button>
        </div>
       
      
      
        <div class="table-responsive">
          <table class="table align-items-center table-dark table-flush">
            <thead class="thead-dark">
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Number</th>
                <th scope="col">Address</th>
                <th scope="col">Password</th>

              
                <th scope="col"></th>
              </tr>
            </thead>
            <tbody>
                  <tr>`
                  $.each(board, function(i, item) {
                    table += `<th scope="row">
                      <div class="media align-items-center">
                        <div class="media-body">
                        <a href='/partner-enquiry?id=${item.id}'>  <span class="mb-0 text-sm">${item.name}</span> </a>
                        </div>
                      </div>
                    </th>
                    


                    <th scope="row">
                      <div class="media align-items-center">
                        <div class="media-body">
                          <span class="mb-0 text-sm">${item.number}</span>
                        </div>
                      </div>
                    </th>


                    <th scope="row">
                      <div class="media align-items-center">
                        <div class="media-body">
                          <span class="mb-0 text-sm">${item.address}</span>
                        </div>
                      </div>
                    </th>


                    <th scope="row">
                      <div class="media align-items-center">
                        <div class="media-body">
                          <span class="mb-0 text-sm">${item.password}</span>
                        </div>
                      </div>
                    </th>
                   
                   


    

         
                    <td class="text-right">
                      <div class="dropdown">
                        <a class="btn btn-sm btn-icon-only text-light" href="#" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                          <i class="fas fa-ellipsis-v"></i>
                        </a>
                        <div class="dropdown-menu dropdown-menu-right dropdown-menu-arrow">
                        <button class=" dropdown-item btn btn-outline-success edit" id="${item.id}">Edit</button>
                        <button class=" dropdown-item btn btn-outline-success delete" id="${item.id}">Delete</button>
                      
                        </div>
                      </div>
                    </td>
                  </tr>`
                  })
                  
              table +=` </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>`
      $('#result').html(table)
      $('#insertdiv').hide()
      $('#result').show()
}


$('#result').on('click', '.delete', function() {
    const id = $(this).attr('id')
    $.get(`/${table}/delete`,  { id }, data => {
        refresh()
    })
})



$('#result').on('click', '.edit', function() {
    // alert('hi')
    const id = $(this).attr('id')
    const result = student.find(item => item.id == id);
    // fillDropDown('pgroupid', addgroup, 'Choose Quiz Name', result.name)
    $('#editdiv').show()
    $('#insertdiv').hide() 
    $('#result').hide()
    $('#pid').val(result.id)
   $('#ptestimonials').val(result.testimonials)
    $('#pname').val(result.name)
    $('#pnumber').val(result.number)
    $('#ppassword').val(result.password)
    $('#paddress').val(result.address)

    

 })


 
$('#update').click(function(){  //data insert in database
    let updateobj = {
        id: $('#pid').val(),
        number:$('#pnumber').val(),
        name: $('#pname').val(),
        address: $('#paddress').val(),
        password: $('#ppassword').val()

    }

    $.post(`/${table}/update`, updateobj , function(data) {
       update()
    })
})


function refresh() 
{
    $.getJSON(`/${table}/show`, data => makeTable(data))
}
function update()
{
    $('#result').show()
    $('#editdiv').hide()
    $('#insertdiv').show() 
    refresh()
    refresh()
}

//================================Page Functionality=============================//
$('#editdiv').hide()
$('#updateimagediv').hide()

$('#result').on('click', '#back', function() {
    $('#result').hide()
    $('#insertdiv').show()
})

$('#back1').click(function(){
    $('#result').show()
    $('#insertdiv').hide()
    $('#editdiv').hide()
    $('#updateimagediv').hide()

})

$('#back2').click(function(){
    $('#result').show()
    $('#insertdiv').hide()
    $('#editdiv').hide()
    $('#updateimagediv').hide()
})



$('#result').on('click', '.updateimage', function() {
    const id = $(this).attr('id')
    const result = student.find(item => item.id == id);
    $('#peid').val(result.id)
    $('#updateimagediv').show()
    $('#result').hide()
    $('#insertdiv').hide()
    $('#editdiv').hide()
})

//===================================Page Functioality Ends========================//