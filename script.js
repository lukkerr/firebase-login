var storage = firebase.storage();
var storageRef = storage.ref();
var boletosRef = storageRef.child('boleto');

firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      // User is signed in.
      document.getElementById("user_div").style.display = "block";
      document.getElementById("login_div").style.display = "none";
      var user = firebase.auth().currentUser;
      if (user != null){
        var email_id = user.email;        
        document.getElementById("userp").innerHTML = "<b>Bem-vindo: </b><i id='name'>" + email_id + "</i>";
      }
      option_user("1");
      let doc = document.getElementById("userbox");
      doc.style.display = "flex";
      docclick("1");
    } else{
      // No user is signed in.
      document.getElementById("user_div").style.display = "none";
      document.getElementById("login_div").style.display = "block";
      }
});

function login(){
    var userEmail = document.getElementById("email_field").value;
    var userPass = document.getElementById("password_field").value;
    firebase.auth().signInWithEmailAndPassword(userEmail, userPass).catch(function(error) {
      // Handle Errors here.
      var errorMessage = error.message;
      if(errorMessage == "The password is invalid or the user does not have a password."){
        window.alert("Senha inválida ou usuário não cadastrado.")
      }
      else if(errorMessage == "The email address is badly formatted."){
        window.alert("O endereço de email está mal formatado ou não foi preenchido.")
      }
      // ...
    });
}

function logout(){
  firebase.auth().signOut();
  document.getElementById("list").innerHTML = "";
  document.getElementById("userp").innerHTML = ""
  document.getElementById("uploader").value = "0";
  document.getElementById("filebutton").value = "";
  document.getElementById("boletos").checked == true;

}

function option_user(option){
  document.getElementById("uploader").value = "0";
  document.getElementById("filebutton").value = "";
  if(option == "1"){
    document.querySelector("label[for='boletos']").style.backgroundColor = "red"
    document.querySelector("label[for='mydoc']").style.backgroundColor = "gray"
  }else{
    document.querySelector("label[for='boletos']").style.backgroundColor = "gray"
    document.querySelector("label[for='mydoc']").style.backgroundColor = "red"
  }
}

function docclick(option){
  option == 1 ? document.getElementById("boletos").checked = true :
    document.getElementById("mydoc").checked = true;
  init_doc(firebase.auth().currentUser.email);
}

function init_doc(email){
  document.getElementById("list").innerHTML = ""
  document.getElementById("loading").style.display = "block"
  setTimeout(load,1000);
  if(document.getElementById("boletos").checked == true){
    document.getElementById("upload").style.display = "none"
    listar(email,"1")
  }
  else{
    document.getElementById("upload").style.display = "flex"
    listar(email,"2"); 
  }
}

//Listar
function listar(email,option){
  if(option == "1"){dir = "boleto/"}
  else{dir = "docs/"}
  var i=0;
  storageRef.child(dir + String(email).split("@")[0]).listAll().then(function(result){
    result.items.forEach(function(docRef){
      i++;
      displayDoc(docRef,i);
    });
  });
}
function displayDoc(docRef,i){
  docRef.getDownloadURL().then(function(url){
    var doc_name = String(docRef.toString().split("/")[5]);
    if(doc_name.length < document.getElementById("list").offsetWidth/12){
      list_doc = "<a style='order:" + i + "' href='" + url + "'>" + "<p class='docname'>" + doc_name + "</p>" + "</a><hr style='order:" + i + "'>";
    }
    //Formatação para Quebra de Linha;
    else{
      var lines = Math.floor(doc_name.length / Math.floor(document.getElementById("list").offsetWidth/12));
      let arrayline = [];
      for(var j = 1; j <= lines;j++){
        arrayline[j-1] = j;
      }
      var newname = ""
      var contline = 0;
      for(var x = 0;x < doc_name.length; x++){
        if(x  == (arrayline[contline] * Math.floor(document.getElementById("list").offsetWidth/12))){
          newname += "<br>" + doc_name[x];
          contline ++;
        }
        else{
          newname += doc_name[x]
        }
      }
      list_doc = "<a style='order:" + i + "' href='" + url + "'>" + "<p class='docname'>" + newname + "</p>" + "</a><hr style='order:" + i + "'>";
    }
    document.getElementById("list").insertAdjacentHTML("beforeend",list_doc);
  });
}
//$Listar

function load(){
  document.getElementById("loading").style.display = "none"
}

//Upload
    let uploader = document.getElementById("uploader");
    let filebutton = document.getElementById("filebutton");
    filebutton.addEventListener("change",function(e){
    let email = firebase.auth().currentUser.email;
    var file = e.target.files[0];
    var storageRef = firebase.storage().ref("docs/" + String(email).split("@")[0] + "/" + file.name);
    var task = storageRef.put(file);
    for(var p = 0; p < document.querySelectorAll(".docname").length;p++){
      if (document.querySelectorAll(".docname")[p].textContent == file.name){
        var conf = confirm("Arquivo já existente.\nDeseja sobreescrever arquivo antigo? ")
        if(conf == true){ break }
        else{
          uploader.value = 0;
          filebutton.value = ""
          return;}
      }
    }
    task.on("state_changed",
        function progress(snapshot){
            var porcetage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log(snapshot.totalBytes);
            uploader.value = porcetage;
            if(uploader.value == "100"){
              Swal.fire(
                'Bom Trabalho!',
                'Arquivo enviado com sucesso!',
                'success'
              ).then((result => {
                  uploader.value = 0;
                  filebutton.value = "";
                  docclick(2);
              }))
            }
        }
    )
})
// $Upload