function validateForm(){
    var nume = document.getElementById("last_name").value
    var prenume = document.getElementById("first_name").value
    var username = document.getElementById("username").value
    var parola = document.getElementById("parola").value
    var rparola = document.getElementById("rparola").value
    var email = document.getElementById("email").value

    if(nume=="" || prenume=="" || username=="" || parola=="" || rparola=="" || email==""){
        alert("All required fields must be filled!")
        return false
    }
    return validateTelephone() && validatePasswords()
}

function validatePasswords(){
    var nume1 = document.getElementById("parola").value
    var nume2 = document.getElementById("rparola").value

    if(nume1 != "" && nume2!= ""){
        var rez = (nume1 == nume2)
        if(rez == false){
            alert("Parolele nu coincid")
            return false
        }
    }
    return true
}

function validateTelephone(){
    telefon = document.getElementById("teleph").value
    if (!telefon.match(new RegExp("^[0+]\\d{9,}"))){
        alert("Telefon incorect")
        return false
    }
    alert("functie")
    return true
}
